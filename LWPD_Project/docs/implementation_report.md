# LWPD Implementation Report (Latest)

## Purpose

This report captures the current, verified implementation state of LWPD after adding:

- advanced graph generation
- dashboard expansion
- saved best-model artifact
- single-URL prediction script

It is the canonical engineering reference before writing the IEEE paper.

## Project Goal

Build a lightweight URL-based phishing classifier with reproducible training and publication-ready visual evidence.

## Scope Lock

Implemented scope is intentionally restricted to:

- URL-only features
- classical ML models
- local artifacts (graphs, metrics, model bundle)
- no live API dependency for paper evidence

Not in scope in this version:

- DOM parsing features
- WHOIS features
- TLS certificate features
- deep learning architectures

## Code and Data Components

### Data

- Dataset: `data/PhiUSIIL_Phishing_URL_Dataset.csv`
- Processed columns for pipeline: `url`, `label`

### Core Modules

- Data loading and schema handling: `src/data_loader.py`
- Legacy model utilities: `src/model_training.py`, `src/evaluation.py`
- Original orchestration: `main.py`

### New End-to-End Script

- `scripts/train_and_generate_reports.py`

Responsibilities:

- load and normalize dataset
- extract 12 URL-based features
- split train/test with reproducible random state
- train 3 models
- compute metrics (accuracy, precision, recall, F1)
- compute confusion matrix, FP, FN counts
- generate and save Fig. 2 to Fig. 10
- save confusion matrices in both naming styles for dashboard compatibility
- save best model as `results/models/best_model.joblib`
- save metrics table as `results/reports/model_metrics.csv`

### New Inference Script

- `scripts/predict_url.py`

Responsibilities:

- load saved best model bundle
- extract same 12 features from one URL
- predict class (Phishing or Legitimate)
- print confidence if supported
- supports manual URL testing via `TEST_URL`

## Feature Engineering (Implemented)

The 12 active features are:

- url_length
- domain_length
- path_length
- query_length
- digit_count
- letter_count
- dot_count
- hyphen_count
- slash_count
- special_char_count
- has_https
- has_ip

## Model Set (Implemented)

- Logistic Regression (with scaling)
- Decision Tree
- Naive Bayes

## Data Split

- 80/20 train-test split
- random state fixed to 42
- stratified split by label

## Latest Verified Performance

From latest generated report (`results/reports/model_metrics.csv`):

- Decision Tree
  - Accuracy: 0.995144
  - Precision: 0.992486
  - Recall: 0.999073
  - F1: 0.995769
  - False Positives: 204
  - False Negatives: 25

- Logistic Regression
  - Accuracy: 0.993151
  - Precision: 0.988631
  - Recall: 0.999518
  - F1: 0.994045
  - False Positives: 310
  - False Negatives: 13

- Naive Bayes
  - Accuracy: 0.991730
  - Precision: 0.989178
  - Recall: 0.996440
  - F1: 0.992796
  - False Positives: 294
  - False Negatives: 96

## Visualization Outputs (Current)

All saved in `results/graphs/`:

- Confusion matrices:
  - `confusion_matrix_logistic_regression.png`
  - `confusion_matrix_decision_tree.png`
  - `confusion_matrix_naive_bayes.png`
  - `logistic_regression_confusion_matrix.png`
  - `decision_tree_confusion_matrix.png`
  - `naive_bayes_confusion_matrix.png`
- Publication figures:
  - `fig2_decision_tree_feature_importance.png`
  - `fig3_feature_distributions.png`
  - `fig4_correlation_heatmap.png`
  - `fig5_model_comparison_radar.png`
  - `fig6_error_analysis_fp_fn.png`
  - `fig7_roc_comparison.png`
  - `fig8_pr_curve_comparison.png`
  - `fig9_metrics_heatmap.png`
  - `fig10_test_feature_spread.png`
- Additional chart:
  - `model_comparison.png`

## Dashboard State (Current)

`docs/dashboard.html` now contains:

- model KPI and metrics table
- 4 interactive charts (accuracy, precision-recall, F1, FP/FN)
- confusion matrix section with fallback image loading
- generated figure section for Fig. 2 to Fig. 10

This allows a full static demo without backend dependency.

## Reproducibility Commands

From `LWPD_Project` root:

1. `C:\Python311\python.exe scripts\train_and_generate_reports.py`
2. `C:\Python311\python.exe scripts\predict_url.py`

To test another URL, edit `TEST_URL` in `scripts/predict_url.py` and rerun step 2.

## IEEE Paper Readiness

The project now provides all required evidence types for an IEEE ML paper:

- clear dataset description
- deterministic feature engineering
- baseline model comparison
- confusion matrices
- ROC and PR curves
- FP/FN analysis
- saved model for reproducible inference demo

Detailed paper-writing guidance is documented in:

- `docs/ieee_research_paper_guide.md`
