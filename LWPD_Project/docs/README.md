# LWPD Project Documentation (Latest)

Lightweight URL-based phishing detection with reproducible training, graph generation, dashboard visualization, and single-URL inference.

## Current Dataset

- Primary dataset: `data/PhiUSIIL_Phishing_URL_Dataset.csv`
- Active two-column pipeline view: `url`, `label`

## Current Model Stack

- Logistic Regression
- Decision Tree
- Naive Bayes

## Current Feature Set (URL-only)

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

## Latest Pipeline Scripts

- Main training + advanced figure generation:
  - `scripts/train_and_generate_reports.py`
- Single URL prediction demo:
  - `scripts/predict_url.py`

## How to Run (Recommended)

From the project root `LWPD_Project`, run:

1. `C:\Python311\python.exe scripts\train_and_generate_reports.py`
2. `C:\Python311\python.exe scripts\predict_url.py`

Notes:

- `scripts/predict_url.py` contains `TEST_URL` at the top.
- Change `TEST_URL` and rerun to show live phishing vs legitimate prediction.

## Artifacts Generated

### Graphs

Saved in `results/graphs/`:

- `confusion_matrix_logistic_regression.png`
- `confusion_matrix_decision_tree.png`
- `confusion_matrix_naive_bayes.png`
- `logistic_regression_confusion_matrix.png`
- `decision_tree_confusion_matrix.png`
- `naive_bayes_confusion_matrix.png`
- `fig2_decision_tree_feature_importance.png`
- `fig3_feature_distributions.png`
- `fig4_correlation_heatmap.png`
- `fig5_model_comparison_radar.png`
- `fig6_error_analysis_fp_fn.png`
- `fig7_roc_comparison.png`
- `fig8_pr_curve_comparison.png`
- `fig9_metrics_heatmap.png`
- `fig10_test_feature_spread.png`
- `model_comparison.png`

### Model + Reports

- Best model bundle: `results/models/best_model.joblib`
- Metrics table: `results/reports/model_metrics.csv`

## Dashboard

- File: `docs/dashboard.html`
- Current sections include:
  - dataset snapshot
  - pipeline flow
  - feature set
  - model metrics
  - interactive charts
  - confusion matrices
  - generated analysis figures (Fig. 2 to Fig. 10)

## Documentation Map

- Implementation details and verified metrics:
  - `docs/implementation_report.md`
- Future work boundaries and expansion plan:
  - `docs/future_scope.md`
- IEEE paper writing blueprint with section-by-section instructions:
  - `docs/ieee_research_paper_guide.md`
- Complete script execution guide (main, reports, prediction):
  - `docs/run_scripts_guide.md`

## Scope Reminder

- Current production scope is URL-based detection only.
- DOM, WHOIS, and TLS are intentionally excluded in this release.
