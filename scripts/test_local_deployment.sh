#!/usr/bin/env bash
set -euo pipefail

MODE="full"
SKIP_RENDER="false"
STRICT_LINKS="false"

usage() {
  cat <<'USAGE'
Usage: scripts/test_local_deployment.sh [--preflight] [--skip-render] [--strict-links] [--help]

Checks local deployment health for the Quarto site.

Options:
  --preflight    Run dependency and config checks only (no rendering)
  --skip-render  Skip the render step and validate existing _site output
  --strict-links Fail if rendered HTML contains unresolved .qmd links
  --help         Show this help message
USAGE
}

for arg in "$@"; do
  case "$arg" in
    --preflight)
      MODE="preflight"
      ;;
    --skip-render)
      SKIP_RENDER="true"
      ;;
    --strict-links)
      STRICT_LINKS="true"
      ;;
    --help|-h)
      usage
      exit 0
      ;;
    *)
      echo "Unknown option: $arg" >&2
      usage
      exit 2
      ;;
  esac
done

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
SITE_DIR="$REPO_ROOT/training_site"
OUTPUT_DIR="$SITE_DIR/_site"

log() {
  printf '[local-deploy-test] %s\n' "$*"
}

fail() {
  printf '[local-deploy-test] ERROR: %s\n' "$*" >&2
  exit 1
}

require_cmd() {
  command -v "$1" >/dev/null 2>&1 || fail "Missing required command: $1"
}

assert_file() {
  local path="$1"
  [[ -f "$path" ]] || fail "Expected file not found: $path"
}

assert_dir() {
  local path="$1"
  [[ -d "$path" ]] || fail "Expected directory not found: $path"
}

assert_contains() {
  local file="$1"
  local pattern="$2"
  rg -q "$pattern" "$file" || fail "Expected pattern '$pattern' not found in $file"
}

validate_qmd_hrefs_resolve() {
  local dir="$1"
  local broken_count=0
  local report_file
  report_file="$(mktemp)"

  while IFS= read -r html_file; do
    while IFS= read -r href_match; do
      local href qmd_path qmd_no_frag target_html
      href="${href_match#href=\"}"
      href="${href%\"}"
      qmd_path="${href%%\?*}"
      qmd_no_frag="${qmd_path%%\#*}"

      if [[ "$qmd_no_frag" == http* ]] || [[ "$qmd_no_frag" == mailto:* ]]; then
        continue
      fi

      target_html="$(dirname "$html_file")/$qmd_no_frag"
      target_html="${target_html%.qmd}.html"

      if [[ ! -f "$target_html" ]]; then
        printf '%s: unresolved qmd link -> %s (expected %s)\n' \
          "$html_file" "$href" "$target_html" >> "$report_file"
        broken_count=$((broken_count + 1))
      fi
    done < <(rg -o 'href="[^"]+\.qmd([#?][^"]*)?"' "$html_file" || true)
  done < <(find "$dir" -type f -name '*.html')

  if [[ "$broken_count" -gt 0 ]]; then
    if [[ "$STRICT_LINKS" == "true" ]]; then
      cat "$report_file" >&2
      rm -f "$report_file"
      fail "Found $broken_count unresolved .qmd links in rendered output"
    fi
    log "WARNING: Found $broken_count unresolved .qmd links in rendered output (non-strict mode)"
    log "Showing first 10 unresolved links:"
    sed -n '1,10p' "$report_file" >&2
    rm -f "$report_file"
    return 0
  fi

  rm -f "$report_file"
}

log "Repository root: $REPO_ROOT"
assert_dir "$SITE_DIR"
assert_file "$SITE_DIR/_quarto.yml"
assert_file "$SITE_DIR/requirements.txt"
assert_file "$SITE_DIR/renv.lock"

log "Running dependency preflight checks"
require_cmd rg
require_cmd find
require_cmd quarto

if command -v python3 >/dev/null 2>&1; then
  PYTHON_BIN="python3"
elif command -v python >/dev/null 2>&1; then
  PYTHON_BIN="python"
else
  fail "Missing Python (python3/python)"
fi

require_cmd "$PYTHON_BIN"

if command -v Rscript >/dev/null 2>&1; then
  log "Rscript detected"
else
  log "Rscript not found; render may fail for pages requiring R"
fi

log "Tool versions"
quarto --version || fail "Unable to run quarto --version"
"$PYTHON_BIN" --version || fail "Unable to run python --version"

if [[ "$MODE" == "preflight" ]]; then
  log "Preflight checks passed"
  exit 0
fi

if [[ "$SKIP_RENDER" != "true" ]]; then
  log "Rendering site (CI-aligned flags)"
  (
    cd "$SITE_DIR"
    export R_LIBS_USER="${R_LIBS_USER:-$HOME/.R/library}"
    export QUARTO_TMPDIR="$SITE_DIR/.tmp"
    mkdir -p "$QUARTO_TMPDIR"
    export PATH="$PATH:$HOME/.TinyTeX/bin/x86_64-linux:$HOME/.TinyTeX/bin/universal-darwin"
    quarto render . --no-cache --log-level debug
  ) || fail "quarto render failed"
else
  log "Skipping render as requested"
fi

log "Validating rendered output"
assert_dir "$OUTPUT_DIR"
assert_file "$OUTPUT_DIR/index.html"
assert_file "$OUTPUT_DIR/essential_digital_skills/index.html"
assert_file "$OUTPUT_DIR/responsible_use_of_generative_ai/index.html"
assert_file "$OUTPUT_DIR/applied_python/index.html"
assert_file "$OUTPUT_DIR/applied_R/index.html"

assert_contains "$OUTPUT_DIR/index.html" 'Digital Skills'
assert_contains "$OUTPUT_DIR/index.html" 'Essential Digital Skills'
assert_contains "$OUTPUT_DIR/index.html" 'Applied Data Science \(Python\)'
assert_contains "$OUTPUT_DIR/index.html" 'Applied Data Science \(R\)'

HTML_COUNT="$(find "$OUTPUT_DIR" -type f -name '*.html' | wc -l | tr -d ' ')"
if [[ "$HTML_COUNT" -lt 20 ]]; then
  fail "Unexpectedly low HTML page count: $HTML_COUNT"
fi

validate_qmd_hrefs_resolve "$OUTPUT_DIR"

log "Rendered HTML pages: $HTML_COUNT"
log "Local deployment smoke tests passed"
