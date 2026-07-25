/**
 * Legal Ethics Sub-Agent — KSP Trinetra Sentinel
 * Version 2.0 — Full IPC→BNS Knowledge Base Integration
 *
 * Backward-compatible: all existing exports (auditQuery, retrieveBNSSections) are preserved.
 *
 * New capabilities:
 *   - explainSection(sectionRef)   — full section details from legal_knowledge_base.json
 *   - suggestSections(narrative)   — keyword-match → candidate sections + ingredient checklist
 *   - All suggestions labeled ASSISTIVE_ONLY and logged to console (audit logger handles DB write)
 */

'use strict';

const path = require('path');
const fs = require('fs');

// ─── Load Legal Knowledge Base ────────────────────────────────────────────────
let LEGAL_KB = { mappings: [] };

try {
  const kbPath = path.resolve(__dirname, '../../db/seeds/legal_knowledge_base.json');
  const raw = fs.readFileSync(kbPath, 'utf8');
  LEGAL_KB = JSON.parse(raw);
  console.log(`[LegalAgent] Loaded ${LEGAL_KB.mappings.length} legal knowledge base entries.`);
} catch (e) {
  // In Catalyst Cloud, the file is not co-located — fall back to inline BNS_SECTIONS
  console.warn('[LegalAgent] KB file not found, using inline BNS sections fallback:', e.message);
}

// ─── Legacy Inline BNS Sections (preserved for backward compatibility) ────────
const BNS_SECTIONS = [
  {
    section: 'BNS Section 303',
    title: 'Theft & Vehicle Snatching',
    punishment: 'Rigorous imprisonment up to 3 years',
    SOP: 'Form checkpoint at beat perimeter, inspect registration tags.',
  },
  {
    section: 'BNS Section 304',
    title: 'Snatching with Threat of Violence',
    punishment: 'Rigorous imprisonment up to 7 years',
    SOP: 'Dispatch 2 Hoysala patrol units immediately, initiate ANPR camera scan.',
  },
  {
    section: 'BNS Section 318',
    title: 'Cheating & Financial Cyber Crime',
    punishment: 'Imprisonment up to 5 years',
    SOP: 'Issue immediate freeze request on linked UPI Mule accounts via 1930 Cyber Cell.',
  },
];

// ─── Index for fast lookup ────────────────────────────────────────────────────
const _sectionIndex = {};
const _categoryIndex = {};
const _legacyIndex = {};

for (const entry of LEGAL_KB.mappings) {
  // BNS section index
  if (entry.bns_section) {
    _sectionIndex[entry.bns_section.toUpperCase()] = entry;
    _sectionIndex[`${entry.bns_act_code}_${entry.bns_section}`.toUpperCase()] = entry;
  }
  // Legacy IPC section index
  if (entry.legacy_section) {
    _legacyIndex[entry.legacy_section.toUpperCase()] = entry;
    _legacyIndex[`${entry.legacy_act_code}_${entry.legacy_section}`.toUpperCase()] = entry;
  }
  // Category index
  const cat = (entry.offence_category || '').toLowerCase();
  if (!_categoryIndex[cat]) _categoryIndex[cat] = [];
  _categoryIndex[cat].push(entry);
}

