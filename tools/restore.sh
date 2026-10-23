#!/bin/sh
set -eu
if [ "$#" != 1 ]; then echo "Usage: $0 <TV_IP>:5555" >&2; exit 1; fi
exec python3 "$(dirname "$0")/tv.py" --device "$1" helper-off
