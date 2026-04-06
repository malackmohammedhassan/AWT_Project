from pathlib import Path

import pandas as pd


URL_COLUMNS = ("url", "urls", "website", "link", "address")
LABEL_COLUMNS = ("label", "class", "target", "result", "is_phishing", "phishing")
PREFERRED_DATASETS = (
    "PhiUSIIL_Phishing_URL_Dataset.csv",
    "phishing_urls.csv",
)


def _project_data_dir(data_dir: Path | None) -> Path:
    if data_dir is not None:
        return Path(data_dir)
    return Path(__file__).resolve().parents[1] / "data"


def _find_csv_file(data_dir: Path) -> Path:
    for filename in PREFERRED_DATASETS:
        preferred = data_dir / filename
        if preferred.exists():
            return preferred

    csv_files = sorted(data_dir.glob("*.csv"))
    if not csv_files:
        raise FileNotFoundError(f"No CSV file found in {data_dir}")
    return csv_files[0]


def _detect_column(columns, candidates):
    lower_map = {column.lower(): column for column in columns}
    for candidate in candidates:
        if candidate in lower_map:
            return lower_map[candidate]
    return None


def _standardize_label_values(series: pd.Series) -> pd.Series:
    if pd.api.types.is_numeric_dtype(series):
        return series.astype(int)

    normalized = series.astype(str).str.strip().str.lower()
    mapping = {
        "0": 0,
        "1": 1,
        "legit": 0,
        "legitimate": 0,
        "benign": 0,
        "safe": 0,
        "good": 0,
        "phishing": 1,
        "phish": 1,
        "malicious": 1,
        "bad": 1,
    }
    mapped = normalized.map(mapping)
    if mapped.isna().any():
        values = sorted(normalized.dropna().unique().tolist())
        raise ValueError(f"Unsupported label values: {values}")
    return mapped.astype(int)


def load_dataset(data_dir: Path | None = None):
    data_dir = _project_data_dir(data_dir)
    csv_path = _find_csv_file(data_dir)
    df = pd.read_csv(csv_path)

    url_column = _detect_column(df.columns, URL_COLUMNS)
    label_column = _detect_column(df.columns, LABEL_COLUMNS)

    if url_column is None or label_column is None:
        if len(df.columns) < 2:
            raise ValueError("Dataset must contain at least two columns: URL and label")
        url_column = df.columns[0]
        label_column = df.columns[1]

    data = df[[url_column, label_column]].copy().dropna()
    data = data.rename(columns={url_column: "url", label_column: "label"})
    data["url"] = data["url"].astype(str).str.strip()
    data["label"] = _standardize_label_values(data["label"])

    print("First 5 rows:")
    print(data.head())
    print("\nDataset shape:", data.shape)
    print("\nColumn names:", list(data.columns))
    print("\nMissing values:")
    print(data.isna().sum())
    print("\nClass distribution:")
    print(data["label"].value_counts().sort_index())

    return data, "url", "label", csv_path
