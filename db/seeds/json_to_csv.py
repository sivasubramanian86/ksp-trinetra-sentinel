import json
import csv

def convert_json_to_csv():
    with open("db/seeds/ksp_fir_dataset.json", "r") as f:
        data = json.load(f)

    # 1. CaseMaster
    if "cases" in data and len(data["cases"]) > 0:
        keys = ["CaseMasterID", "CrimeNo", "CaseNo", "CrimeRegisteredDate", "PolicePersonID", "PoliceStationID", "CrimeMajorHeadID", "CrimeMinorHeadID", "latitude", "longitude", "BriefFacts"]
        with open("db/seeds/CaseMaster.csv", "w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=keys, extrasaction="ignore")
            writer.writeheader()
            for row in data["cases"]:
                writer.writerow(row)
        print("[OK] Exported db/seeds/CaseMaster.csv")

    # 2. Accused
    if "accused" in data and len(data["accused"]) > 0:
        keys = ["AccusedID", "CaseMasterID", "AccusedName", "PersonID"]
        with open("db/seeds/Accused.csv", "w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=keys, extrasaction="ignore")
            writer.writeheader()
            for row in data["accused"]:
                writer.writerow(row)
        print("[OK] Exported db/seeds/Accused.csv")

    # 3. Victim
    if "victims" in data and len(data["victims"]) > 0:
        keys = ["VictimID", "CaseMasterID", "VictimName"]
        with open("db/seeds/Victim.csv", "w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=keys, extrasaction="ignore")
            writer.writeheader()
            for row in data["victims"]:
                writer.writerow(row)
        print("[OK] Exported db/seeds/Victim.csv")


if __name__ == "__main__":
    convert_json_to_csv()
