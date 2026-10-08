# EDA Studio

EDA Studio is a local web application and Python toolkit for inspecting, cleaning, analysing, and reporting on tabular datasets. It provides an interactive workflow for data quality profiling, descriptive statistics, visualisation, correlation analysis, outlier review, feature engineering, and report export.

## Problem Statement

Dataset problems are often discovered late, after analysis or modelling has already begun. EDA Studio makes the early investigation repeatable by bringing schema checks, missing-value review, statistical summaries, relationships, anomalies, and exportable findings into one workflow.

## Objectives

- Provide a repeatable first pass over tabular data.
- Make data-quality issues visible before modelling or reporting.
- Keep browser-based exploration and reusable Python analysis modules together.

## Features

- Load CSV and XLSX files, or use the included sample datasets.
- Inspect schema, data types, completeness, uniqueness, and summary metrics.
- Clean missing values and duplicate records with an audit trail.
- Explore numerical and categorical statistics.
- Create interactive distribution, comparison, and temporal charts.
- Compare Pearson and Spearman correlations and rank strong relationships.
- Detect outliers with Tukey IQR and Z-score methods.
- Apply encoding, scaling, log transforms, ratio features, and winsorisation.
- View the Python modules, notebook, and technical report from the application.
- Export cleaned data, reports, and a project bundle.
- Optionally use a configured language model for additional insight summaries and dataset questions. The core EDA workflow works without it.
- Experience the interface as a premium, light-first analytics SaaS dashboard with polished cards, consistent theming, and crisp KPI surfaces.

## Technology Stack

- React 19 and TypeScript
- Vite and Tailwind CSS
- Express and Node.js
- Papa Parse, SheetJS, JSZip, Lucide React
- Python 3.12+, pandas, NumPy, SciPy, scikit-learn, Matplotlib, Seaborn, and Plotly

## Project Structure

```text
.
├── assets/                         Static application assets
├── data/                           Raw and processed datasets
├── notebooks/                      Exploratory analysis notebook
├── reports/                        Technical reports
├── src/
│   ├── components/                 React views and analysis panels
│   ├── data/                       Sample dataset definitions
│   ├── utils/                      Browser-side EDA engine
│   └── *.py                        Reusable Python analysis modules
├── index.html                      Application entry document
├── server.ts                       Express server and analysis API
├── package.json                    Node scripts and dependencies
├── requirements.txt                Python dependencies
├── tsconfig.json                   TypeScript configuration
└── vite.config.ts                  Vite configuration
```

## Installation

### Prerequisites

- Node.js 18 or newer
- npm
- Python 3.12 or newer for the Python toolkit and notebook

### Install dependencies

```bash
npm install
python -m venv .venv
```

Activate the virtual environment, then install Python dependencies:

```powershell
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

On macOS or Linux:

```bash
source .venv/bin/activate
pip install -r requirements.txt
```

## Configuration

No environment variables are required. The included `.env.example` documents that local operation uses the project files only.

## Running the Project

Start the development server:

```bash
npm run dev
```

Build and run the production bundle:

```bash
npm run build
npm start
```

The server serves the built frontend and API from the same port.

## Usage

1. Select a sample dataset or upload a CSV/Excel file.
2. Review the Overview tab for schema and data-quality indicators.
3. Run cleaning operations and inspect the audit results.
4. Explore statistics, visualisations, correlations, outliers, and engineered features.
5. Use the Insights tab for evidence-based summaries and optional dataset questions.
6. Export cleaned data, reports, or the complete project bundle.

## Netlify Deployment

This app is ready for static hosting on Netlify using the included `netlify.toml` configuration.

```bash
npm install
npm run build
npx netlify deploy --prod --dir=dist
```

The project expects a static SPA redirect to `index.html`, which is already configured in `netlify.toml`.

The Python modules can also be used independently. For example:

```python
from src.cleaning import run_cleaning_pipeline
from src.load_data import load_dataset
from src.statistics import compute_parametric_statistics

frame = load_dataset("data/raw/customer_churn.csv")
cleaned, audit = run_cleaning_pipeline(frame, impute_strategy="auto")
stats = compute_parametric_statistics(cleaned)
```

## Methodology

- Missing values: configurable drop, mean, median, mode, or automatic treatment.
- Correlation: Pearson linear correlation and Spearman rank correlation.
- Outliers: Tukey's $1.5 \times IQR$ fences and configurable Z-score thresholds.
- Scaling: standard scaling and min-max normalisation.
- Feature preparation: one-hot or label encoding, log transforms, ratios, and interactions.

## Dataset

The repository includes raw and processed customer-churn CSV files under `data/`, along with sample dataset definitions used by the web application. The sample data covers customer attributes, services, billing, support activity, satisfaction, and churn. An additional e-commerce customer behaviour sample is defined in `src/data/sampleDatasets.ts`.

## API

- `GET /api/health` returns the server status.
- Dataset insights and questions are calculated locally in the browser; no external analysis API is required.

## Testing

Run the available project checks:

```bash
npm run lint
npm run build
```

The repository does not currently define a Python test command. The Python toolkit can be checked by running the notebook or importing its modules from an analysis script.

## Limitations

- Automated Python and browser test suites are not currently included.
- Large-file processing is performed through the application workflow and may require additional optimisation for much larger datasets.
- Temporal decomposition and dataset drift monitoring are not currently implemented.

## Future Improvements

- Add automated Python unit tests and browser smoke tests.
- Add configurable temporal decomposition and drift detection.
- Improve large-file processing with streaming and worker-based parsing.
- Add saved analysis sessions and reusable export templates.

## License

This project is distributed under the MIT License. See [LICENSE](LICENSE) for details.
