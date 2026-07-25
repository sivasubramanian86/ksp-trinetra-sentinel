"""
Synthetic Incident and Entity Seeder Script for KSP Trinetra Sentinel
Generates realistic Karnataka State Police beat incidents, Kannada/English narratives, and syndicate nodes.
"""

import uuid
import datetime
import json

SYNTHETIC_INCIDENTS = [
    {
        "incident_number": "FIR-2026-IND-089",
        "incident_type": "CHAIN_SNATCHING",
        "crime_layer": "WOMEN_SAFETY",
        "occurred_at": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "station_code": "STN-INDIRANAGAR",
        "beat_id": "BNG-INDIRANAGAR-B1",
        "division": "BENGALURU_EAST",
        "narrative_kannada": "ಇಂದಿರಾನಗರ ೧೦ನೇ ಮೈನ್‌ನಲ್ಲಿ ಇಬ್ಬರು ಸವಾರರು ಮಹಿಳೆಯ ಚಿನ್ನದ ಸರವನ್ನು ಕಸಿದುಕೊಂಡು ಪರಾರಿಯಾಗಿದ್ದಾರೆ.",
        "narrative_english": "Two riders on a black motorcycle snatched a gold chain from a pedestrian on Indiranagar 10th Main.",
        "location": "SRID=4326;POINT(77.6408 12.9784)"
    },
    {
        "incident_number": "FIR-2026-KOR-112",
        "incident_type": "TWO_WHEELER_THEFT",
        "crime_layer": "STREET_CRIME",
        "occurred_at": (datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(hours=6)).isoformat(),
        "station_code": "STN-KORAMANGALA",
        "beat_id": "BNG-KORAMANGALA-B2",
        "division": "BENGALURU_SOUTH",
        "narrative_kannada": "ಕೋರಮಂಗಲ ೫ನೇ ಬ್ಲಾಕ್‌ನಲ್ಲಿ ನಿಲ್ಲಿಸಿದ್ದ ಯಮಹಾ ಬೈಕ್ ಕಳವಾಗಿದೆ.",
        "narrative_english": "Yamaha motorcycle stolen from Koramangala 5th Block parking area.",
        "location": "SRID=4326;POINT(77.6245 12.9352)"
    }
]

def main():
    print("=== KSP Trinetra Sentinel Synthetic Data Seeder ===")
    print(f"Generated {len(SYNTHETIC_INCIDENTS)} synthetic incidents with PostGIS spatial coordinates and Kannada/English narratives.")
    print("JSON Preview:")
    print(json.dumps(SYNTHETIC_INCIDENTS, indent=2, ensure_ascii=False))

if __name__ == "__main__":
    main()
