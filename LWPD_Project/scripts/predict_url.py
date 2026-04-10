from __future__ import annotations

from pathlib import Path
from urllib.parse import urlparse

import joblib
import pandas as pd


PROJECT_ROOT = Path(__file__).resolve().parents[1]
MODEL_PATH = PROJECT_ROOT / "results" / "models" / "best_model.joblib"

# To test prediction, change TEST_URL and run this file again.
TEST_URL = "http://secure-login-account-check.example.com/verify?id=89231"


def _has_ip_address(host: str) -> int:
    parts = host.split(".")
    if len(parts) != 4:
        return 0
    try:
        return int(all(0 <= int(part) <= 255 for part in parts))
    except ValueError:
        return 0


def extract_url_features(url: str) -> dict[str, int]:
    parsed = urlparse(url)
    host = parsed.netloc.split(":")[0]

    return {
        "url_length": len(url),
        "domain_length": len(host),
        "path_length": len(parsed.path),
        "query_length": len(parsed.query),
        "digit_count": sum(ch.isdigit() for ch in url),
        "letter_count": sum(ch.isalpha() for ch in url),
        "dot_count": url.count("."),
        "hyphen_count": url.count("-"),
        "slash_count": url.count("/"),
        "special_char_count": sum(not ch.isalnum() for ch in url),
        "has_https": int(parsed.scheme.lower() == "https"),
        "has_ip": _has_ip_address(host),
    }


def main() -> None:
    if not MODEL_PATH.exists():
        raise FileNotFoundError(
            "Model file not found. Run scripts/train_and_generate_reports.py first."
        )

    payload = joblib.load(MODEL_PATH)
    model = payload["model"]
    feature_names = payload["feature_names"]

    feature_row = extract_url_features(TEST_URL)
    input_frame = pd.DataFrame([feature_row])[feature_names]

    predicted_label = int(model.predict(input_frame)[0])
    predicted_name = "Phishing" if predicted_label == 1 else "Legitimate"

    print(f"URL: {TEST_URL}")
    print(f"Prediction: {predicted_name}")

    if hasattr(model, "predict_proba"):
        confidence = float(model.predict_proba(input_frame)[0][predicted_label])
        print(f"Confidence: {confidence:.4f}")

    print("\nTo test prediction, change TEST_URL in scripts/predict_url.py and run again.")


if __name__ == "__main__":
    main()
