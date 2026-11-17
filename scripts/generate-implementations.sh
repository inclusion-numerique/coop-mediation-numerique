#!/bin/bash
set -e

ENV="${ENV:-dev}"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
SRC_DIR="$SCRIPT_DIR/../src"

count=0

while IFS= read -r source_file; do
  target_file="${source_file%index.$ENV.ts}index.ts"

  cp "$source_file" "$target_file"
  count=$((count + 1))
done < <(find "$SRC_DIR" -name "index.$ENV.ts" -type f)

if [ "$count" -eq 0 ]; then
  echo "Warning: No index.$ENV.ts files found" >&2
  exit 0
fi

echo "Copied index.$ENV.ts → index.ts for $count module(s)"
