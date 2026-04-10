# Future Scope (Post-Publication Roadmap)

The current release is intentionally URL-only. The roadmap below defines high-impact next steps for extending research quality after the baseline paper submission.

## 1) Feature Expansion

### A. Domain and Registration Intelligence

- WHOIS age, registrar, update frequency
- domain reputation feeds
- ASN and hosting risk signals

Expected impact:

- better detection of newly registered malicious domains
- lower false negatives for short but suspicious URLs

### B. TLS and Certificate Signals

- certificate issuer trust level
- certificate validity period anomalies
- mismatch between CN/SAN and domain patterns

Expected impact:

- better discrimination of phishing pages using weak or mismatched certificates

### C. Page and Content Signals (DOM)

- login-form presence with external post targets
- obfuscated JavaScript indicators
- suspicious iframe/script inclusion

Expected impact:

- improved resilience against phishing pages that mimic legitimate URL shapes

## 2) Modeling Expansion

- gradient boosting baselines (XGBoost/LightGBM/CatBoost)
- calibrated probability models
- ensemble stacking with explainability checks

Expected impact:

- stronger AUC and precision-recall tradeoffs
- better threshold tuning for deployment scenarios

## 3) Dataset and Validation Expansion

- time-based split validation (simulate real deployment drift)
- cross-dataset transfer tests
- hard-negative mining for confusing legitimate URLs

Expected impact:

- stronger claims in generalization and robustness sections of the paper

## 4) Explainability and Trust

- SHAP or permutation importance comparison
- per-feature risk contribution reporting
- model confidence calibration analysis

Expected impact:

- improves interpretability section quality for IEEE review

## 5) Deployment and Systems Layer

- lightweight inference API for real-time classification
- browser extension or mail gateway integration prototype
- latency and throughput benchmarking

Expected impact:

- transforms the work from pure ML study to application-ready security system

## 6) Adversarial and Security Testing

- URL mutation attacks
- homograph and unicode trick testing
- evasion analysis under feature perturbation

Expected impact:

- stronger security contribution and defense validity

## 7) Publication Improvement Targets

- confidence intervals for all reported metrics
- statistical significance tests between models
- ablation studies for each feature group
- error taxonomy linked to FP/FN classes

Expected impact:

- higher quality evidence for top-tier conference/journal review