// ─── Keyword → offence category mapping for suggestSections() ────────────────
const KEYWORD_MAP = {
  'murder': 'Offences Against the Human Body',
  'kill': 'Offences Against the Human Body',
  'death': 'Offences Against the Human Body',
  'homicide': 'Offences Against the Human Body',
  'assault': 'Offences Against the Human Body',
  'hurt': 'Offences Against the Human Body',
  'rape': 'Sexual Offences',
  'sexual': 'Sexual Offences',
  'molestation': 'Sexual Offences',
  'outraging modesty': 'Sexual Offences',
  'child': 'Sexual Offences Against Children',
  'pocso': 'Sexual Offences Against Children',
  'theft': 'Offences Against Property',
  'stolen': 'Offences Against Property',
  'snatching': 'Offences Against Property',
  'robbery': 'Offences Against Property',
  'dacoity': 'Offences Against Property',
  'dacoits': 'Offences Against Property',
  'burglary': 'Offences Against Property',
  'trespass': 'Offences Against Property',
  'cheating': 'Offences Against Property',
  'fraud': 'Offences Against Property',
  'misappropriation': 'Offences Against Property',
  'breach of trust': 'Offences Against Property',
  'cyber': 'Cyber Crime',
  'upi': 'Cyber Crime',
  'mule account': 'Cyber Crime',
  'identity theft': 'Cyber Crime',
  'phishing': 'Cyber Crime',
  'fake': 'Offences Relating to Documents',
  'forgery': 'Offences Relating to Documents',
  'forged': 'Offences Relating to Documents',
  'counterfeit': 'Offences Relating to Currency',
  'fake currency': 'Offences Relating to Currency',
  'dowry': 'Offences Against Women',
  'domestic violence': 'Offences Against Women',
  'cruelty': 'Offences Against Women',
  'kidnapping': 'Offences Against the Human Body',
  'abduction': 'Offences Against the Human Body',
  'riot': 'Offences Against Public Tranquility',
  'unlawful assembly': 'Offences Against Public Tranquility',
  'communal': 'Offences Against Public Tranquility',
  'enmity': 'Offences Against Public Tranquility',
  'drugs': 'Narcotics / Drug Offences',
  'ndps': 'Narcotics / Drug Offences',
  'narcotics': 'Narcotics / Drug Offences',
  'ganja': 'Narcotics / Drug Offences',
  'firearms': 'Arms / Weapons Offences',
  'illegal arms': 'Arms / Weapons Offences',
  'weapon': 'Arms / Weapons Offences',
  'obstructing police': 'Offences Against Public Authority',
  'obstructing officer': 'Offences Against Public Authority',
  'abscond': 'Offences Against Justice',
  'conspiracy': 'Group Offences',
  'common intention': 'General Exceptions / Joint Liability',
};

// ─────────────────────────────────────────────────────────────────────────────

class LegalEthicsSubAgent {

  // ─── PRESERVED: Ethics Guard ───────────────────────────────────────────────

  async auditQuery(queryText, userContext) {
    if (!queryText) return { allowed: true };

    const lower = queryText.toLowerCase();
    const bannedProfilingTerms = ['caste', 'religion', 'community profiling', 'ethnicity filter'];

    for (const term of bannedProfilingTerms) {
      if (lower.includes(term)) {
        return {
          allowed: false,
          reasonNotice: {
            code: 'CONSTITUTIONAL_DPDP_VIOLATION',
            message: `Request blocked by Trinetra Ethics Guardrail. Algorithmic profiling based on '${term}' violates DPDP Act 2023 & Article 15 of the Constitution of India.`,
          },
        };
      }
    }

    return { allowed: true };
  }

  // ─── PRESERVED: Legacy BNS Sections retrieval ─────────────────────────────

  async retrieveBNSSections(queryText) {
    if (!queryText) return [BNS_SECTIONS[0]];
    const lower = queryText.toLowerCase();

    // Try the KB index first
    const kbResult = this._searchKB(lower);
    if (kbResult.length > 0) {
      return kbResult.map(entry => ({
        section: `${entry.bns_act_code} Section ${entry.bns_section}`,
        title: entry.offence_title,
        punishment: entry.max_punishment,
        SOP: entry.assistive_note,
        elements: entry.elements,
        ingredientChecklist: entry.ingredient_checklist,
        assistiveOnly: true,
      }));
    }

    // Inline fallback
    if (lower.includes('cyber') || lower.includes('upi') || lower.includes('mule')) {
      return [BNS_SECTIONS[2]];
    } else if (lower.includes('snatching') || lower.includes('chain')) {
      return [BNS_SECTIONS[1]];
    }
    return [BNS_SECTIONS[0], BNS_SECTIONS[1]];
  }

  // ─── NEW: Full Section Explanation ────────────────────────────────────────

