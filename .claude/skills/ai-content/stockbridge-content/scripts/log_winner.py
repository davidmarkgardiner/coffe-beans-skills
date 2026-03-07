#!/usr/bin/env python3
"""
Log winning video concepts for manual production.

Reads the ideas.json from a batch run, lets you mark winners,
and saves them to output/winners.json with notes.

Usage:
  python3 log_winner.py --batch output/batch_20260307_120000 --pick 1 3 --notes "Great tone"
  python3 log_winner.py --video output/batch_20260307_120000/video_001.mp4 --notes "Use this script"
  python3 log_winner.py --list
"""

import argparse
import json
import sys
from pathlib import Path

WINNERS_FILE = Path("output/winners.json")


def load_winners() -> list:
    if WINNERS_FILE.exists():
        with open(WINNERS_FILE) as f:
            return json.load(f)
    return []


def save_winners(winners: list):
    WINNERS_FILE.parent.mkdir(parents=True, exist_ok=True)
    with open(WINNERS_FILE, "w") as f:
        json.dump(winners, f, indent=2)


def add_from_batch(batch_dir: str, picks: list[int], notes: str):
    ideas_file = Path(batch_dir) / "ideas.json"
    if not ideas_file.exists():
        print(f"Error: No ideas.json in {batch_dir}")
        sys.exit(1)

    with open(ideas_file) as f:
        ideas = json.load(f)

    winners = load_winners()

    for idx in picks:
        match = next((i for i in ideas if i["index"] == idx), None)
        if not match:
            print(f"Warning: No idea #{idx} in batch")
            continue

        winner = {
            "script": match["script"],
            "title": match.get("title", ""),
            "source_video": match.get("video", ""),
            "source_batch": batch_dir,
            "notes": notes,
            "status": "pending_production",
        }
        winners.append(winner)
        print(f"Added #{idx}: {match['script'][:60]}...")

    save_winners(winners)
    print(f"\nSaved {len(picks)} winner(s) to {WINNERS_FILE}")


def add_from_video(video_path: str, notes: str):
    winners = load_winners()
    winner = {
        "script": "",
        "title": "",
        "source_video": video_path,
        "source_batch": "",
        "notes": notes,
        "status": "pending_production",
    }
    winners.append(winner)
    save_winners(winners)
    print(f"Added video: {video_path}")
    print(f"Saved to {WINNERS_FILE}")


def list_winners():
    winners = load_winners()
    if not winners:
        print("No winners logged yet.")
        return

    print(f"\n{'#':<4} {'Status':<20} {'Script':<50} Notes")
    print("-" * 100)
    for i, w in enumerate(winners, 1):
        script_preview = w.get("script", "")[:47]
        if len(w.get("script", "")) > 47:
            script_preview += "..."
        print(f"{i:<4} {w['status']:<20} {script_preview:<50} {w.get('notes', '')}")


def main():
    parser = argparse.ArgumentParser(description="Log winning video concepts")
    parser.add_argument("--batch", help="Path to batch output directory")
    parser.add_argument("--pick", nargs="+", type=int, help="Idea numbers to pick from batch")
    parser.add_argument("--video", help="Path to a single video to log")
    parser.add_argument("--notes", default="", help="Notes for manual production")
    parser.add_argument("--list", action="store_true", help="List all logged winners")
    args = parser.parse_args()

    if args.list:
        list_winners()
    elif args.batch and args.pick:
        add_from_batch(args.batch, args.pick, args.notes)
    elif args.video:
        add_from_video(args.video, args.notes)
    else:
        parser.print_help()


if __name__ == "__main__":
    main()
