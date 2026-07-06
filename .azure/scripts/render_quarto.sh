#!/usr/bin/env bash
set -euo pipefail

echo "Rendering all Quarto course sites..."

for course in presentations/*; do
  if [ -f "$course/_quarto.yml" ]; then
    echo "Rendering: $course"
    quarto render "$course"
  else
    echo "Skipping: $course (no _quarto.yml)"
  fi
done