#!/usr/bin/env python3
"""
Cost-Effective AI Video Automation using YOUR current subscriptions
Uses: Gemini (images + video) + Eleven Labs (voice) + Artlist (music)
"""

import os
import requests
import subprocess
import time
import json
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

class GeminiVideoAutomation:
    """
    Optimized for users with Gemini + Artlist subscriptions
    Most cost-effective approach!
    """

    def __init__(self):
        self.gemini_api_key = os.getenv("GEMINI_API_KEY")
        self.eleven_labs_api_key = os.getenv("ELEVENLABS_API_KEY")
        self.artlist_api_key = os.getenv("ARTLIST_API_KEY")  # Enterprise API

    def step1_generate_image_gemini(self, prompt: str) -> str:
        """
        Generate image using Gemini 2.5 Flash Image
        COST: Included in your Gemini subscription or ~$0.02/image
        """
        print(f"🎨 Generating image with Gemini: {prompt}")

        response = requests.post(
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent",
            headers={
                "Content-Type": "application/json",
                "x-goog-api-key": self.gemini_api_key
            },
            json={
                "contents": [{
                    "parts": [{
                        "text": f"Generate a high-quality image: {prompt}"
                    }]
                }],
                "generationConfig": {
                    "temperature": 0.7,
                    "maxOutputTokens": 2048
                }
            }
        )

        result = response.json()

        # Extract image data (Gemini returns inline image data)
        image_data = result["candidates"][0]["content"]["parts"][0]["inlineData"]["data"]

        # Decode base64 and save
        import base64
        image_bytes = base64.b64decode(image_data)

        Path("output").mkdir(exist_ok=True)
        image_path = "output/gemini_image.png"

        with open(image_path, "wb") as f:
            f.write(image_bytes)

        print(f"✅ Image saved: {image_path}")
        return image_path

    def step2_generate_video_veo(self, image_path: str, motion_prompt: str) -> str:
        """
        Generate video using Gemini Veo 3.1 (image-to-video)
        COST: Included in Gemini subscription or ~$0.05-0.10 per second

        Veo 3.1 can:
        - Generate 8-second 720p/1080p/4K videos
        - Use reference images
        - Portrait or landscape
        - Native audio generation
        """
        print(f"🎬 Generating video with Veo 3.1: {motion_prompt}")

        # Read image and encode to base64
        import base64
        with open(image_path, "rb") as f:
            image_data = base64.b64encode(f.read()).decode()

        response = requests.post(
            "https://generativelanguage.googleapis.com/v1beta/models/veo-3.1:generateVideo",
            headers={
                "Content-Type": "application/json",
                "x-goog-api-key": self.gemini_api_key
            },
            json={
                "contents": [{
                    "parts": [
                        {
                            "text": motion_prompt
                        },
                        {
                            "inlineData": {
                                "mimeType": "image/png",
                                "data": image_data
                            }
                        }
                    ]
                }],
                "generationConfig": {
                    "videoLength": 8,  # seconds
                    "aspectRatio": "16:9",  # or "9:16" for portrait
                    "resolution": "1080p",  # "720p", "1080p", or "4k"
                    "includeAudio": False  # We'll add Eleven Labs voice instead
                }
            }
        )

        result = response.json()

        # Veo returns operation name for async processing
        operation_name = result["name"]

        # Poll for completion
        video_url = self._poll_veo_completion(operation_name)

        # Download video
        video_data = requests.get(video_url).content
        video_path = "output/veo_video.mp4"

        with open(video_path, "wb") as f:
            f.write(video_data)

        print(f"✅ Video saved: {video_path}")
        return video_path

    def step3_get_artlist_music(self, mood: str, duration: int) -> str:
        """
        Get background music from Artlist using your existing subscription
        COST: $0 (included in your Artlist subscription)
        """
        print(f"🎵 Searching Artlist for {mood} music ({duration}s)...")

        # Search for music matching mood
        response = requests.get(
            "https://api.artlist.io/v1/songs",
            headers={
                "Authorization": f"Bearer {self.artlist_api_key}",
                "Content-Type": "application/json"
            },
            params={
                "mood": mood,
                "duration_max": duration + 2,
                "duration_min": duration - 2,
                "limit": 5
            }
        )

        songs = response.json()["data"]

        if not songs:
            print("⚠️  No matching songs found")
            return None

        # Pick first matching song
        song = songs[0]
        print(f"   Found: {song['title']} by {song['artist']}")

        # Download the song
        download_response = requests.get(
            f"https://api.artlist.io/v1/songs/{song['id']}/download",
            headers={"Authorization": f"Bearer {self.artlist_api_key}"}
        )

        music_path = "output/artlist_music.mp3"
        with open(music_path, "wb") as f:
            f.write(download_response.content)

        print(f"✅ Music downloaded: {music_path}")
        return music_path

    def step4_generate_voiceover_elevenlabs(self, script: str, voice_id: str) -> str:
        """
        Generate voiceover using Eleven Labs
        COST: ~$0.30 per minute of audio
        """
        print(f"🎤 Generating voiceover with Eleven Labs...")

        response = requests.post(
            f"https://api.elevenlabs.io/v1/text-to-speech/{voice_id}",
            headers={
                "xi-api-key": self.eleven_labs_api_key,
                "Content-Type": "application/json"
            },
            json={
                "text": script,
                "model_id": "eleven_turbo_v2_5",
                "voice_settings": {
                    "stability": 0.5,
                    "similarity_boost": 0.75
                }
            }
        )

        voiceover_path = "output/voiceover.mp3"
        with open(voiceover_path, "wb") as f:
            f.write(response.content)

        print(f"✅ Voiceover saved: {voiceover_path}")
        return voiceover_path

    def step5_combine_all(
        self,
        video_path: str,
        voiceover_path: str,
        music_path: str = None,
        output_path: str = "output/final_video.mp4"
    ) -> str:
        """
        Combine video + voiceover + background music using FFmpeg
        """
        print(f"🎞️  Combining all elements...")

        if music_path:
            # Mix voiceover (loud) + background music (quiet)
            subprocess.run([
                "ffmpeg",
                "-i", video_path,
                "-i", voiceover_path,
                "-i", music_path,
                "-filter_complex",
                "[1:a]volume=1.0[voice];[2:a]volume=0.2[music];[voice][music]amix=inputs=2:duration=shortest[audio]",
                "-map", "0:v",
                "-map", "[audio]",
                "-c:v", "copy",
                "-c:a", "aac",
                "-shortest",
                output_path
            ], check=True)
        else:
            # Just add voiceover
            subprocess.run([
                "ffmpeg",
                "-i", video_path,
                "-i", voiceover_path,
                "-c:v", "copy",
                "-c:a", "aac",
                "-shortest",
                output_path
            ], check=True)

        print(f"✅ Final video: {output_path}")
        return output_path

    def run_full_pipeline(
        self,
        character_prompt: str,
        motion_prompt: str,
        script: str,
        voice_id: str,
        music_mood: str = "upbeat"
    ) -> str:
        """
        Complete automation using your existing subscriptions
        Most cost-effective approach!
        """
        print("🚀 Starting Cost-Effective Video Pipeline\n")

        # Step 1: Generate image with Gemini
        image_path = self.step1_generate_image_gemini(character_prompt)

        # Step 2: Generate video with Veo 3.1
        video_path = self.step2_generate_video_veo(image_path, motion_prompt)

        # Step 3: Get music from Artlist
        video_duration = 8  # Veo default
        music_path = self.step3_get_artlist_music(music_mood, video_duration)

        # Step 4: Generate voiceover with Eleven Labs
        voiceover_path = self.step4_generate_voiceover_elevenlabs(script, voice_id)

        # Step 5: Combine everything
        final_video = self.step5_combine_all(
            video_path,
            voiceover_path,
            music_path
        )

        print(f"\n🎉 Pipeline complete! Final video: {final_video}")
        return final_video

    def _poll_veo_completion(self, operation_name: str, timeout: int = 600) -> str:
        """Poll Veo video generation until complete"""
        start_time = time.time()

        while time.time() - start_time < timeout:
            response = requests.get(
                f"https://generativelanguage.googleapis.com/v1beta/{operation_name}",
                headers={"x-goog-api-key": self.gemini_api_key}
            )

            result = response.json()

            if result.get("done"):
                # Extract video URL from response
                video_uri = result["response"]["generatedVideo"]["uri"]
                return video_uri

            print(f"   Video generation in progress... ({int(time.time() - start_time)}s)")
            time.sleep(10)

        raise TimeoutError("Video generation timed out")


