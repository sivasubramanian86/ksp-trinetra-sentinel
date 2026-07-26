"""
Export All 12 Police FIR ER Schema Tables to CSV
KSP Trinetra Sentinel
"""

import json

import csv
import os

def generate_all_csvs():
    output_dir = "db/seeds"
    os.makedirs(output_dir, exist_ok=True)
    
    # Load base dataset
    dataset_path = os.path.join(output_dir, "ksp_fir_dataset.json")
    with open(dataset_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    cases = data.get("cases", [])
    accused_list = data.get("accused", [])
    victims_list = data.get("victims", [])

    print("====================================================")
    print("Generating CSV Seed Files for All 12 Tables")
    print("====================================================\n")


    # 1. CaseMaster.csv
    keys = ["CaseMasterID", "CrimeNo", "CaseNo", "CrimeRegisteredDate", "PolicePersonID", "PoliceStationID", "CrimeMajorHeadID", "CrimeMinorHeadID", "latitude", "longitude", "BriefFacts"]
    with open(os.path.join(output_dir, "CaseMaster.csv"), "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=keys, extrasaction="ignore")
        writer.writeheader()
        for row in cases:
            writer.writerow({
                "CaseMasterID": row.get("CaseMasterID"),
                "CrimeNo": row.get("CrimeNo"),
                "CaseNo": row.get("CaseNo"),
                "CrimeRegisteredDate": row.get("CrimeRegisteredDate", "2026-05-15 10:00:00"),
                "PolicePersonID": row.get("PolicePersonID", 501),
                "PoliceStationID": row.get("PoliceStationID", 1047),
                "CrimeMajorHeadID": row.get("CrimeMajorHeadID", 1),
                "CrimeMinorHeadID": row.get("CrimeMinorHeadID", 101),
                "latitude": row.get("latitude", 12.9716),
                "longitude": row.get("longitude", 77.5946),
                "BriefFacts": row.get("BriefFacts", "FIR registered under BNS 2023.")
            })
    print("[OK] Generated db/seeds/CaseMaster.csv")

    # 2. Accused.csv
    keys = ["AccusedID", "CaseMasterID", "AccusedName", "PersonID"]
    with open(os.path.join(output_dir, "Accused.csv"), "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=keys, extrasaction="ignore")
        writer.writeheader()
        for idx, row in enumerate(accused_list, start=1):
            writer.writerow({
                "AccusedID": idx,
                "CaseMasterID": row.get("CaseMasterID", (idx % len(cases)) + 1),
                "AccusedName": row.get("AccusedName", "Unknown Accused"),
                "PersonID": row.get("PersonID", f"P-{100 + idx}")
            })
    print("[OK] Generated db/seeds/Accused.csv")

    # 3. Victim.csv
    keys = ["VictimID", "CaseMasterID", "VictimName"]
    with open(os.path.join(output_dir, "Victim.csv"), "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=keys, extrasaction="ignore")
        writer.writeheader()
        for idx, row in enumerate(victims_list, start=1):
            writer.writerow({
                "VictimID": idx,
                "CaseMasterID": row.get("CaseMasterID", (idx % len(cases)) + 1),
                "VictimName": row.get("VictimName", "Unknown Victim")
            })
    print("[OK] Generated db/seeds/Victim.csv")

    # 4. Person.csv
    keys = ["PersonID", "Name", "Gender", "Age", "MobileNo", "Address"]
    persons = []
    for i in range(1, 31):
        persons.append({
            "PersonID": f"P-{100 + i}",
            "Name": f"Person_{i}",
            "Gender": "Male" if i % 2 == 0 else "Female",
            "Age": 20 + (i % 40),
            "MobileNo": f"98860{10000 + i}",
            "Address": f"Beat #{ (i % 5) + 1 }, Indiranagar / Jayanagar, Bengaluru"
        })
    with open(os.path.join(output_dir, "Person.csv"), "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=keys)
        writer.writeheader()
        for p in persons:
            writer.writerow(p)
    print("[OK] Generated db/seeds/Person.csv")

    # 5. ActSectionAssociation.csv
    keys = ["AssociationID", "CaseMasterID", "ActCode", "SectionCode"]
    associations = []
    sections = ["BNS Section 303", "BNS Section 304", "BNS Section 111", "BNS Section 318", "BNS Section 103"]
    for idx, c in enumerate(cases, start=1):
        associations.append({
            "AssociationID": idx,
            "CaseMasterID": c.get("CaseMasterID", idx),
            "ActCode": "BNS_2023",
            "SectionCode": sections[idx % len(sections)]
        })
    with open(os.path.join(output_dir, "ActSectionAssociation.csv"), "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=keys)
        writer.writeheader()
        for a in associations:
            writer.writerow(a)
    print("[OK] Generated db/seeds/ActSectionAssociation.csv")

    # 6. ChargesheetDetails.csv
    keys = ["ChargesheetID", "CaseMasterID", "ChargesheetNo", "FilingDate", "DelayDays", "IOEmployeeID"]
    chargesheets = []
    for idx, c in enumerate(cases[:25], start=1):
        chargesheets.append({
            "ChargesheetID": idx,
            "CaseMasterID": c.get("CaseMasterID", idx),
            "ChargesheetNo": f"CS-2026-{1000 + idx}",
            "FilingDate": "2026-06-20 14:00:00",
            "DelayDays": (idx * 3) % 45,
            "IOEmployeeID": 501 + (idx % 10)
        })
    with open(os.path.join(output_dir, "ChargesheetDetails.csv"), "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=keys)
        writer.writeheader()
        for cs in chargesheets:
            writer.writerow(cs)
    print("[OK] Generated db/seeds/ChargesheetDetails.csv")

    # 7. PoliceStation.csv
    keys = ["PoliceStationID", "StationName", "DistrictID", "ZoneName"]
    stations = [
        {"PoliceStationID": 1047, "StationName": "Jayanagar PS", "DistrictID": 10, "ZoneName": "Bengaluru South"},
        {"PoliceStationID": 1046, "StationName": "Cubbon Park PS", "DistrictID": 10, "ZoneName": "Bengaluru Central"},
        {"PoliceStationID": 1048, "StationName": "Whitefield PS", "DistrictID": 10, "ZoneName": "Bengaluru East"},
        {"PoliceStationID": 1049, "StationName": "Indiranagar PS", "DistrictID": 10, "ZoneName": "Bengaluru East"},
        {"PoliceStationID": 1050, "StationName": "Koramangala PS", "DistrictID": 10, "ZoneName": "Bengaluru South"},
    ]
    with open(os.path.join(output_dir, "PoliceStation.csv"), "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=keys)
        writer.writeheader()
        for st in stations:
            writer.writerow(st)
    print("[OK] Generated db/seeds/PoliceStation.csv")

    # 8. CrimeHead.csv
    keys = ["CrimeMajorHeadID", "CrimeMinorHeadID", "MajorHeadName", "MinorHeadName"]
    crime_heads = [
        {"CrimeMajorHeadID": 1, "CrimeMinorHeadID": 101, "MajorHeadName": "OFFENCES AGAINST PROPERTY", "MinorHeadName": "Robbery / Extortion"},
        {"CrimeMajorHeadID": 1, "CrimeMinorHeadID": 102, "MajorHeadName": "OFFENCES AGAINST PROPERTY", "MinorHeadName": "Theft / Vehicle Snatching"},
        {"CrimeMajorHeadID": 2, "CrimeMinorHeadID": 201, "MajorHeadName": "OFFENCES AGAINST PERSON", "MinorHeadName": "Murder / Culpable Homicide"},
        {"CrimeMajorHeadID": 3, "CrimeMinorHeadID": 301, "MajorHeadName": "CYBER CRIME", "MinorHeadName": "Financial Fraud / Phishing"},
        {"CrimeMajorHeadID": 4, "CrimeMinorHeadID": 104, "MajorHeadName": "WOMEN SAFETY", "MinorHeadName": "Stalking / Harassment"},
    ]
    with open(os.path.join(output_dir, "CrimeHead.csv"), "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=keys)
        writer.writeheader()
        for ch in crime_heads:
            writer.writerow(ch)
    print("[OK] Generated db/seeds/CrimeHead.csv")

    # 9. Employee.csv
    keys = ["EmployeeID", "EmployeeName", "RankName", "ClearanceLevel", "PoliceStationID"]
    employees = [
        {"EmployeeID": 501, "EmployeeName": "Inspector K. Sharma", "RankName": "INSPECTOR", "ClearanceLevel": 4, "PoliceStationID": 1047},
        {"EmployeeID": 504, "EmployeeName": "PSI Rajesh Kumar", "RankName": "PSI", "ClearanceLevel": 3, "PoliceStationID": 1046},
        {"EmployeeID": 505, "EmployeeName": "ASI Venkatesh M.", "RankName": "ASI", "ClearanceLevel": 2, "PoliceStationID": 1046},
        {"EmployeeID": 507, "EmployeeName": "Inspector Suresh Gowda", "RankName": "INSPECTOR", "ClearanceLevel": 4, "PoliceStationID": 1048},
        {"EmployeeID": 510, "EmployeeName": "DySP Anitha Reddy", "RankName": "DySP", "ClearanceLevel": 5, "PoliceStationID": 1049},
    ]
    with open(os.path.join(output_dir, "Employee.csv"), "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=keys)
        writer.writeheader()
        for emp in employees:
            writer.writerow(emp)
    print("[OK] Generated db/seeds/Employee.csv")

    # 10. AuditLog.csv
    keys = ["EmployeeID", "UnitID", "ActionType", "ResourceType", "ResourceID", "QueryText", "IPAddress", "ResponseStatus", "PIIMasked", "AssistiveOnly", "CreatedAt"]
    audit_logs = [
        {"EmployeeID": 501, "UnitID": 1047, "ActionType": "COPILOT_QUERY", "ResourceType": "CaseMaster", "ResourceID": "202600001", "QueryText": "Indiranagar snatching cases", "IPAddress": "10.14.0.12", "ResponseStatus": 200, "PIIMasked": True, "AssistiveOnly": True, "CreatedAt": "2026-07-25 18:00:00"},
        {"EmployeeID": 510, "UnitID": 1049, "ActionType": "HOTSPOT_FORECAST", "ResourceType": "Forecast", "ResourceID": "BNG-INDIRANAGAR-B1", "QueryText": "Night patrol risk scores", "IPAddress": "10.14.0.18", "ResponseStatus": 200, "PIIMasked": True, "AssistiveOnly": False, "CreatedAt": "2026-07-25 19:30:00"},
    ]
    with open(os.path.join(output_dir, "AuditLog.csv"), "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=keys)
        writer.writeheader()
        for al in audit_logs:
            writer.writerow(al)
    print("[OK] Generated db/seeds/AuditLog.csv")

    # 11. OperationPlan.csv
    keys = ["PlanName", "PlanType", "Status", "ResponsibleUnitID", "CreatedByID", "OperationDate", "PatrolRoutes", "ResourceAllocation", "BriefingNotes"]
    ops = [
        {"PlanName": "Indiranagar Beat #1 Night Patrol", "PlanType": "PATROL_DISPATCH", "Status": "ACTIVE", "ResponsibleUnitID": 1049, "CreatedByID": 510, "OperationDate": "2026-07-26 22:00:00", "PatrolRoutes": "100ft Road -> 12th Main -> CMH Road", "ResourceAllocation": "2 Hoysala Units, 4 Beat Officers", "BriefingNotes": "Focus on BNS 304 Snatching prevention."}
    ]
    with open(os.path.join(output_dir, "OperationPlan.csv"), "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=keys)
        writer.writeheader()
        for op in ops:
            writer.writerow(op)
    print("[OK] Generated db/seeds/OperationPlan.csv")

    # 12. DashboardPreset.csv
    keys = ["EmployeeID", "PresetName", "Module", "Filters", "IsDefault"]
    presets = [
        {"EmployeeID": 501, "PresetName": "Daily DG Overview", "Module": "DG_SNAPSHOT", "Filters": "{\"zone\":\"Bengaluru East\",\"timeframe\":\"24h\"}", "IsDefault": True}
    ]
    with open(os.path.join(output_dir, "DashboardPreset.csv"), "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=keys)
        writer.writeheader()
        for pr in presets:
            writer.writerow(pr)
    console_summary = "\n[SUCCESS] All 12 CSV Seed Files successfully created in db/seeds/!"
    print(console_summary)


if __name__ == "__main__":
    generate_all_csvs()
