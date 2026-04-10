# IEEE Research Paper Guide for LWPD (Complete Blueprint)

This document explains exactly how to convert the current LWPD implementation into a strong IEEE-style research paper.

It is written as a practical blueprint, not generic advice.

## 1) Paper Positioning

## Problem Statement

Phishing attacks remain a major cyber threat. Many advanced approaches are accurate but expensive or difficult to deploy. This work studies whether a lightweight URL-only approach can still achieve high detection performance.

## Core Research Claim

A URL-only feature set, when engineered carefully and evaluated with multiple ML baselines, can deliver high phishing detection performance with low system complexity.

## Novelty Angle You Should Emphasize

- lightweight, reproducible, and deployment-friendly design
- strong metrics on a large real dataset
- comprehensive error and curve-based analysis (not only accuracy)
- static dashboard artifact for explainable result communication

## 2) IEEE Structure You Should Follow

Use this exact section order unless your target venue requires a different template.

1. Title
2. Abstract
3. Keywords
4. Introduction
5. Related Work
6. Methodology
7. Experimental Setup
8. Results and Discussion
9. Limitations
10. Conclusion and Future Work
11. References

## 3) Title and Abstract

## Title Guidelines

A strong title for this project should include:

- phishing detection
- lightweight or URL-based
- machine learning

Example style:

Lightweight URL-Based Phishing Detection Using Classical Machine Learning: A Reproducible Comparative Study

## Abstract Formula

Your abstract should have 5 compact blocks:

- Context: phishing is important
- Gap: heavy methods are costly
- Method: URL-only features + 3 ML models
- Result: include key metric numbers
- Impact: practical and reproducible

Keep abstract around 170 to 220 words.

## 4) Introduction (What To Write)

In introduction, include:

- cyber threat context and phishing scale
- why URL-only features are attractive (speed, low cost, privacy)
- limitations of heavier pipelines for some deployments
- your contributions list

## Contribution Bullets (Recommended)

Use 3 to 5 bullets. Suggested version:

- We design a reproducible URL-only phishing detection pipeline using 12 handcrafted lexical features.
- We compare Logistic Regression, Decision Tree, and Naive Bayes under identical split and evaluation settings.
- We provide broad evidence through confusion matrices, feature importance, correlation analysis, radar/ROC/PR curves, and FP/FN breakdown.
- We release static artifacts (figures, dashboard, saved model, and prediction script) to support reproducibility and practical demonstration.

## 5) Related Work

Split related work into clear subgroups:

- URL lexical methods
- content/DOM methods
- hybrid and deep learning methods

For each group:

- mention common strengths
- mention limitations
- explain why your lightweight baseline is still relevant

Do not claim your approach is universally best. Claim it is strong under low-complexity constraints.

## 6) Methodology Section (Map to Code)

Describe pipeline in the same order as implementation.

## Data and Labeling

State:

- dataset source file: data/PhiUSIIL_Phishing_URL_Dataset.csv
- final columns used: url and label
- binary label convention

## Feature Engineering

List all 12 features and briefly explain why each helps.

## Train/Test Protocol

State:

- stratified split, 80/20
- fixed random seed 42

## Models

Explain why each model is included:

- Logistic Regression: strong linear baseline
- Decision Tree: interpretable nonlinear baseline
- Naive Bayes: probabilistic lightweight baseline

## 7) Experimental Setup

Include all reproducibility details:

- programming language and main libraries
- operating environment (Windows setup if relevant)
- command sequence used to generate results

Recommended command block to report in paper text:

- C:\Python311\python.exe scripts\train_and_generate_reports.py
- C:\Python311\python.exe scripts\predict_url.py

Mention that the best model is serialized to results/models/best_model.joblib.

## 8) Results and Discussion (Figure-by-Figure Plan)

This is the most important section for review quality.

Use the following order for discussion.

## Table: Core Metrics

Use values from results/reports/model_metrics.csv.

Discuss:

- best overall accuracy
- precision-recall tradeoff
- implications of FP and FN in cybersecurity context

## Fig. 2 Feature Importance

File:

- results/graphs/fig2_decision_tree_feature_importance.png

Interpretation points:

- which URL attributes dominate decisions
- why url_length/path_length/query_length can separate phishing behavior

## Fig. 3 Distribution Analysis

File:

- results/graphs/fig3_feature_distributions.png

