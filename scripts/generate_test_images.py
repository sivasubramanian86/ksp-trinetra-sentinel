import os
from PIL import Image, ImageDraw, ImageFont

def generate_test_images():
    os.makedirs("scripts/sample_test_images", exist_ok=True)

    # 1. OCR Test Image (Vehicle License Plate)
    img_ocr = Image.new("RGB", (400, 100), color=(255, 255, 255))
    draw = ImageDraw.Draw(img_ocr)
    draw.rectangle([5, 5, 395, 95], outline=(0, 0, 0), width=4)
    draw.text((30, 30), "KA-01-EQ-1234", fill=(0, 0, 0))
    img_ocr.save("scripts/sample_test_images/ocr_test_plate.png")
    print("[OK] Generated scripts/sample_test_images/ocr_test_plate.png")

    # 2. Document OCR Test Image
    img_doc = Image.new("RGB", (600, 200), color=(255, 255, 255))
    draw_doc = ImageDraw.Draw(img_doc)
    draw_doc.text((20, 20), "KARNATAKA STATE POLICE", fill=(0, 0, 0))
    draw_doc.text((20, 60), "INDIRANAGAR PS - FIR NO 1044/2026", fill=(0, 0, 0))
    draw_doc.text((20, 100), "OFFENCE UNDER BNS SECTION 303", fill=(0, 0, 0))
    img_doc.save("scripts/sample_test_images/document_test.png")
    print("[OK] Generated scripts/sample_test_images/document_test.png")

    # 3. Barcode Simulation Image
    img_bc = Image.new("RGB", (400, 150), color=(255, 255, 255))
    draw_bc = ImageDraw.Draw(img_bc)
    # Draw simple vertical barcode lines
    for x in range(30, 370, 8):
        width = 2 if x % 3 == 0 else 4
        draw_bc.line([(x, 20), (x, 100)], fill=(0, 0, 0), width=width)
    draw_bc.text((120, 115), "*8901234567890*", fill=(0, 0, 0))
    img_bc.save("scripts/sample_test_images/barcode_test.png")
    print("[OK] Generated scripts/sample_test_images/barcode_test.png")

if __name__ == "__main__":
    generate_test_images()
