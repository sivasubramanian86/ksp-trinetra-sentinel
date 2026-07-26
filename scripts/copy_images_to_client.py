import os
import shutil

def copy_sample_images_to_client():
    src_dir = "data/sample_test_images"

    dest_dir = "client/public/sample_images"
    os.makedirs(dest_dir, exist_ok=True)

    files = ["ocr_test_plate.png", "document_test.png", "barcode_test.png"]
    for fname in files:
        src = os.path.join(src_dir, fname)
        dest = os.path.join(dest_dir, fname)
        if os.path.exists(src):
            shutil.copy(src, dest)
            print(f"[OK] Copied {fname} to {dest_dir}")

if __name__ == "__main__":
    copy_sample_images_to_client()
