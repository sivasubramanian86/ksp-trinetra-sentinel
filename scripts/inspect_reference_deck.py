import pypdf

def dump_reference_pdf():
    pdf_path = r"D:\Siva\Books\CAREER\HACKATHON\AWS_AI_For_Bharat_Harve_Logix_AI_H2S_Submissions\AWS_AI_for_Bharat_Hackathon_Prototype_Development_Submission_Team_Cybernauts_March_2026.pdf"
    reader = pypdf.PdfReader(pdf_path)
    print(f"Total Pages: {len(reader.pages)}")
    
    with open("scripts/reference_deck_summary.txt", "w", encoding="utf-8") as f:
        for i, page in enumerate(reader.pages):
            text = page.extract_text()
            f.write(f"\n--- PAGE {i+1} ---\n")
            f.write(text + "\n")
    print("[OK] Wrote reference deck text to scripts/reference_deck_summary.txt")

if __name__ == "__main__":
    dump_reference_pdf()
