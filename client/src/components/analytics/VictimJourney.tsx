/**
 * VictimJourney — KSP Trinetra Sentinel
 * Case Milestone Swimlane with Bottleneck Highlighting
 *
 * Reads /api/v1/analytics/victim-journey/:caseMasterID and renders a
 * horizontal timeline showing: FIR → Arrest(s) → Chargesheet → Court
 */

'use client';

import React, { useEffect, useState, useCallback } from 'react';

// ── Types ──────────────────────────────────────────────────────────────────────
interface Milestone {
  event: string;
  date?: string | null;
  days_from_fir?: number | null;
  status: 'COMPLETED' | 'PENDING' | 'BOTTLENECK';
  subject?: string;
  pending_days?: number;
  bottleneck_note?: string | null;
  court_date?: string | null;
  next_hearing?: string | null;
}

interface CaseData {
  CaseMasterID: number;
  CrimeNo: string;
  fir_date: string;
  gravity: string;
  current_status: string;
}

interface JourneyData {
  case: CaseData;
  milestones: Milestone[];
  is_bottleneck: boolean;
}

interface Props {
  caseMasterID: number | null;
  onClose?: () => void;
}

// ── Milestone Node ─────────────────────────────────────────────────────────────
function MilestoneNode({ milestone, index, total }: { milestone: Milestone; index: number; total: number }) {
  const isLast = index === total - 1;

  const statusConfig = {
    COMPLETED:  { bg: 'bg-emerald-500',     ring: 'ring-emerald-400/40', text: 'text-emerald-400',   icon: '✓' },
    PENDING:    { bg: 'bg-amber-500',        ring: 'ring-amber-400/40',   text: 'text-amber-400',     icon: '⏳' },
    BOTTLENECK: { bg: 'bg-red-500 animate-pulse', ring: 'ring-red-500/40', text: 'text-red-400',    icon: '⚠' },
  }[milestone.status];

  return (
    <div className="flex flex-col items-center relative" style={{ minWidth: 110 }}>
      {/* Connector line (not for last) */}
      {!isLast && (
        <div className="absolute top-4 left-1/2 w-full h-0.5 bg-slate-700 z-0" style={{ left: '50%' }} />
      )}

      {/* Node circle */}
      <div className={`relative z-10 w-9 h-9 rounded-full ${statusConfig.bg} ring-4 ${statusConfig.ring} flex items-center justify-center text-white text-sm font-bold shadow-lg`}>
        {statusConfig.icon}
      </div>

      {/* Label */}
      <div className="mt-2 text-center max-w-[100px]">
        <p className="text-xs font-semibold text-slate-200 leading-tight">{milestone.event}</p>
        {milestone.subject && (
          <p className="text-xs text-slate-500 mt-0.5 truncate" title={milestone.subject}>{milestone.subject}</p>
        )}
        {milestone.date ? (
          <p className="text-xs text-slate-400 mt-1">{new Date(milestone.date).toLocaleDateString('en-IN')}</p>
        ) : (
          <p className={`text-xs mt-1 ${statusConfig.text}`}>
            {milestone.pending_days != null ? `${milestone.pending_days}d pending` : '—'}
          </p>
        )}
        {milestone.days_from_fir != null && (
          <p className="text-xs text-slate-500">Day {milestone.days_from_fir}</p>
        )}
        {milestone.next_hearing && (
          <p className="text-xs text-blue-400 mt-1">Next: {new Date(milestone.next_hearing).toLocaleDateString('en-IN')}</p>
        )}
      </div>

      {/* Bottleneck annotation */}
      {milestone.status === 'BOTTLENECK' && milestone.bottleneck_note && (
        <div className="mt-2 max-w-[110px] bg-red-900/40 border border-red-500/30 rounded p-1.5">
          <p className="text-xs text-red-300 leading-tight">{milestone.bottleneck_note}</p>
        </div>
      )}
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function VictimJourney({ caseMasterID, onClose }: Props) {
  const [data, setData] = useState<JourneyData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchJourney = useCallback(async () => {
    if (!caseMasterID) return;
    setLoading(true);
    setError(null);
    try {
      const base = process.env.NEXT_PUBLIC_API_BASE || '';
      const res = await fetch(`${base}/api/v1/analytics/victim-journey/${caseMasterID}`, {
        headers: { 'x-user-role': 'IO', 'x-employee-id': '1', 'x-unit-id': '1' },
      });
      if (!res.ok) throw new Error(`API error ${res.status}`);
      const json = await res.json();
      if (json.success) {
        setData({ case: json.case, milestones: json.milestones, is_bottleneck: json.isBottleneck });
      } else throw new Error(json.error || 'Unknown error');
    } catch (e: unknown) {
      // Synthetic demo fallback
      setData({
        case: {
          CaseMasterID: caseMasterID,
          CrimeNo: `KAR/${new Date().getFullYear()}/00${caseMasterID}`,
          fir_date: new Date(Date.now() - 45 * 86400000).toISOString(),
          gravity: 'Serious',
          current_status: 'Under Investigation',
        },
        is_bottleneck: true,
        milestones: [
          { event: 'FIR Registered',    date: new Date(Date.now() - 45 * 86400000).toISOString(), days_from_fir: 0,  status: 'COMPLETED' },
          { event: 'Arrest',            date: new Date(Date.now() - 30 * 86400000).toISOString(), days_from_fir: 15, status: 'COMPLETED', subject: 'Accused A' },
          { event: 'Chargesheet Pending', date: null, days_from_fir: null, pending_days: 45, status: 'BOTTLENECK',
            bottleneck_note: 'Overdue by 15 days beyond 60-day window' },
        ],
      });
      console.warn('[VictimJourney] API unavailable, using demo data:', e instanceof Error ? e.message : e);
    } finally {
      setLoading(false);
    }
  }, [caseMasterID]);

  useEffect(() => { fetchJourney(); }, [fetchJourney]);

  if (!caseMasterID) {
    return (
      <div className="flex items-center justify-center h-full text-slate-500 text-sm">
        Select a case to view its journey timeline.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 h-full text-slate-100">
      {/* Header */}
      <div className="flex items-center justify-between flex-shrink-0">
        <div>
          <h2 className="text-base font-semibold text-slate-100">Victim Journey / Case Timeline</h2>
          {data?.case && (
            <p className="text-xs text-slate-400 mt-0.5">
              Case: {data.case.CrimeNo} &nbsp;|&nbsp; {data.case.gravity} &nbsp;|&nbsp; {data.case.current_status}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <button
            id="journey-refresh-btn"
            onClick={fetchJourney}
            className="px-2 py-1 text-xs rounded bg-slate-800 text-slate-400 hover:bg-slate-700 transition-colors"
          >↻ Refresh</button>
          {onClose && (
            <button
              id="journey-close-btn"
              onClick={onClose}
              className="px-2 py-1 text-xs rounded bg-slate-800 text-slate-400 hover:bg-slate-700 transition-colors"
            >✕ Close</button>
          )}
        </div>
      </div>

      {/* Bottleneck Banner */}
      {data?.is_bottleneck && (
        <div className="bg-red-900/30 border border-red-500/30 rounded-xl px-4 py-3 flex items-start gap-3 flex-shrink-0 animate-pulse">
          <span className="text-red-400 text-lg">⚠</span>
          <div>
            <p className="text-sm font-semibold text-red-400">Investigation Bottleneck Detected</p>
            <p className="text-xs text-slate-400 mt-0.5">Chargesheet is overdue. Immediate IO review recommended.</p>
          </div>
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center h-40">
          <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full" />
        </div>
      )}

      {!loading && error && (
        <div className="bg-red-900/30 border border-red-500/30 rounded-lg p-3 text-xs text-red-400">{error}</div>
      )}

      {!loading && data && (
        <div className="flex-1 overflow-x-auto">
          {/* Timeline row */}
          <div className="flex items-start gap-0 min-w-max px-6 py-8">
            {data.milestones.map((milestone, i) => (
              <React.Fragment key={`${milestone.event}-${i}`}>
                <MilestoneNode
                  milestone={milestone}
                  index={i}
                  total={data.milestones.length}
                />
                {i < data.milestones.length - 1 && (
                  <div className="flex-shrink-0 w-12 flex items-start pt-4">
                    <div className="w-full h-0.5 bg-slate-700" />
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 px-6 mt-2">
            {[
              { color: 'bg-emerald-500', label: 'Completed' },
              { color: 'bg-amber-500',   label: 'Pending' },
              { color: 'bg-red-500',     label: 'Bottleneck' },
            ].map(l => (
              <div key={l.label} className="flex items-center gap-1.5">
                <div className={`w-2.5 h-2.5 rounded-full ${l.color}`} />
                <span className="text-xs text-slate-400">{l.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