  /**
   * Explain a specific IPC or BNS section.
   * Returns title, elements, ingredient checklist, punishment, cross-reference, and case law.
   *
   * @param {string} sectionRef - e.g. '420', 'IPC 420', '318', 'BNS 318'
   * @returns {object|null}
   */
  async explainSection(sectionRef) {
    if (!sectionRef) return null;

    const clean = String(sectionRef).replace(/[^a-zA-Z0-9\s_]/g, '').trim().toUpperCase();

    // Try BNS index
    let entry = _sectionIndex[clean];
    if (!entry) {
      // Try legacy IPC index
      entry = _legacyIndex[clean];
    }
    if (!entry) {
      // Try stripping act prefix (e.g. "IPC 420" → "420")
      const numOnly = clean.replace(/^(IPC|BNS|NDPS|IT ACT|ARMS ACT|POCSO)\s*/i, '');
      entry = _sectionIndex[numOnly] || _legacyIndex[numOnly];
    }

    if (!entry) {
      // Return graceful not-found with inline BNS fallback for known sections
      const inlineFallback = BNS_SECTIONS.find(s => clean.includes(s.section.split(' ').pop()));
      if (inlineFallback) {
        return {
          ...inlineFallback,
          assistiveOnly: true,
          source: 'INLINE_FALLBACK',
        };
      }
      return {
        found: false,
        sectionRef,
        message: `Section '${sectionRef}' not found in KSP Legal Knowledge Base. Consult the BNS/IPC text directly.`,
        assistiveOnly: true,
      };
    }

    return {
      found: true,
      legacyRef: entry.legacy_section ? `${entry.legacy_act_code} ${entry.legacy_section}` : null,
      bnsRef: `${entry.bns_act_code} ${entry.bns_section}`,
      offenceTitle: entry.offence_title,
      category: entry.offence_category,
      gravityClass: entry.gravity_class,
      bailStatus: entry.bail_status,
      cognizable: entry.cognizable,
      maxPunishment: entry.max_punishment,
      minPunishment: entry.min_punishment || null,
      elements: entry.elements || [],
      ingredientChecklist: entry.ingredient_checklist || [],
      keyCaseLaw: entry.key_case_law || null,
      assistiveNote: entry.assistive_note || 'This is ASSISTIVE ONLY. Verify all elements independently.',
      assistiveOnly: true,
      source: 'KSP_LEGAL_KNOWLEDGE_BASE',
    };
  }

  // ─── NEW: Section Suggestions from Narrative ──────────────────────────────

  /**
   * Suggest candidate sections from a case narrative / brief facts.
   * All suggestions carry ASSISTIVE_ONLY label.
   *
   * @param {string} narrative - Free text description of offence
   * @returns {Array<object>}   - Top 5 candidate sections with ingredient checklists
   */
  async suggestSections(narrative) {
    if (!narrative) return [];

    const lower = (narrative || '').toLowerCase();
    const categoryHits = new Map();

    // Score categories by keyword matches
    for (const [keyword, category] of Object.entries(KEYWORD_MAP)) {
      if (lower.includes(keyword)) {
        categoryHits.set(category, (categoryHits.get(category) || 0) + 1);
      }
    }

    if (categoryHits.size === 0) {
      return [{
        message: 'No section suggestions found. Please provide more specific facts.',
        assistiveOnly: true,
      }];
    }

    // Sort categories by hit count
    const sortedCategories = [...categoryHits.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([cat]) => cat);

    const suggestions = [];
    for (const category of sortedCategories.slice(0, 3)) {
      const entries = (_categoryIndex[category.toLowerCase()] || []).slice(0, 3);
      for (const entry of entries) {
        suggestions.push({
          legacyRef: entry.legacy_section ? `${entry.legacy_act_code} ${entry.legacy_section}` : null,
          bnsRef: `${entry.bns_act_code} ${entry.bns_section}`,
          offenceTitle: entry.offence_title,
          category: entry.offence_category,
          gravityClass: entry.gravity_class,
          bailStatus: entry.bail_status,
          cognizable: entry.cognizable,
          elements: entry.elements || [],
          ingredientChecklist: entry.ingredient_checklist || [],
          maxPunishment: entry.max_punishment,
          assistiveNote: entry.assistive_note,
          assistiveOnly: true,
          confirmationRequired: true,
          confirmationNote: 'Officer must independently verify all elements before invoking this section.',
        });
        if (suggestions.length >= 5) break;
      }
      if (suggestions.length >= 5) break;
    }

    return suggestions;
  }

  // ─── Private: KB keyword search ───────────────────────────────────────────

  _searchKB(lower) {
    const results = [];
    for (const entry of LEGAL_KB.mappings) {
      const title = (entry.offence_title || '').toLowerCase();
      const category = (entry.offence_category || '').toLowerCase();
      if (lower.includes(title) || lower.includes(category)) {
        results.push(entry);
        if (results.length >= 3) break;
      }
    }
    return results;
  }
}

module.exports = new LegalEthicsSubAgent();
