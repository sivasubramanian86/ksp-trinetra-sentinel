import os
import glob
import base64
import json
from PIL import Image

def process_generated_images():
    brain_dir = r"C:\Users\USER\.gemini\antigravity-ide\brain\688bdeef-5b34-4772-88dc-6a4fd3ee86bc"
    
    mapping = {
        "crime_scene_test.png": "real_forensic_crime_scene_*.png",
        "ocr_test_plate.png": "real_cctv_anpr_plate_*.png",
        "traffic_jump_test.png": "real_traffic_signal_jump_*.png",
    }

    target_dirs = [
        "data/sample_test_images",
        "client/public/sample_images",
        "client/out/sample_images"
    ]

    for d in target_dirs:
        os.makedirs(d, exist_ok=True)

    # Read existing sampleImagesData if any
    b64_dict = {}

    for target_filename, pattern in mapping.items():
        search_path = os.path.join(brain_dir, pattern)
        matches = glob.glob(search_path)
        if matches:
            latest_match = matches[-1]
            print(f"[+] Found generated image for {target_filename}: {latest_match}")
            img = Image.open(latest_match)
            
            for d in target_dirs:
                dest_path = os.path.join(d, target_filename)
                img.save(dest_path)
                print(f"[OK] Saved {target_filename} to {dest_path}")

            with open(os.path.join(target_dirs[0], target_filename), "rb") as f:
                b64_str = base64.b64encode(f.read()).decode("utf-8")
                b64_dict[target_filename] = f"data:image/png;base64,{b64_str}"

    # Also keep synthetic fallbacks for document_test, barcode_test, civil_crime_test if present
    for fname in ["document_test.png", "barcode_test.png", "civil_crime_test.png"]:
        p = os.path.join(target_dirs[0], fname)
        if os.path.exists(p):
            with open(p, "rb") as f:
                b64_str = base64.b64encode(f.read()).decode("utf-8")
                b64_dict[fname] = f"data:image/png;base64,{b64_str}"

    # Write updated sampleImagesData.ts
    ts_file = "client/src/components/forensics/sampleImagesData.ts"
    with open(ts_file, "w") as f:
        f.write(f"// Auto-generated sample evidence base64 data fallback\nexport const SAMPLE_IMAGES_DATA: Record<string, string> = {json.dumps(b64_dict, indent=2)};\n")
    print(f"[OK] Updated {ts_file} with realistic AI generated image base64 data!")

if __name__ == "__main__":
    process_generated_images()
