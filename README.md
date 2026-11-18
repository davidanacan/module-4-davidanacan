# Mauna Loa CO₂ Explorer

An interactive version of the Mauna Loa analysis from ESPM 157 Module 1. Select dates and compare monthly atmospheric CO₂ with NOAA’s seasonally adjusted series. Open the data table to inspect exact values.

**Team members** · Add your names before submission.

## Run locally

Run `python -m http.server 8000 --directory web` and open http://localhost:8000. The app uses the NOAA source snapshot included in `web/`. Run `./refresh-data.sh` to update it.

## Browser tests

With the local server running, install dependencies with `python -m pip install -r requirements.txt` and install Chromium with `python -m playwright install --only-shell chromium`. Run `python -m unittest discover -s tests -v`.

## Publish on GitHub Pages

1. Put the contents of this project at the root of your Module 4 repository, including `.github/`.
2. In the GitHub repository, open **Settings → Pages** and select **GitHub Actions** as the source.
3. Run **Test and deploy** from the Actions tab if the default-branch push did not already start it.
4. Verify the deployment and add the live Pages link and the workflow status badge to this README. The badge lives at `https://github.com/OWNER/REPO/actions/workflows/pages.yml/badge.svg`.

## AI use

ChatGPT wrote the app, browser tests, workflow and documentation using our Module 1 climate notebook and the Module 4 rubric. It checked the March 1958 values against the notebook’s saved output and the NOAA source file.
