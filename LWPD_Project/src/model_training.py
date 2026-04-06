from urllib.parse import urlparse

import pandas as pd
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.naive_bayes import GaussianNB
from sklearn.tree import DecisionTreeClassifier


def _build_url_features(url_series: pd.Series) -> pd.DataFrame:
    urls = url_series.fillna("").astype(str)
    parsed_urls = [urlparse(url) for url in urls.tolist()]

    return pd.DataFrame(
        {
            "url_length": urls.str.len(),
            "domain_length": [len(parsed.netloc) for parsed in parsed_urls],
            "path_length": [len(parsed.path) for parsed in parsed_urls],
            "query_length": [len(parsed.query) for parsed in parsed_urls],
            "digit_count": urls.str.count(r"\d"),
            "letter_count": urls.str.count(r"[A-Za-z]"),
            "dot_count": urls.str.count(r"\."),
            "hyphen_count": urls.str.count(r"-"),
            "slash_count": urls.str.count(r"/"),
            "special_char_count": urls.str.count(r"[@?_=&%]"),
            "uses_https": urls.str.startswith("https").astype(int),
            "has_ip": urls.str.contains(r"(?:\d{1,3}\.){3}\d{1,3}", regex=True).astype(int),
        }
    )


def prepare_data(dataframe, url_column, label_column):
    features = _build_url_features(dataframe[url_column])

    train_features, test_features, train_labels, test_labels = train_test_split(
        features,
        dataframe[label_column],
        test_size=0.2,
        random_state=42,
        stratify=dataframe[label_column],
    )

    return train_features, test_features, train_labels, test_labels, None


def train_models(train_features, train_labels):
    models = {
        "Logistic Regression": LogisticRegression(max_iter=1000, random_state=42),
        "Decision Tree": DecisionTreeClassifier(random_state=42),
        "Naive Bayes": GaussianNB(),
    }

    trained_models = {}
    for name, model in models.items():
        model.fit(train_features, train_labels)
        trained_models[name] = model

    return trained_models
