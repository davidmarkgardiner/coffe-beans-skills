#!/usr/bin/env python3
"""
Stockbridge Coffee Batch Content Generator

Generates multiple draft videos from a topic or list of scripts.
Designed for cheap, fast ideation — review outputs and take winners
to manual production on higher-quality platforms.

Usage:
  python3 generate_batch.py --image fox.jpg --scripts scripts.txt
  python3 generate_batch.py --image fox.jpg --scripts-json ideas.json
"""

import argparse
import json
import os
import subprocess
import sys
import time
from pathlib import Path

SCRIPT_DIR = Path(__file__).parent
AI_CONTENT_DIR = SCRIPT_DIR.parent.parent
HYBRID_SCRIPT = AI_CONTENT_DIR / "video-automation" / "scripts" / "hybrid_automation.py"


def load_scripts_from_file(path: str) -> list[str]:
    """Load scripts from a text file (one per paragraph, separated by blank lines)."""
    content = Path(path).read_text().strip()
    scripts = [s.strip() for s in content.split("\n\n") if s.strip()]
    return scripts


def load_scripts_from_json(path: str) -> list[dict]:
    """Load scripts from a JSON file. Expected format: [{"title": "...", "script": "..."}, ...]"""
    with open(path) as f:
        data = json.load(f)
    if isinstance(data, list):
        return data
    raise ValueError("JSON file must contain a list of objects with 'script' field")


def run_draft(image_path: str, script: str, output_path: str, voice_id: str = None) -> bool:
    """Run hybrid_automation.py for a single draft."""
    cmd = [
        sys.executable, str(HYBRID_SCRIPT),
        "--image", image_path,
        "--script", script,
        "--output", output_path,
    ]
    if voice_id:
        cmd.extend(["--voice-id", voice_id])

    result = subprocess.run(cmd, capture_output=True, text=True)

    if result.returncode != 0:
        print(f"   FAILED: {result.stderr[:200]}")
        return False
    return True


def main():
    parser = argparse.ArgumentParser(description="Stockbridge Coffee Batch Content Generator")
    parser.add_argument("--image", required=True, help="Path to fox mascot image")
    parser.add_argument("--scripts", help="Text file with scripts (one per paragraph)")
    parser.add_argument("--scripts-json", help="JSON file with script objects")
    parser.add_argument("--voice-id", default=None, help="ElevenLabs voice ID (default: Stockbridge voice)")
    parser.add_argument("--output-dir", default=None, help="Output directory (default: output/batch_YYYYMMDD_HHMMSS)")
    args = parser.parse_args()

    if not os.path.exists(args.image):
        print(f"Error: Image not found: {args.image}")
        sys.exit(1)

    if not HYBRID_SCRIPT.exists():
        print(f"Error: hybrid_automation.py not found at {HYBRID_SCRIPT}")
        sys.exit(1)

    # Load scripts
    if args.scripts_json:
        entries = load_scripts_from_json(args.scripts_json)
        scripts = []
        for e in entries:
            if isinstance(e, dict):
                scripts.append({"title": e.get("title", "untitled"), "script": e["script"]})
            else:
                scripts.append({"title": "untitled", "script": str(e)})
    elif args.scripts:
        raw_scripts = load_scripts_from_file(args.scripts)
        scripts = [{"title": f"idea_{i+1}", "script": s} for i, s in enumerate(raw_scripts)]
    else:
        print("Error: Provide --scripts or --scripts-json")
        sys.exit(1)

    # Setup output directory
    timestamp = time.strftime("%Y%m%d_%H%M%S")
    output_dir = Path(args.output_dir) if args.output_dir else Path(f"output/batch_{timestamp}")
    output_dir.mkdir(parents=True, exist_ok=True)

    print("=" * 50)
    print(f"Stockbridge Coffee Batch Generator")
    print("=" * 50)
    print(f"Image:   {args.image}")
    print(f"Scripts: {len(scripts)}")
    print(f"Output:  {output_dir}")
    print("=" * 50)

    results = []

    for i, entry in enumerate(scripts):
        title = entry["title"]
        script = entry["script"]
        video_path = str(output_dir / f"video_{i+1:03d}.mp4")

        print(f"\n--- [{i+1}/{len(scripts)}] {title} ---")
        print(f"Script: {script[:80]}{'...' if len(script) > 80 else ''}")

        success = run_draft(args.image, script, video_path, args.voice_id)

        results.append({
            "index": i + 1,
            "title": title,
            "script": script,
            "video": video_path if success else None,
            "status": "ok" if success else "failed",
        })

    # Save ideas log
    ideas_path = output_dir / "ideas.json"
    with open(ideas_path, "w") as f:
        json.dump(results, f, indent=2)

    # Summary
    ok = sum(1 for r in results if r["status"] == "ok")
    failed = sum(1 for r in results if r["status"] == "failed")

    print("\n" + "=" * 50)
    print(f"Done! {ok} videos generated, {failed} failed")
    print(f"Videos: {output_dir}/")
    print(f"Ideas log: {ideas_path}")
    print("=" * 50)
    print("\nReview the videos, then log winners with log_winner.py")


if __name__ == "__main__":
    main()
