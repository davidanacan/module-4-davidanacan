# Design document

## Readers

Students and other readers interested in climate science can use the app to see how atmospheric CO₂ has changed and how the seasonal cycle appears over shorter periods.

## Data

The app builds on Part 1 of the Module 1 climate notebook. The [NOAA GML monthly Mauna Loa source](https://gml.noaa.gov/webdata/ccgg/trends/co2/co2_mm_mlo.txt) snapshot is 59,678 bytes and contains 823 records from March 1958 through September 2026. The browser reads a same-origin copy so that a deployment has reproducible values and works without a live cross-origin NOAA request. The refresh script downloads the original file and retains NOAA’s source header. Concentrations are in parts per million. Unavailable concentrations are shown as gaps, while estimates published by NOAA are retained. NOAA’s metadata explains the Scripps contribution, interpolation and the temporary use of Maunakea observations.

Selecting March 1958 with both series yields 315.71 ppm monthly and 314.44 ppm seasonally adjusted. These match both the saved Module 1 notebook output and the corresponding row in NOAA’s file. A browser test asserts the displayed values.

## Interactions

Start and end months set the inclusive date window. Series selection toggles the monthly mean and seasonally adjusted values. These controls update the chart, legend, value ranges and table. Reset dates restores the full date window. The table can be expanded to inspect exact values.

## Path

The responsive web app runs in the browser and can be hosted on GitHub Pages. The source data and rendering logic fit in static files.

## Dependencies

The app uses standard browser HTML, CSS, Canvas and JavaScript APIs. There are no third-party runtime libraries. Tests use Python 3.12 in CI, its standard-library HTTP server and unittest, and Playwright 1.62.0 with its matching Chromium revision. The workflow uses GitHub Checkout v4, Setup Python v5, Upload Pages Artifact v3 and Deploy Pages v4. The optional refresh script uses Bash, curl and awk to fetch and validate the source file.

## Tests

Browser tests check the notebook values, date selection, changing series, keyboard access to the data table, invalid dates, a missing value, a failed download, uncaught page errors and layout overflow at 375 pixels. The tests exercise Chromium. Remote deployment availability and future changes to NOAA’s source format are outside these tests.

## License

MIT allows reuse and modification of the app with preservation of the license notice. NOAA’s data notice makes the source freely available and explicitly encourages dissemination with attribution. The downloaded file retains that notice and its attribution to NOAA and Scripps. The MIT license applies to the app code. The source file is distributed under the terms in its NOAA data notice.

## Accessibility and layout

The controls wrap on narrow screens and use native keyboard interaction and visible focus. The two chart lines use solid and dashed strokes and have matching labels. Readers can access the same values in a labeled HTML table. The status region announces date and series updates.
