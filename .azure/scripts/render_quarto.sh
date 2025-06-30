#!/usr/bin/env bash
set -euo pipefail

echo "Rendering all Quarto presentations..."

for dir in presentations/*; do
  if [[ -f "$dir/index.qmd" ]]; then
    echo "Rendering: $dir"
    quarto render "$dir"
  else
    echo "Skipping $dir (no index.qmd)"
  fi
done
