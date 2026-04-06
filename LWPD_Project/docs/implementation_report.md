# LWPD Implementation Report

## Purpose

This document records exactly what has been implemented in the LWPD project, what has been achieved, and what is intentionally not included. It is meant to be the permanent reference for future work so the project scope does not drift.

## Project Goal

Build a lightweight phishing detection pipeline that classifies phishing URLs using machine learning.

The project rules are defined first in [`.github/copilot-instructions.md`](../.github/copilot-instructions.md). That file is the first place to check before changing scope, structure, or implementation details.

The project is intentionally restricted to:

- URL-based phishing detection only
- `pandas`, `sklearn`, and `matplotlib` only
- Minimal code structure
- End-to-end execution in one script

## What Has Been Implemented

### 1. Project Structure

The project follows the required folder layout:

- `data/`
- `src/`
- `results/graphs/`
- `notebooks/`
- `docs/`

### 2. Data Loading

A reusable loader was implemented in `src/data_loader.py`.

What it does:

- Loads the dataset from the `data/` folder only
- Automatically selects the preferred CSV dataset
- Supports the large real dataset `PhiUSIIL_Phishing_URL_Dataset.csv`
- Detects the URL column and label column
- Standardizes the dataset into a clean two-column format: `url` and `label`
- Prints the required dataset inspection output:
  - first 5 rows
  - dataset shape
  - column names
  - missing values
  - class distribution

### 3. Dataset Used

The project now uses the larger real phishing URL dataset:

- `data/PhiUSIIL_Phishing_URL_Dataset.csv`

Dataset size confirmed during execution:

- 235,795 rows
- 56 original columns
- `url` and `label` are extracted for the pipeline

### 4. Preprocessing

Basic preprocessing is done inside the pipeline:

- Missing rows are removed from the selected URL and label columns
- URL text is normalized as strings
- Labels are converted to numeric form
- URL-based numerical features are generated for model training

The feature extraction is URL-only and does not use DOM, WHOIS, or TLS.

Generated URL features include:

- URL length
- domain length
- path length
- query length
- digit count
- letter count
- dot count
- hyphen count
- slash count
- special character count
- HTTPS flag
- IP-address flag

### 5. Train/Test Split

The dataset is split using:

- 80% training
- 20% testing

The split is reproducible with a fixed random seed.

### 6. Models Implemented

Exactly three models are trained, as required:

- Logistic Regression
- Decision Tree
- Naive Bayes

The models are trained on the same dataset and the same split.

### 7. Evaluation

Each model outputs the required metrics:

- Accuracy
- Precision
- Recall
- Confusion Matrix

The confusion matrix is also plotted and saved for each model.

### 8. Graphs and Outputs

All visual outputs are saved to:

- `results/graphs/`

Saved graph outputs include:

- one confusion matrix plot per model
- one accuracy comparison bar chart

### 9. End-to-End Execution

The entire pipeline runs from one entry script:

- `main.py`

It performs:

- data loading
- preprocessing
- feature creation
- train/test split
- model training
- evaluation
- graph saving
- metric printing

## What Has Been Achieved

The project now fully satisfies the requested LWPD scope.

### Achieved Requirements

- URL-based phishing detection is implemented
- The real large dataset is used from the `data/` folder
- Only the allowed libraries are used
- Three required models are trained
- 80/20 split is used
- Accuracy, precision, recall, and confusion matrix are generated for each model
- Confusion matrix graphs are saved
- Model accuracy comparison chart is saved
- The pipeline runs end to end successfully
- The code stays minimal and avoids unnecessary abstractions

### Latest Verified Metrics

Run against `PhiUSIIL_Phishing_URL_Dataset.csv` produced:

- Logistic Regression
  - Accuracy: 0.9932
  - Precision: 0.9887
  - Recall: 0.9994

- Decision Tree
  - Accuracy: 0.9951
  - Precision: 0.9925
  - Recall: 0.9989

- Naive Bayes
  - Accuracy: 0.9921
  - Precision: 0.9890
  - Recall: 0.9972

## Files Created or Updated

- `main.py`
- `src/data_loader.py`
- `src/model_training.py`
- `src/evaluation.py`
- `.github/copilot-instructions.md`
- `docs/README.md`
- `docs/future_scope.md`
- `docs/implementation_report.md`

## Future Scope

These items are intentionally not implemented in the current version:

- DOM-based features
- WHOIS-based features
- TLS/certificate-based features
- Deep learning
- APIs
- Web application layer

## Usage Reminder

To rerun the project:

1. Keep the dataset in `data/`
2. Run `python main.py`
3. Check `results/graphs/` for saved plots
4. Read the printed metrics in the console

## Notes for Future Work

If the dataset schema changes, only the loader may need adjustment. The rest of the pipeline is designed to remain stable as long as a URL column and a binary label column are available.

If future work expands beyond URL-only detection, that should be documented separately and kept out of the current scope unless the project rules are explicitly changed.
