#!/usr/bin/env python3
"""
Stockbridge Coffee Video Automation
Image + Script → Lip-synced talking video

Pipeline:
  1. Eleven Labs → voiceover from script
  2. ByteDance OmniHuman v1.5 → lip-synced video from image + audio

Usage:
  python3 hybrid_automation.py --image fox.jpg --script "Welcome to Stockbridge Coffee!"
  python3 hybrid_automation.py --image fox.jpg --script-file script.txt
  python3 hybrid_automation.py --image fox.jpg --script "Hello!" --voice-id abc123
"""

import argparse
import json
import os
import requests
import sys
import time
from pathlib import Path

# Defaults
DEFAULT_VOICE_ID = "gMVEZSWHxpbfIG8MuwDV"  # Stockbridge voice


def get_api_keys():
    """Load API keys from environment or .env file"""
    # Try .env file first
    env_path = Path(__file__).parent.parent / ".env"
    if env_path.exists():
        for line in env_path.read_text().splitlines():
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                key, val = line.split("=", 1)
                os.environ.setdefault(key.strip(), val.strip())

    elevenlabs_key = os.environ.get("ELEVENLABS_API_KEY")
    fal_key = os.environ.get("FAL_API_KEY")

    if not elevenlabs_key:
        print("Error: ELEVENLABS_API_KEY not set")
        sys.exit(1)
    if not fal_key:
        print("Error: FAL_API_KEY not set")
        sys.exit(1)

    return elevenlabs_key, fal_key


def generate_voiceover(script: str, voice_id: str, api_key: str, output_path: str) -> str:
    """Step 1: Generate voiceover with Eleven Labs"""
    print(f"🎤 Generating voiceover ({len(script)} chars)...")

    response = requests.post(
        f"https://api.elevenlabs.io/v1/text-to-speech/{voice_id}",
        headers={
            "xi-api-key": api_key,
            "Content-Type": "application/json"
        },
        json={
            "text": script,
            "model_id": "eleven_turbo_v2_5",
            "voice_settings": {
                "stability": 0.5,
                "similarity_boost": 0.75,
                "style": 0.5,
                "use_speaker_boost": True
            }
        }
    )

    if response.status_code != 200:
        print(f"   Eleven Labs error: {response.text[:300]}")
        sys.exit(1)

    with open(output_path, "wb") as f:
        f.write(response.content)

    size_kb = os.path.getsize(output_path) / 1024
    print(f"   Saved: {output_path} ({size_kb:.0f} KB)")
    return output_path


def upload_to_fal(file_path: str, content_type: str, api_key: str) -> str:
    """Upload a file to fal.ai storage and return the URL"""
    file_name = os.path.basename(file_path)

    initiate_resp = requests.post(
        "https://rest.alpha.fal.ai/storage/upload/initiate",
        headers={
            "Authorization": f"Key {api_key}",
            "Content-Type": "application/json"
        },
        json={"file_name": file_name, "content_type": content_type}
    )

    if initiate_resp.status_code != 200:
        print(f"   Upload initiate failed: {initiate_resp.text[:300]}")
        sys.exit(1)

    upload_data = initiate_resp.json()
    file_url = upload_data["file_url"]
    upload_url = upload_data["upload_url"]

    with open(file_path, "rb") as f:
        requests.put(upload_url, headers={"Content-Type": content_type}, data=f.read())

    return file_url


