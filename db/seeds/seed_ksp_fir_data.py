"""
KSP Datathon 2026 - Synthetic KSP FIR Database Seeder
Fills CaseMaster, ComplainantDetails, Victim, Accused, ArrestSurrender, Employee, Unit, Act, Section tables.
"""

import json
import random
from datetime import datetime, timedelta

def generate_ksp_fir_dataset(num_cases=50):
    stations = [
        {"UnitID": 1044, "UnitName": "Indiranagar Police Station", "DistrictID": 30},
        {"UnitID": 1045, "UnitName": "Koramangala Police Station", "DistrictID": 30},
        {"UnitID": 1046, "UnitName": "Cubbon Park Police Station", "DistrictID": 30},
        {"UnitID": 1047, "UnitName": "Jayanagar Police Station", "DistrictID": 30},
        {"UnitID": 1048, "UnitName": "Whitefield Police Station", "DistrictID": 30},
    ]

    crime_heads = [
        {"CrimeHeadID": 1, "Name": "Crimes Against Person", "SubID": 101, "SubName": "Robbery / Extortion"},
        {"CrimeHeadID": 2, "Name": "Crimes Against Property", "SubID": 102, "SubName": "Two-Wheeler Theft"},
        {"CrimeHeadID": 3, "Name": "Cyber Crime", "SubID": 103, "SubName": "Financial Fraud"},
        {"CrimeHeadID": 4, "Name": "Women Safety", "SubID": 104, "SubName": "Stalking / Harassment"},
    ]

    cases = []
    complainants = []
    victims = []
    accused_list = []
    arrests = []

    for i in range(1, num_cases + 1):
        st = random.choice(stations)
        ch = random.choice(crime_heads)
        
        crime_no = f"1{st['UnitID']}2026{i:05d}"
        case_no = f"2026{i:05d}"
        reg_date = (datetime.now() - timedelta(days=random.randint(1, 90))).strftime("%Y-%m-%d %H:%M:%S")

        case = {
            "CaseMasterID": i,
            "CrimeNo": crime_no,
            "CaseNo": case_no,
            "CrimeRegisteredDate": reg_date,
            "PolicePersonID": random.randint(501, 510),
            "PoliceStationID": st["UnitID"],
            "CrimeMajorHeadID": ch["CrimeHeadID"],
            "CrimeMinorHeadID": ch["SubID"],
            "latitude": 12.9716 + random.uniform(-0.05, 0.05),
            "longitude": 77.5946 + random.uniform(-0.05, 0.05),
            "BriefFacts": f"Incident reported at {st['UnitName']}. Offence under {ch['SubName']}. Investigation underway."
        }
        cases.append(case)

        complainants.append({
            "ComplainantID": i,
            "CaseMasterID": i,
            "ComplainantName": f"Complainant_{i}",
            "AgeYear": random.randint(22, 60),
            "GenderID": random.choice([1, 2])
        })

        victims.append({
            "VictimMasterID": i,
            "CaseMasterID": i,
            "VictimName": f"Victim_{i}",
            "AgeYear": random.randint(18, 65),
            "GenderID": random.choice([1, 2])
        })

        accused_list.append({
            "AccusedMasterID": i,
            "CaseMasterID": i,
            "AccusedName": f"Suspect_Alpha_{i}",
            "AgeYear": random.randint(20, 45),
            "GenderID": 1,
            "PersonID": f"A{i}"
        })

        if random.random() > 0.4:
            arrests.append({
                "ArrestSurrenderID": i,
                "CaseMasterID": i,
                "ArrestSurrenderDate": reg_date[:10],
                "DistrictID": st["DistrictID"],
                "PoliceStationID": st["UnitID"],
                "AccusedMasterID": i
            })

    return {
        "cases": cases,
        "complainants": complainants,
        "victims": victims,
        "accused": accused_list,
        "arrests": arrests
    }

if __name__ == "__main__":
    dataset = generate_ksp_fir_dataset()
    with open("db/seeds/ksp_fir_dataset.json", "w") as f:
        json.dump(dataset, f, indent=2)
    print(f"[OK] Seeded {len(dataset['cases'])} KSP FIR records into db/seeds/ksp_fir_dataset.json")