Interpretation points:

- class overlap regions
- where lexical signals are separable vs ambiguous

## Fig. 4 Correlation Heatmap

File:

- results/graphs/fig4_correlation_heatmap.png

Interpretation points:

- identify correlated feature groups
- discuss potential redundancy and why model still performs well

## Fig. 5 Radar Comparison

File:

- results/graphs/fig5_model_comparison_radar.png

Interpretation points:

- quick multi-metric comparison
- highlight tradeoff shape per model

## Fig. 6 FP/FN Analysis

File:

- results/graphs/fig6_error_analysis_fp_fn.png

Interpretation points:

- operational meaning of false positives and false negatives
- which model is safer under phishing-risk assumptions

## Fig. 7 ROC Curves

File:

- results/graphs/fig7_roc_comparison.png

Interpretation points:

- threshold-independent performance
- AUC comparison and robustness

## Fig. 8 Precision-Recall Curves

File:

- results/graphs/fig8_pr_curve_comparison.png

Interpretation points:

- performance under class imbalance concerns
- why PR is important in phishing detection tasks

## Fig. 9 Metrics Heatmap

File:

- results/graphs/fig9_metrics_heatmap.png

Interpretation points:

- compact view of model consistency
- identify best balanced candidate

## Fig. 10 Feature Spread

File:

- results/graphs/fig10_test_feature_spread.png

Interpretation points:

- variance and outlier behavior
- implications for model stability

## 9) Error Analysis Quality Upgrade (Reviewer-Friendly)

To strengthen paper quality, include:

- qualitative examples of FP URLs and FN URLs
- pattern-level explanation (for example, short phishing URLs or long legitimate URLs)
- security consequence discussion of FN errors

## 10) Limitations Section (Must Be Honest)

Clearly state:

- URL-only features cannot capture full webpage behavior
- adversarial URL obfuscation can still bypass lexical detectors
- no temporal drift experiment in current baseline

Being explicit here improves reviewer trust.

## 11) Conclusion Section

Your conclusion should contain:

- what was done
- what was achieved quantitatively
- why it matters practically
- short future direction line

Do not add new claims in conclusion.

## 12) References and Citation Quality

Use only high-quality sources:

- recent phishing detection papers (last 5 years preferred)
- classic baseline citations for ML methods
- dataset source citation

Avoid weak references (blogs, non-archival sources) unless absolutely necessary.

## 13) Figure and Table Writing Rules

For each figure/table in the paper:

- reference it in text before it appears
- explain what it shows
- explain why it matters
- connect it to one explicit claim

Do not leave any figure unexplained.

## 14) Writing Quality Checklist Before Submission

- Title is specific and technical
- Abstract includes method and numbers
- Contributions are explicit and measurable
- Methodology can be reproduced from description
- Results are not only accuracy-based
- Limitations are stated honestly
- Grammar and tense are consistent
- Every claim has evidence (table, figure, or citation)

## 15) Reproducibility Checklist for Paper Appendix

Include a short reproducibility appendix with:

- dataset filename
- feature list
- train-test split details
- model hyperparameters
- command list
- output artifact paths

## 16) Suggested Mapping from Project Files to Paper Sections

- Methodology source: src/data_loader.py, scripts/train_and_generate_reports.py
- Evaluation evidence: results/reports/model_metrics.csv
- Figure evidence: results/graphs/\*
- Practical demonstration: scripts/predict_url.py
- Visual narrative: docs/dashboard.html

## 17) Minimal High-Quality Claim Set (Safe and Strong)

Use these claim styles in the paper:

- The proposed lightweight pipeline achieved above 99 percent accuracy across all three baseline models on the selected dataset split.
- Decision Tree achieved the highest overall accuracy among tested models in the current configuration.
- Error analysis shows measurable differences in false-positive and false-negative behavior, supporting model selection based on deployment risk preference.

Avoid overclaiming:

- do not claim universal superiority over all phishing detection systems
- do not claim real-time production readiness unless latency tests are included

## 18) Final Submission Sequence

1. Freeze metrics and figures from one clean run
2. Write full draft using this guide
3. Verify all figure references and numbering
4. Run language and formatting review
5. Validate IEEE template compliance
6. Submit

This guide is intentionally detailed so you can directly convert your current implementation into a publication-ready IEEE manuscript.