def generate_lipsync_video(image_url: str, audio_url: str, api_key: str, output_path: str) -> str:
    """Step 2: Generate lip-synced video with OmniHuman v1.5"""
    print("🎬 Generating lip-synced video (OmniHuman v1.5)...")
    print("   This typically takes 2-4 minutes...")

    submit_resp = requests.post(
        "https://queue.fal.run/fal-ai/bytedance/omnihuman/v1.5",
        headers={
            "Authorization": f"Key {api_key}",
            "Content-Type": "application/json"
        },
        json={
            "image_url": image_url,
            "audio_url": audio_url
        }
    )

    submit_data = submit_resp.json()

    if "request_id" not in submit_data:
        print(f"   Submission error: {json.dumps(submit_data, indent=2)[:500]}")
        sys.exit(1)

    status_url = submit_data["status_url"]
    response_url = submit_data["response_url"]

    # Poll for completion
    start_time = time.time()
    for i in range(180):  # 15 min max
        time.sleep(5)
        status_resp = requests.get(status_url, headers={"Authorization": f"Key {api_key}"})
        status_data = status_resp.json()
        status = status_data.get("status", "unknown")
        elapsed = int(time.time() - start_time)

        if i % 6 == 0:
            print(f"   [{elapsed}s] {status}")

        if status == "COMPLETED":
            result_resp = requests.get(response_url, headers={"Authorization": f"Key {api_key}"})
            result_data = result_resp.json()

            video_url = None
            if "video" in result_data:
                v = result_data["video"]
                video_url = v.get("url") if isinstance(v, dict) else v

            if not video_url:
                print(f"   No video URL in result: {json.dumps(result_data, indent=2)[:500]}")
                sys.exit(1)

            video_bytes = requests.get(video_url).content
            with open(output_path, "wb") as f:
                f.write(video_bytes)

            size_mb = len(video_bytes) / 1024 / 1024
            print(f"   Saved: {output_path} ({size_mb:.1f} MB)")
            return output_path

        elif status in ["FAILED", "ERROR"]:
            print(f"   Generation failed: {json.dumps(status_data, indent=2)[:500]}")
            sys.exit(1)

    print("   Timed out after 15 minutes")
    sys.exit(1)


def main():
    parser = argparse.ArgumentParser(description="Stockbridge Coffee Video Automation")
    parser.add_argument("--image", required=True, help="Path to character image")
    parser.add_argument("--script", help="Script text for voiceover")
    parser.add_argument("--script-file", help="Path to script text file")
    parser.add_argument("--voice-id", default=DEFAULT_VOICE_ID, help="Eleven Labs voice ID")
    parser.add_argument("--output", default=None, help="Output video path")
    args = parser.parse_args()

    # Validate inputs
    if not os.path.exists(args.image):
        print(f"Error: Image not found: {args.image}")
        sys.exit(1)

    if args.script_file:
        script = Path(args.script_file).read_text().strip()
    elif args.script:
        script = args.script
    else:
        print("Error: Provide --script or --script-file")
        sys.exit(1)

    # Output path
    output_dir = Path("output")
    output_dir.mkdir(exist_ok=True)

    if args.output:
        output_path = args.output
    else:
        timestamp = time.strftime("%Y%m%d_%H%M%S")
        output_path = f"output/video_{timestamp}.mp4"

    # Get API keys
    elevenlabs_key, fal_key = get_api_keys()

    print("=" * 50)
    print("🦊 Stockbridge Coffee Video Automation")
    print("=" * 50)
    print(f"Image:  {args.image}")
    print(f"Script: {script[:80]}{'...' if len(script) > 80 else ''}")
    print(f"Voice:  {args.voice_id}")
    print(f"Output: {output_path}")
    print("=" * 50)

    # Step 1: Generate voiceover
    voiceover_path = "output/voiceover.mp3"
    generate_voiceover(script, args.voice_id, elevenlabs_key, voiceover_path)

    # Step 2: Upload files to fal.ai
    print("\n📤 Uploading files to fal.ai...")

    # Detect image content type
    ext = Path(args.image).suffix.lower()
    content_types = {".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".webp": "image/webp"}
    image_content_type = content_types.get(ext, "image/jpeg")

    image_url = upload_to_fal(args.image, image_content_type, fal_key)
    print(f"   Image uploaded")

    audio_url = upload_to_fal(voiceover_path, "audio/mpeg", fal_key)
    print(f"   Audio uploaded")

    # Step 3: Generate lip-synced video
    print()
    generate_lipsync_video(image_url, audio_url, fal_key, output_path)

    # Done
    print()
    print("=" * 50)
    print(f"🎉 Done! Video: {output_path}")
    print("=" * 50)

    # Open the video
    import platform
    if platform.system() == "Darwin":
        os.system(f'open "{output_path}"')


if __name__ == "__main__":
    main()
