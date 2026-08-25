import os
import re

types_path = r"c:\Users\leuti\Desktop\GitHub\GPA_Calculator\UI_enhanced\src\components\study\study-types.ts"

with open(types_path, "r", encoding="utf-8") as f:
    content = f.read()

# Replace all https://assets.beeziee.com/ with /study/
new_content = content.replace("https://assets.beeziee.com/", "/study/")

with open(types_path, "w", encoding="utf-8") as f:
    f.write(new_content)

print("Successfully replaced all https://assets.beeziee.com/ URLs with local /study/ paths in study-types.ts!")
