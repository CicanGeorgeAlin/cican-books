from pathlib import Path
import re

source = Path("fulltext/the-wars-of-jehovah-ocr.txt")
target = Path("fulltext/the-wars-of-jehovah.txt")
text = source.read_text(encoding="utf-8", errors="replace")
text = text.replace("\\r\\n", "\\n").replace("\\r", "\\n")

lines = []
blank_run = 0
removed_headers = 0
for raw_line in text.split("\\n"):
    line = re.sub(r"[\\t ]+", " ", raw_line).strip()
    if not line:
        blank_run += 1
        if blank_run <= 1:
            lines.append("")
        continue
    blank_run = 0
    if re.fullmatch(r"\\d{1,4}", line):
        continue
    # Remove running page furniture, not the poem's printed verse lines.
    if re.fullmatch(r"(?:IN HEAVEN\\.?\\s+\\d{1,3}|\\d{1,3}\\s+THE WARS OF JEHOVAH|[a-h]\\s+\\d{1,2})", line, re.IGNORECASE):
        removed_headers += 1
        continue
    # Printed marginal verse-count numerals are not part of the verse.
    line = re.sub(r"\\s+(?:10|20|30|40|50|60|70|80|90|100|110|120|130|140|150|160|170|180|190|200|210|220|230|240|250|260|270|280|290|300|310|320|330|340|350|360|370|380|390|400|410|420|430|440|450|460|470|480|490|500|510|520|530|540|550|560|570|580|590|600)$", "", line)
    lines.append(line)

clean = re.sub(r"\\n{3,}", "\\n\\n", "\\n".join(lines)).strip() + "\\n"
target.write_text(clean, encoding="utf-8")
if len(clean) < 100000:
    raise SystemExit("Normalized OCR unexpectedly short")
for roman in ("I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX"):
    if not re.search(r"BOOK\\s+" + roman + r"\\b", clean, re.IGNORECASE):
        raise SystemExit("Missing expected book section: " + roman)
print("Prepared line-preserving full text:", len(clean), "characters; removed", removed_headers, "running headers")
