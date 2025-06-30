#!/usr/bin/env bash
set -euo pipefail

echo "Rendering Quarto courses and talks..."

for course in presentations/*; do
  if [ -f "$course/_quarto.yml" ]; then
    echo "Rendering course: $course"
    quarto render "$course"
  else
    echo "Skipping: $course (not a course root)"
  fi
done
