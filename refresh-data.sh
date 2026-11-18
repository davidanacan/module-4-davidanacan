#!/usr/bin/env bash
set -euo pipefail
cd -- "$(dirname -- "$0")"
snapshot=$(mktemp web/.noaa-XXXXXX)
trap 'rm -f "$snapshot"' EXIT
curl --fail --location --silent --show-error --max-time 60 \
  https://gml.noaa.gov/webdata/ccgg/trends/co2/co2_mm_mlo.txt -o "$snapshot"
awk 'NF == 8 && $1 == 1958 && $2 == 3 {found = 1} END {exit !found}' "$snapshot"
chmod 644 "$snapshot"
mv -f "$snapshot" web/noaa-co2.txt
