# Mauna Loa CO₂ Explorer
[![Test and deploy](https://github.com/davidanacan/module-4-davidanacan/actions/workflows/pages.yml/badge.svg)](https://github.com/davidanacan/module-4-davidanacan/actions/workflows/pages.yml)

An interactive version of the Mauna Loa analysis from ESPM 157 Module 1. Select dates and compare monthly atmospheric CO₂ with NOAA’s seasonally adjusted series. Open the data table to inspect exact values.

**Team members** ·
David Anacan

## Run locally

Run `python -m http.server 8000 --directory web` and open http://localhost:8000. The app uses the NOAA source snapshot included in `web/`. Run `./refresh-data.sh` to update it.

## Browser tests

With the local server running, install dependencies with `python -m pip install -r requirements.txt` and install Chromium with `python -m playwright install --only-shell chromium`. Run `python -m unittest discover -s tests -v`.

## Live URL 

https://davidanacan.github.io/module-4-davidanacan/

## AI use

ChatGPT wrote the app, browser tests, workflow and documentation using our Module 1 climate notebook and the Module 4 rubric. It checked the March 1958 values against the notebook’s saved output and the NOAA source file.
