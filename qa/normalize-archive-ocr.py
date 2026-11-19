from pathlib import Path
import re

source = Path("fulltext/the-wars-of-jehovah-ocr.txt")
target = Path("fulltext/the-wars-of-jehovah.txt")
text = source.read_text(encoding="utf-8", errors="replace")
text = text.replace("\r\n", "\n").replace("\r", "\n")

lines = []
blank_run = 0
for raw_line in text.split("\n"):
    line = re.sub(r"[\t ]+", " ", raw_line).strip()
    if not line:
        blank_run += 1
        if blank_run <= 2:
            lines.append("")
        continue
    blank_run = 0
    if re.fullmatch(r"\d{1,4}", line):
        continue
    lines.append(line)

clean = "\n".join(lines).strip() + "\n"
target.write_text(clean, encoding="utf-8")
if len(clean) < 100000:
    raise SystemExit("Normalized OCR unexpectedly short")
for roman in ("I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX"):
    if not re.search(r"BOOK\s+" + roman + r"\b", clean, re.IGNORECASE):
        raise SystemExit("Missing expected book section: " + roman)
print("Prepared normalized full text:", len(clean), "characters")
