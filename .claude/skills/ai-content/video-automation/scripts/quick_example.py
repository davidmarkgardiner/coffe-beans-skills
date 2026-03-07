#!/usr/bin/env python3
"""
Quick Example: Simple AI Video with Voice
Most minimal version - just the core Eleven Labs features
"""

import os
import requests
import subprocess
from dotenv import load_dotenv

load_dotenv()

ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY")

def quick_voiceover_video():
    """
    Simplest workflow: Add AI voice to an existing video
    Perfect if you already have video content and just need voice
    """

    # Step 1: Generate voiceover
    print("🎤 Generating voiceover...")

    script = """
    Welcome to our amazing product demo.
    In this video, I'll show you how easy it is to automate
    your entire content creation workflow using AI.
    """

    response = requests.post(
        "https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM",
        headers={
            "xi-api-key": ELEVENLABS_API_KEY,
            "Content-Type": "application/json"
        },
        json={
            "text": script.strip(),
            "model_id": "eleven_turbo_v2_5",
            "voice_settings": {
                "stability": 0.5,
                "similarity_boost": 0.75
            }
        }
    )

    with open("voiceover.mp3", "wb") as f:
        f.write(response.content)

    print("✅ Voiceover saved")

    # Step 2: Generate sound effect
    print("🔊 Generating sound effect...")

    sfx_response = requests.post(
        "https://api.elevenlabs.io/v1/sound-generation",
        headers={
            "xi-api-key": ELEVENLABS_API_KEY,
            "Content-Type": "application/json"
        },
        json={
            "text": "Upbeat tech startup background music",
            "duration_seconds": 10.0
        }
    )

    with open("background_sfx.mp3", "wb") as f:
        f.write(sfx_response.content)

    print("✅ Sound effect saved")

    # Step 3: Combine with your existing video
    # (Replace "your_video.mp4" with your actual video file)

    print("🎞️  Combining audio with video...")

    subprocess.run([
        "ffmpeg",
        "-i", "your_video.mp4",  # Your existing video
        "-i", "voiceover.mp3",
        "-i", "background_sfx.mp3",
        "-filter_complex",
        "[1:a]volume=1.0[voice];[2:a]volume=0.3[music];[voice][music]amix=inputs=2[audio]",
        "-map", "0:v",
        "-map", "[audio]",
        "-c:v", "copy",
        "-c:a", "aac",
        "-shortest",
        "final_output.mp4"
    ], check=True)

    print("✅ Final video created: final_output.mp4")


def direct_video_dubbing(video_file: str):
    """
    Even simpler: Let Eleven Labs do all the audio work
    Just upload your video and it adds the voice directly
    """

    print(f"🎬 Dubbing video: {video_file}")

    # Upload video for dubbing
    with open(video_file, "rb") as f:
        response = requests.post(
            "https://api.elevenlabs.io/v1/dubbing",
            headers={"xi-api-key": ELEVENLABS_API_KEY},
            files={"file": f},
            data={
                "source_lang": "en",
                "target_lang": "en",  # Same language = voice replacement
                "num_speakers": 1,
                "watermark": False  # Requires paid plan
            }
        )

    dubbing_id = response.json()["dubbing_id"]
    print(f"📊 Dubbing ID: {dubbing_id}")

    # Poll for completion
    import time
    print("⏳ Waiting for dubbing to complete...")

    while True:
        status_response = requests.get(
            f"https://api.elevenlabs.io/v1/dubbing/{dubbing_id}",
            headers={"xi-api-key": ELEVENLABS_API_KEY}
        )

        status = status_response.json()
        print(f"   Status: {status['status']}")

        if status["status"] == "dubbed":
            # Download dubbed video
            dubbed_url = status["target_url"]
            dubbed_video = requests.get(dubbed_url).content

            output_file = f"dubbed_{video_file}"
            with open(output_file, "wb") as f:
                f.write(dubbed_video)

            print(f"✅ Dubbed video saved: {output_file}")
            break

        elif status["status"] == "dubbing_failed":
            print("❌ Dubbing failed:", status.get("error_message"))
            break

        time.sleep(5)


def list_available_voices():
    """
    See all available voices to choose from
    """
    response = requests.get(
        "https://api.elevenlabs.io/v1/voices",
        headers={"xi-api-key": ELEVENLABS_API_KEY}
    )

    voices = response.json()["voices"]

    print(f"\n📢 Available Voices ({len(voices)} total):\n")

    for voice in voices[:10]:  # Show first 10
        print(f"  • {voice['name']:20} - ID: {voice['voice_id']}")
        print(f"    Categories: {', '.join(voice.get('labels', {}).values())}")
        print()


if __name__ == "__main__":
    import sys

    if len(sys.argv) < 2:
        print("""
Usage:
  python quick_example.py voices              # List available voices
  python quick_example.py voiceover           # Generate voiceover + combine
  python quick_example.py dub <video.mp4>     # Dub existing video

Examples:
  python quick_example.py voices
  python quick_example.py voiceover
  python quick_example.py dub my_presentation.mp4
        """)
        sys.exit(1)

    command = sys.argv[1]

    if command == "voices":
        list_available_voices()

    elif command == "voiceover":
        quick_voiceover_video()

    elif command == "dub":
        if len(sys.argv) < 3:
            print("Error: Please provide video file path")
            sys.exit(1)
        direct_video_dubbing(sys.argv[2])

    else:
        print(f"Unknown command: {command}")
