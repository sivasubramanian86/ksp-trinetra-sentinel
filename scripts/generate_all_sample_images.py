import os
import base64
import json
from PIL import Image, ImageDraw

def create_all_sample_images():
    output_dirs = [
        "scripts/sample_test_images",
        "client/public/sample_images",
        "client/out/sample_images"
    ]
    for d in output_dirs:
        os.makedirs(d, exist_ok=True)

    images_data = {}

    # 1. License Plate ANPR
    img1 = Image.new("RGB", (500, 150), color=(15, 23, 42))
    d1 = ImageDraw.Draw(img1)
    d1.rectangle([10, 10, 490, 140], outline=(6, 182, 212), width=3)
    d1.rectangle([30, 25, 470, 125], fill=(248, 250, 252), outline=(15, 23, 42), width=4)
    d1.rectangle([35, 30, 75, 120], fill=(2, 132, 199))
    d1.text((45, 60), "IND", fill=(255, 255, 255))
    d1.text((100, 50), "KA 01 EQ 1234", fill=(15, 23, 42))
    save_and_encode("ocr_test_plate.png", img1, images_data)

    # 2. FIR Legal Report Document OCR
    img2 = Image.new("RGB", (600, 260), color=(255, 255, 255))
    d2 = ImageDraw.Draw(img2)
    d2.rectangle([5, 5, 595, 255], outline=(226, 232, 240), width=2)
    d2.rectangle([20, 20, 580, 50], fill=(15, 23, 42))
    d2.text((160, 28), "KARNATAKA STATE POLICE - FIR REPORT", fill=(255, 255, 255))
    d2.text((30, 70), "DISTRICT: BENGALURU CITY | POLICE STATION: INDIRANAGAR PS", fill=(15, 23, 42))
    d2.text((30, 100), "FIR NO: 1044/2026 | DATE: 25/07/2026 | TIME: 02:15 AM", fill=(15, 23, 42))
    d2.text((30, 130), "OFFENCE SECTION: BNS SECTION 303 (SNATCHING / ROBBERY)", fill=(185, 28, 28))
    d2.text((30, 160), "BRIEF FACTS: Two-wheeler stolen near 100ft Road junction.", fill=(15, 23, 42))
    d2.text((30, 190), "ZIA OCR AUDIT STATUS: VERIFIED & PARSED", fill=(16, 185, 129))
    save_and_encode("document_test.png", img2, images_data)

    # 3. Seized Property Barcode Tag
    img3 = Image.new("RGB", (500, 180), color=(241, 245, 249))
    d3 = ImageDraw.Draw(img3)
    d3.rectangle([10, 10, 490, 170], outline=(100, 116, 139), width=3)
    d3.text((30, 25), "KSP FORENSIC EVIDENCE CHAIN-OF-CUSTODY", fill=(15, 23, 42))
    for x in range(50, 450, 10):
        w = 3 if x % 3 == 0 else 6
        d3.line([(x, 55), (x, 125)], fill=(15, 23, 42), width=w)
    d3.text((140, 135), "* 8901234567890 *", fill=(15, 23, 42))
    save_and_encode("barcode_test.png", img3, images_data)

    # 4. Forensic Crime Scene Analysis (Ballistics & Shell Casing)
    img4 = Image.new("RGB", (600, 260), color=(15, 23, 42))
    d4 = ImageDraw.Draw(img4)
    d4.rectangle([10, 10, 590, 250], outline=(239, 68, 68), width=3)
    d4.text((30, 20), "[!] CRIME SCENE FORENSIC DISSECTION - EVIDENCE #7", fill=(239, 68, 68))
    # Draw Evidence Marker Tag #7
    d4.polygon([(50, 180), (110, 60), (170, 180)], fill=(251, 191, 36), outline=(0, 0, 0))
    d4.text((100, 110), "7", fill=(0, 0, 0))
    # Draw shell casing outline
    d4.rectangle([220, 90, 360, 160], outline=(245, 158, 11), width=3)
    d4.text((230, 105), "9mm Brass Casing", fill=(255, 255, 255))
    d4.text((230, 130), "Striation Match: 94.2%", fill=(16, 185, 129))
    d4.text((390, 80), "METADATA DISSECTION:", fill=(6, 182, 212))
    d4.text((390, 110), "Location: Indiranagar 100ft", fill=(203, 213, 225))
    d4.text((390, 135), "Tool: GSR Spectrum Scan", fill=(203, 213, 225))
    d4.text((390, 160), "Contradiction: NONE", fill=(16, 185, 129))
    save_and_encode("crime_scene_test.png", img4, images_data)

    # 5. Traffic Signal Red Light Jump Violation
    img5 = Image.new("RGB", (600, 260), color=(15, 23, 42))
    d5 = ImageDraw.Draw(img5)
    d5.rectangle([10, 10, 590, 250], outline=(245, 158, 11), width=3)
    d5.text((30, 20), "TRAFFIC CCTV ANPR - RED LIGHT VIOLATION AT MG ROAD", fill=(245, 158, 11))
    # Draw traffic light red signal
    d5.rectangle([40, 60, 100, 220], fill=(30, 41, 59), outline=(148, 163, 184), width=2)
    d5.ellipse([50, 70, 90, 110], fill=(239, 68, 68)) # Red ON
    d5.ellipse([50, 120, 90, 160], fill=(71, 85, 105)) # Yellow OFF
    d5.ellipse([50, 170, 90, 210], fill=(71, 85, 105)) # Green OFF
    # Bounding Box over vehicle
    d5.rectangle([140, 80, 560, 220], outline=(239, 68, 68), width=3)
    d5.text((150, 90), "ANPR Bounding Box: Vehicle KA-05-MB-8899", fill=(239, 68, 68))
    d5.text((150, 120), "Speed: 68 km/h (Zone Limit: 40 km/h)", fill=(255, 255, 255))
    d5.text((150, 150), "Violation: Signal Jump + Reckless Driving", fill=(239, 68, 68))
    d5.text((150, 180), "BNS Section 281 / Motor Vehicles Act Sec 184", fill=(6, 182, 212))
    save_and_encode("traffic_jump_test.png", img5, images_data)

    # 6. Civil Crime / Land Encroachment & Property Dispute Document
    img6 = Image.new("RGB", (600, 260), color=(255, 255, 255))
    d6 = ImageDraw.Draw(img6)
    d6.rectangle([5, 5, 595, 255], outline=(226, 232, 240), width=2)
    d6.rectangle([20, 20, 580, 50], fill=(30, 58, 138))
    d6.text((130, 28), "GOVERNMENT OF KARNATAKA - LAND SURVEY REPORT", fill=(255, 255, 255))
    d6.text((30, 70), "TALUK: BENGALURU EAST | SURVEY NO: 42/1 INDIRANAGAR", fill=(15, 23, 42))
    d6.text((30, 100), "DISPUTE TYPE: Civil Encroachment & Illegal Boundary Construction", fill=(185, 28, 28))
    d6.text((30, 130), "COMPLAINANT: Resident Association | RESPONDENT: Builder Alpha", fill=(15, 23, 42))
    d6.text((30, 160), "ZIA DOCUMENT AUDIT: Forged Stamp Signature Detected (Match 42%)", fill=(225, 29, 72))
    d6.text((30, 190), "RECOMMENDED ACTION: Injunction under BNS Section 318 (Fraud/Forgery)", fill=(30, 58, 138))
    save_and_encode("civil_crime_test.png", img6, images_data)

    # Write TypeScript helper file with inline base64 fallback data
    ts_content = f"// Auto-generated sample evidence base64 data fallback\nexport const SAMPLE_IMAGES_DATA: Record<string, string> = {json.dumps(images_data, indent=2)};\n"
    with open("client/src/components/forensics/sampleImagesData.ts", "w") as f:
        f.write(ts_content)
    print("[OK] Generated client/src/components/forensics/sampleImagesData.ts with inline base64 fallbacks!")

def save_and_encode(filename, img, data_dict):
    paths = [
        os.path.join("scripts/sample_test_images", filename),
        os.path.join("client/public/sample_images", filename),
        os.path.join("client/out/sample_images", filename),
    ]
    for p in paths:
        img.save(p)

    with open(paths[0], "rb") as f:
        b64 = base64.b64encode(f.read()).decode("utf-8")
        data_dict[filename] = f"data:image/png;base64,{b64}"
    print(f"[OK] Saved {filename} across static directories and encoded base64.")

if __name__ == "__main__":
    create_all_sample_images()
