import os
import re
import urllib.request
from concurrent.futures import ThreadPoolExecutor, as_completed
import time

base_dir = r"c:\Users\leuti\Desktop\GitHub\GPA_Calculator\UI_enhanced"
types_path = os.path.join(base_dir, "src", "components", "study", "study-types.ts")
public_study_dir = os.path.join(base_dir, "public", "study")

with open(types_path, "r", encoding="utf-8") as f:
    content = f.read()

urls = sorted(list(set(re.findall(r'https://assets\.beeziee\.com/[^\s"\',]+', content))))
print(f"Found {len(urls)} assets to download from assets.beeziee.com")

def download_file(url):
    rel_path = url.replace("https://assets.beeziee.com/", "").replace("/", os.sep)
    dest_path = os.path.join(public_study_dir, rel_path)
    os.makedirs(os.path.dirname(dest_path), exist_ok=True)
    
    if os.path.exists(dest_path) and os.path.getsize(dest_path) > 0:
        return True, url, "Cached"
    
    for attempt in range(3):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"})
            with urllib.request.urlopen(req, timeout=30) as resp, open(dest_path, "wb") as out_f:
                out_f.write(resp.read())
            return True, url, f"{os.path.getsize(dest_path) / 1024:.1f} KB"
        except Exception as e:
            if attempt == 2:
                return False, url, str(e)
            time.sleep(1)
    return False, url, "Failed"

print("Starting concurrent download with 12 threads...")
start_time = time.time()
success_count = 0
fail_count = 0

with ThreadPoolExecutor(max_workers=12) as executor:
    futures = {executor.submit(download_file, u): u for u in urls}
    for i, future in enumerate(as_completed(futures), 1):
        ok, u, msg = future.result()
        filename = u.split("/")[-1]
        if ok:
            success_count += 1
            print(f"[{i}/{len(urls)}] OK: {filename} ({msg})")
        else:
            fail_count += 1
            print(f"[{i}/{len(urls)}] ERROR: {filename} ({msg})")

print(f"\nDownload finished in {time.time() - start_time:.2f}s!")
print(f"Success: {success_count}/{len(urls)}, Failed: {fail_count}")

# Calculate total downloaded size
total_size = 0
file_count = 0
for root, dirs, files in os.walk(public_study_dir):
    for f in files:
        file_count += 1
        total_size += os.path.getsize(os.path.join(root, f))

print(f"Total downloaded: {file_count} files ({total_size / (1024 * 1024):.2f} MB)")
