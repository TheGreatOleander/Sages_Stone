# systems/cli.py

import argparse
from systems.engine import Engine  # adjust if needed

def main():
    parser = argparse.ArgumentParser(
        prog="sages-stone",
        description="Sage's Stone system CLI"
    )

    parser.add_argument(
        "--version",
        action="store_true",
        help="Print version and exit"
    )

    args = parser.parse_args()

    if args.version:
        print("sages-stone 0.1.0")
        return

    print("Sage's Stone CLI initialized.")
    print("Systems online.")

if __name__ == "__main__":
    main()
