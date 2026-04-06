# LWPD Copilot Instructions

This is an IEEE research paper project. Every suggestion, edit, or generation must strictly respect the rules below. Do not deviate. Do not improve beyond scope. Do not add anything not listed here.

---

## Project Identity

- Name: LWPD (Lightweight Phishing Detection)
- Purpose: URL-based phishing detection for an IEEE Advanced Web Technology research paper
- Dataset: `data/PhiUSIIL_Phishing_URL_Dataset.csv` (235,795 rows, binary label)

---

## HARD RULES — Never Violate These

### Scope

- Only URL-based phishing detection is in scope
- Do NOT add DOM-based detection
- Do NOT add WHOIS-based detection
- Do NOT add TLS or certificate-based detection
- These are future scope only and must never touch active code

### Libraries

- Use ONLY: `pandas`, `sklearn`, `matplotlib`
- Do NOT suggest or add: `tensorflow`, `torch`, `keras`, `xgboost`, `lightgbm`, `requests`, `bs4`, `whois`, `cryptography`, `flask`, `fastapi`, or any other library
- If a task cannot be done with `pandas`, `sklearn`, and `matplotlib`, do not do it

### Models

- Train ONLY these three models:
  - Logistic Regression
  - Decision Tree
  - Naive Bayes
- Do NOT add: Random Forest, SVM, Neural Networks, ensemble methods, or any other model

### Data

- Always load data from the `data/` folder only
- Never hardcode external paths
- Never fetch data from URLs or APIs

### Features

- Extract ONLY these URL-based features:
  - url_length, domain_length, path_length, query_length
  - digit_count, letter_count, dot_count, hyphen_count, slash_count, special_char_count
  - has_https (flag), has_ip (flag)
- Do NOT add any DOM, WHOIS, or TLS-based features

### Train/Test Split

- Always use 80/20 split
- Always use a fixed random seed for reproducibility

### Evaluation

- Every model must output: Accuracy, Precision, Recall, Confusion Matrix
- Do NOT add F1-score, ROC-AUC, or other metrics unless explicitly asked

---

## Project Structure — Do Not Change

```
data/               ← dataset CSV only
src/
  data_loader.py    ← loading and inspection only
  model_training.py ← training only
  evaluation.py     ← metrics and graph saving only
results/graphs/     ← all saved plots go here only
notebooks/          ← optional, do not touch unless asked
docs/               ← documentation only
main.py             ← single entry point, runs everything
```

- Do NOT create new files outside this structure
- Do NOT rename existing files
- Do NOT add subfolders
- Use `.github/copilot-instructions.md` as the active global rule source for this project

---

## Code Style Rules

- Keep code minimal — no unnecessary classes, no complex abstractions
- Use plain functions only
- No decorators, no config files, no logging frameworks
- No argparse, no CLI flags, no environment variables
- No overengineering of any kind
- Every function should do exactly one thing

---

## Output Rules

- Save all plots to `results/graphs/` only
- Generate exactly: one confusion matrix plot per model + one accuracy comparison bar chart
- Print all metrics clearly to console
- Do NOT open matplotlib windows interactively (`plt.show()` is only for notebooks)

---

## What "Complete" Means

The project is complete when:

1. 3 models are trained on the same dataset with the same 80/20 split
2. Accuracy, Precision, Recall, and Confusion Matrix are output for each model
3. All 4 graphs are saved to `results/graphs/`
4. `python main.py` runs the entire pipeline from start to finish without errors

---

## Future Scope — Do Not Touch

These are documented as future work only. Never add them to active code:

- DOM-based features
- WHOIS-based features
- TLS/certificate-based features
- Deep learning models
- REST APIs
- Web application layer
- Any additional infrastructure

---

## Before You Suggest Anything

Ask yourself:

1. Does this stay within URL-based detection only? If no → reject it
2. Does this use only pandas, sklearn, matplotlib? If no → reject it
3. Does this add a 4th model or extra metric? If yes → reject it
4. Does this change the folder structure or file names? If yes → reject it
5. Does this add complexity not in the original scope? If yes → reject it

If all 5 answers pass, the suggestion is allowed.

---

## Presentation Layer — docs/dashboard.html

This file is a STATIC PAPER ARTIFACT. It is NOT part of the ML pipeline.

Rules (strict):

- All metric values are HARDCODED — do NOT connect to main.py or src/
- Do NOT add Python, Flask, FastAPI, or any backend
- Do NOT add live model inference or dynamic computation
- Allowed libraries: Chart.js (CDN only), Google Fonts CDN only
- Confusion matrix images are loaded as <img> tags from ../results/graphs/ only
- File must open directly in a browser via file:// — zero server dependencies

DO NOT touch src/, main.py, data/, or results/ when editing this file.
This file lives in docs/ only. It is the visual explanation layer — not the system.
