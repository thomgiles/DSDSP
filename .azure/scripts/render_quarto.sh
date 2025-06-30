#!/usr/bin/env bash
set -e

echo "Rendering Quarto presentations..."

for dir in presentations/*; do
  if [ -f "$dir/index.qmd" ]; then
    echo "Rendering: $dir"
    quarto render "$dir"
  fi
done