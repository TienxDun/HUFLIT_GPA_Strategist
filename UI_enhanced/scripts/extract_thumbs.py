import os
import urllib.request
import cv2
from PIL import Image

output_dir = r"c:\Users\leuti\Desktop\GitHub\GPA_Calculator\UI_enhanced\public\thumbnails"
os.makedirs(output_dir, exist_ok=True)

videos = [
    {
        "name": "journey-through-fantasy-world.webp",
        "url": "https://github.com/TienxDun/HUFLIT_GPA_Strategist/releases/download/v1.0.0-assets/journey-through-fantasy-world.3840x2160.mp4"
    },
    {
        "name": "rainy-sunset.webp",
        "url": "https://github.com/TienxDun/HUFLIT_GPA_Strategist/releases/download/v1.0.0-assets/rainy-sunset.3840x2160.mp4"
    },
    {
        "name": "rainy-valley.webp",
        "url": "https://github.com/TienxDun/HUFLIT_GPA_Strategist/releases/download/v1.0.0-assets/rainy-valley.3840x2160.mp4"
    },
    {
        "name": "sotheby-train-journey.webp",
        "url": "https://github.com/TienxDun/HUFLIT_GPA_Strategist/releases/download/v1.0.0-assets/sotheby-train-journey-live-wallpaper.mp4"
    }
]

for v in videos:
    filename = v["name"]
    url = v["url"]
    print(f"Processing {filename}...")
    
    # Download small chunk to temp file or open directly
    temp_video = os.path.join(output_dir, "temp_" + filename.replace(".webp", ".mp4"))
    try:
        # Download first 5MB or full video to get accurate keyframe
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req) as response, open(temp_video, 'wb') as out_file:
            # Read first 8MB which is plenty for initial frames
            chunk = response.read(8 * 1024 * 1024)
            out_file.write(chunk)
        
        cap = cv2.VideoCapture(temp_video)
        ret, frame = cap.read()
        if not ret:
            cap.release()
            # Try direct URL
            cap = cv2.VideoCapture(url)
            ret, frame = cap.read()
            
        if ret:
            rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            img = Image.fromarray(rgb_frame)
            img = img.resize((640, 360), Image.Resampling.LANCZOS)
            out_path = os.path.join(output_dir, filename)
            img.save(out_path, "WEBP", quality=85)
            print(f"Success: {out_path} ({os.path.getsize(out_path)} bytes)")
        else:
            print(f"Failed to decode frame for {filename}")
        cap.release()
    except Exception as e:
        print(f"Error on {filename}: {e}")
    finally:
        if os.path.exists(temp_video):
            os.remove(temp_video)

print("Extraction script finished.")
