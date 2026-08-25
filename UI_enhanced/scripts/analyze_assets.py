import re
import os

types_path = r"c:\Users\leuti\Desktop\GitHub\GPA_Calculator\UI_enhanced\src\components\study\study-types.ts"

with open(types_path, "r", encoding="utf-8") as f:
    content = f.read()

urls = re.findall(r'https://assets\.beeziee\.com/[^\s"\',]+', content)
unique_urls = sorted(list(set(urls)))

print(f"Total unique assets.beeziee.com URLs: {len(unique_urls)}")

categories = {}
for u in unique_urls:
    parts = u.replace("https://assets.beeziee.com/", "").split("/")
    folder = parts[0] if len(parts) > 1 else "root"
    ext = u.split(".")[-1].lower()
    key = f"{folder} (.{ext})"
    categories[key] = categories.get(key, 0) + 1

for k, v in sorted(categories.items()):
    print(f"  - {k}: {v} files")
