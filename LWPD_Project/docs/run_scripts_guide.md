# LWPD Script Run Guide (Main + Train Reports + Predict)

This guide explains how to run every important script in LWPD, including the main pipeline and URL prediction.

## 1) Project Root

Use this project root directory:

D:\PROJECTS\Collage_Projects\AWT_Project\LWPD_Project

If you run commands from another folder, you may get import errors.

## 2) Python Setup

Recommended interpreter:

C:\Python311\python.exe

Why this is recommended:

- It is stable with pandas and sklearn in this workspace.
- Your local .venv uses Python 3.14, which may trigger DLL policy issues in some environments.

## 3) Install Required Packages

Run once:

C:\Python311\python.exe -m pip install pandas numpy matplotlib scikit-learn joblib

## 4) Dataset Requirement

Keep this file available:

data\PhiUSIIL_Phishing_URL_Dataset.csv

The scripts automatically read from the data folder.

## 5) Script 1: Run Main Pipeline (Legacy Baseline)

Purpose:

- Uses src modules through main.py
- Trains baseline models
- Prints accuracy, precision, recall
- Saves confusion matrices and model_comparison graph

Command:

C:\Python311\python.exe D:\PROJECTS\Collage_Projects\AWT_Project\LWPD_Project\main.py

## 6) Script 2: Run Full Report Generator (Recommended for Paper)

Purpose:

- Trains 3 models with the latest pipeline
- Generates all paper figures (Fig. 2 to Fig. 10)
- Saves confusion matrices in compatible names
- Saves best model bundle for prediction
- Saves metrics CSV report

Command:

C:\Python311\python.exe D:\PROJECTS\Collage_Projects\AWT_Project\LWPD_Project\scripts\train_and_generate_reports.py

Outputs created:

- results\graphs\
- results\models\best_model.joblib
- results\reports\model_metrics.csv

## 7) Script 3: Run Single URL Prediction

Purpose:

- Loads best_model.joblib
- Extracts URL features
- Predicts Phishing or Legitimate
- Prints confidence when available

Command:

C:\Python311\python.exe D:\PROJECTS\Collage_Projects\AWT_Project\LWPD_Project\scripts\predict_url.py

## 8) How To Test Different URLs

Open:

scripts\predict_url.py

Edit this line:

TEST_URL = "http://secure-login-account-check.example.com/verify?id=89231"

Then run prediction again:

C:\Python311\python.exe D:\PROJECTS\Collage_Projects\AWT_Project\LWPD_Project\scripts\predict_url.py

## 9) Recommended End-to-End Order

1. Install packages (once)
2. Run full report generator script
3. Open dashboard.html to view generated figures
4. Run prediction script
5. Change TEST_URL and run prediction script again

## 10) Quick Troubleshooting

### Error: ModuleNotFoundError: No module named src

Fix:

Run commands from LWPD_Project root or use full file paths exactly as shown above.

### Error: Model file not found in prediction

Fix:

Run scripts\train_and_generate_reports.py first to generate:

results\models\best_model.joblib

### Error: pandas DLL blocked

Fix:

Use C:\Python311\python.exe instead of the .venv Python 3.14 interpreter.

## 11) Optional: Open Dashboard After Generation

File:

docs\dashboard.html

It reads generated images from:

results\graphs\

If any image is missing, run scripts\train_and_generate_reports.py again.
