# OlympicLens MVP

A beginner-friendly front-end prototype for the CodeFest 2026 Olympic analytics idea.

## Features included
- Medal KPI cards
- Year, country, and sport filters
- Country comparison bar chart
- Historical trend line chart
- Sport-wise medal chart
- Medal summary table
- Clearly labelled demo-only baseline estimate

## Run it
1. Extract the ZIP folder.
2. Open `index.html` in Chrome or Edge.
3. Keep an internet connection for Chart.js and Google Fonts to load.

No server or installation is required for this prototype.

## Important data warning
`app.js` currently contains illustrative sample values. They are NOT official Olympic results. Do not present the demo values as real statistics.

## Next development steps
1. Download a permitted, complete Olympic dataset (for example, a suitable Kaggle historical dataset) and review its licence.
2. Clean the data with Python/pandas and export a consistent CSV.
3. Replace the demo records with verified aggregates, including correct handling of team events and medal counts.
4. Add Python/scikit-learn training and back-test predictions on a past Games edition.
5. Save forecast output as JSON or CSV for the website to read.
6. Test filters, missing data, totals, and predictions before the demo.
