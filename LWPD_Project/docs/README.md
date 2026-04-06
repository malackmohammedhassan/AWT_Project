# LWPD Project

Lightweight URL-based phishing detection using pandas, sklearn, and matplotlib only.

The project now uses the larger URL dataset in `data/PhiUSIIL_Phishing_URL_Dataset.csv`.

The active project rules are defined in `.github/copilot-instructions.md`.

## Structure

- `data/` for the CSV dataset
- `src/` for the pipeline code
- `results/graphs/` for saved plots
- `notebooks/` for optional notebook work
- `docs/` for notes

## Models

- Logistic Regression
- Decision Tree
- Naive Bayes

## Run

Place the dataset in `data/` with URL and label columns, then run:

```bash
python main.py
```

## Notes

- Only URL-based detection is implemented.
- DOM, WHOIS, and TLS features are reserved for future scope.
- Start with `.github/copilot-instructions.md` before making changes to scope or implementation.
- The `docs/` folder is for project notes, implementation history, and future scope only.
