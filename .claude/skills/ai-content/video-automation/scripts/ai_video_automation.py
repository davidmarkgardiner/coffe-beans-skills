#!/usr/bin/env python3
"""
AI Video Automation Workflow
Automates: Image → Video → Voice + SFX → Final Output
"""

import os
import requests
import subprocess
from pathlib import Path
from typing import Dict, List

class VideoAutomationPipeline:
    def __init__(self):
        self.eleven_labs_api_key = os.getenv("ELEVENLABS_API_KEY")
        self.openai_api_key = os.getenv("OPENAI_API_KEY")
        self.runway_api_key = os.getenv("RUNWAY_API_KEY")  # or Pika, Luma, etc.

    def step1_generate_image(self, character_description: str) -> str:
        """
        Generate character image using OpenAI DALL-E
        Alternative: Midjourney, Flux, Stable Diffusion
        """
        print(f"🎨 Generating image: {character_description}")

        response = requests.post(
            "https://api.openai.com/v1/images/generations",
            headers={
                "Authorization": f"Bearer {self.openai_api_key}",
                "Content-Type": "application/json"
            },
            json={
                "model": "dall-e-3",
                "prompt": character_description,
                "n": 1,
                "size": "1024x1024",
                "quality": "hd"
            }
        )

        image_url = response.json()["data"][0]["url"]

        # Download image
        image_data = requests.get(image_url).content
        image_path = "output/character.png"
        Path("output").mkdir(exist_ok=True)
        with open(image_path, "wb") as f:
            f.write(image_data)

        print(f"✅ Image saved: {image_path}")
        return image_path

    def step2_generate_video(self, image_path: str, motion_prompt: str) -> str:
        """
        Generate video from image using Runway ML / Pika / Luma AI

        Note: Each platform has different API endpoints
        This is a generic structure - adapt to your chosen provider
        """
        print(f"🎬 Generating video with prompt: {motion_prompt}")

        # Example for Runway ML Gen-3 API
        # (Check actual API docs for your chosen provider)

        with open(image_path, "rb") as img_file:
            response = requests.post(
                "https://api.runwayml.com/v1/generations",  # Example endpoint
                headers={
                    "Authorization": f"Bearer {self.runway_api_key}",
                },
                files={"image": img_file},
                data={
                    "prompt": motion_prompt,
                    "duration": 5,  # seconds
                    "model": "gen3"
                }
            )

        # Poll for completion (most video APIs are async)
        video_id = response.json()["id"]
        video_url = self._poll_video_completion(video_id)

        # Download video
        video_data = requests.get(video_url).content
        video_path = "output/video_no_audio.mp4"
        with open(video_path, "wb") as f:
            f.write(video_data)

        print(f"✅ Video saved: {video_path}")
        return video_path

    def step3_generate_voiceover(self, script: str, voice_id: str) -> str:
        """
        Generate voiceover using Eleven Labs Text-to-Speech
        """
        print(f"🎤 Generating voiceover...")

        response = requests.post(
            f"https://api.elevenlabs.io/v1/text-to-speech/{voice_id}",
            headers={
                "xi-api-key": self.eleven_labs_api_key,
                "Content-Type": "application/json"
            },
            json={
                "text": script,
                "model_id": "eleven_multilingual_v2",
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

    def step3_generate_sound_effects(self, sfx_descriptions: List[str]) -> List[str]:
        """
        Generate sound effects using Eleven Labs Sound Effects API
        """
        print(f"🔊 Generating {len(sfx_descriptions)} sound effects...")

        sfx_paths = []
        for i, description in enumerate(sfx_descriptions):
            response = requests.post(
                "https://api.elevenlabs.io/v1/sound-generation",
                headers={
                    "xi-api-key": self.eleven_labs_api_key,
                    "Content-Type": "application/json"
                },
                json={
                    "text": description,
                    "duration_seconds": 2.0,
                    "prompt_influence": 0.5
                }
            )

            sfx_path = f"output/sfx_{i}.mp3"
            with open(sfx_path, "wb") as f:
                f.write(response.content)
            sfx_paths.append(sfx_path)

        print(f"✅ Sound effects saved")
        return sfx_paths

    def step4_combine_audio_video(
        self,
        video_path: str,
        voiceover_path: str,
        sfx_paths: List[str],
        output_path: str = "output/final_video.mp4"
    ) -> str:
        """
        Combine video with voiceover and sound effects using FFmpeg
        """
        print(f"🎞️  Combining video and audio...")

        # Create audio mix (voiceover + sound effects)
        # This is a simple mix - adjust volumes/timing as needed

        if sfx_paths:
            # Complex audio mixing with multiple inputs
            inputs = [f"-i {voiceover_path}"] + [f"-i {sfx}" for sfx in sfx_paths]
            filter_complex = f"[0:a][1:a]amix=inputs={len(sfx_paths)+1}:duration=longest[aout]"

            # First, mix all audio tracks
            subprocess.run([
                "ffmpeg", "-i", voiceover_path,
                *[item for sfx in sfx_paths for item in ["-i", sfx]],
                "-filter_complex", filter_complex,
                "-map", "[aout]",
                "output/mixed_audio.mp3"
            ], check=True)

            audio_path = "output/mixed_audio.mp3"
        else:
            audio_path = voiceover_path

        # Combine video with mixed audio
        subprocess.run([
            "ffmpeg",
            "-i", video_path,
            "-i", audio_path,
            "-c:v", "copy",  # Don't re-encode video
            "-c:a", "aac",   # Encode audio as AAC
            "-shortest",     # Match shortest stream
            output_path
        ], check=True)

        print(f"✅ Final video saved: {output_path}")
        return output_path

    def run_full_pipeline(
        self,
        character_description: str,
        motion_prompt: str,
        script: str,
        voice_id: str,
        sfx_descriptions: List[str] = None
    ) -> str:
        """
        Execute the complete automation pipeline
        """
        print("🚀 Starting AI Video Automation Pipeline\n")

        # Step 1: Generate character image
        image_path = self.step1_generate_image(character_description)

        # Step 2: Generate video from image
        video_path = self.step2_generate_video(image_path, motion_prompt)

        # Step 3: Generate audio (voiceover + SFX)
        voiceover_path = self.step3_generate_voiceover(script, voice_id)

        sfx_paths = []
        if sfx_descriptions:
            sfx_paths = self.step3_generate_sound_effects(sfx_descriptions)

        # Step 4: Combine everything
        final_video = self.step4_combine_audio_video(
            video_path,
            voiceover_path,
            sfx_paths
        )

        print(f"\n🎉 Pipeline complete! Final video: {final_video}")
        return final_video

    def _poll_video_completion(self, video_id: str, timeout: int = 300) -> str:
        """Poll video generation status until complete"""
        import time
        start_time = time.time()

        while time.time() - start_time < timeout:
            response = requests.get(
                f"https://api.runwayml.com/v1/generations/{video_id}",
                headers={"Authorization": f"Bearer {self.runway_api_key}"}
            )

            status = response.json()["status"]
            if status == "completed":
                return response.json()["url"]
            elif status == "failed":
                raise Exception("Video generation failed")

            time.sleep(5)

        raise TimeoutError("Video generation timed out")


# Example usage
if __name__ == "__main__":
    pipeline = VideoAutomationPipeline()

    # Define your content
    config = {
        "character_description": "A friendly robot mascot with blue metallic finish, large expressive eyes, in a futuristic office setting, digital art style",
        "motion_prompt": "The robot waves hello and smiles warmly at the camera",
        "script": "Hello everyone! Welcome to our amazing new product. Let me show you how easy it is to use.",
        "voice_id": "21m00Tcm4TlvDq8ikWAM",  # Replace with your Eleven Labs voice ID
        "sfx_descriptions": [
            "Friendly robot beeping sound",
            "Futuristic whoosh transition"
        ]
    }

    final_video = pipeline.run_full_pipeline(**config)
    print(f"\n✨ Your automated video is ready: {final_video}")