# ALTERNATIVE: If you want to keep using Midjourney manually
class HybridAutomation:
    """
    For when you want to use Midjourney (manual) + automate the rest
    """

    def __init__(self):
        self.eleven_labs_api_key = os.getenv("ELEVENLABS_API_KEY")
        self.artlist_api_key = os.getenv("ARTLIST_API_KEY")
        self.pika_api_key = os.getenv("FAL_API_KEY")  # Pika via fal.ai

    def use_midjourney_image(self, midjourney_image_path: str):
        """
        Step 1: Manually download image from Midjourney
        Then provide path here
        """
        return midjourney_image_path

    def animate_with_pika(self, image_path: str, motion_prompt: str) -> str:
        """
        Step 2: Animate Midjourney image using Pika API
        COST: ~$0.10 per 5-second video
        """
        print(f"🎬 Animating with Pika 2.2: {motion_prompt}")

        import base64
        with open(image_path, "rb") as f:
            image_data = base64.b64encode(f.read()).decode()

        response = requests.post(
            "https://fal.run/pika/v2.2/image-to-video",
            headers={
                "Authorization": f"Key {self.pika_api_key}",
                "Content-Type": "application/json"
            },
            json={
                "image_url": f"data:image/png;base64,{image_data}",
                "prompt": motion_prompt,
                "duration": 5,
                "resolution": "1080p",
                "aspect_ratio": "16:9"
            }
        )

        # Pika via fal.ai is async
        request_id = response.json()["request_id"]

        # Poll for completion
        video_url = self._poll_pika_completion(request_id)

        video_data = requests.get(video_url).content
        video_path = "output/pika_video.mp4"

        with open(video_path, "wb") as f:
            f.write(video_data)

        print(f"✅ Video saved: {video_path}")
        return video_path

    def _poll_pika_completion(self, request_id: str, timeout: int = 300) -> str:
        """Poll Pika completion"""
        start_time = time.time()

        while time.time() - start_time < timeout:
            response = requests.get(
                f"https://fal.run/pika/v2.2/requests/{request_id}",
                headers={"Authorization": f"Key {self.pika_api_key}"}
            )

            result = response.json()

            if result["status"] == "completed":
                return result["video"]["url"]
            elif result["status"] == "failed":
                raise Exception(f"Video generation failed: {result.get('error')}")

            time.sleep(5)

        raise TimeoutError("Video generation timed out")


if __name__ == "__main__":
    # OPTION 1: Full automation with Gemini + Artlist + Eleven Labs
    # (Most cost-effective since you already have Gemini + Artlist!)

    gemini_pipeline = GeminiVideoAutomation()

    final_video = gemini_pipeline.run_full_pipeline(
        character_prompt="Friendly robot mascot, blue metallic, smiling, futuristic office, cinematic lighting",
        motion_prompt="Robot waves hello warmly, slight head tilt, friendly gesture",
        script="Hello everyone! Welcome to our amazing new product. Let me show you how it works.",
        voice_id="21m00Tcm4TlvDq8ikWAM",  # Eleven Labs voice
        music_mood="upbeat"
    )

    print(f"\n✨ Your video is ready: {final_video}")

    # OPTION 2: Hybrid - Use Midjourney image + automate rest
    # hybrid = HybridAutomation()
    # midjourney_img = "path/to/your/midjourney_download.png"
    # video = hybrid.animate_with_pika(midjourney_img, "gentle wave")
    # ... then add voice/music same as above
