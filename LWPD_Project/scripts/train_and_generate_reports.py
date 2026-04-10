from __future__ import annotations

from pathlib import Path
from typing import Any, cast
from urllib.parse import urlparse

import joblib
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    accuracy_score,
    confusion_matrix,
    f1_score,
    precision_recall_curve,
    precision_score,
    recall_score,
    roc_auc_score,
    roc_curve,
)
from sklearn.model_selection import train_test_split
from sklearn.naive_bayes import GaussianNB
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.tree import DecisionTreeClassifier

from src.data_loader import load_dataset


PROJECT_ROOT = Path(__file__).resolve().parents[1]
RESULTS_DIR = PROJECT_ROOT / "results"
GRAPHS_DIR = RESULTS_DIR / "graphs"
MODELS_DIR = RESULTS_DIR / "models"
REPORTS_DIR = RESULTS_DIR / "reports"

RANDOM_STATE = 42
TEST_SIZE = 0.20


def ensure_dirs() -> None:
    for directory in (GRAPHS_DIR, MODELS_DIR, REPORTS_DIR):
        directory.mkdir(parents=True, exist_ok=True)


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


def build_feature_frame(urls: pd.Series) -> pd.DataFrame:
    return urls.fillna("").astype(str).map(extract_url_features).apply(pd.Series)


def save_confusion_matrix_image(matrix: np.ndarray, model_name: str, output_path: Path) -> None:
    plt.figure(figsize=(5, 4))
    plt.imshow(matrix, cmap="Blues")
    plt.title(f"Confusion Matrix - {model_name}")
    plt.xlabel("Predicted")
    plt.ylabel("Actual")
    plt.xticks([0, 1], ["Legit", "Phishing"])
    plt.yticks([0, 1], ["Legit", "Phishing"])

    for row in range(matrix.shape[0]):
        for column in range(matrix.shape[1]):
            plt.text(column, row, str(int(matrix[row, column])), ha="center", va="center", color="black")

    plt.tight_layout()
    plt.savefig(output_path, dpi=240)
    plt.close()


def save_fig2_feature_importance(tree_model: DecisionTreeClassifier, feature_names: list[str]) -> None:
    importances = pd.Series(tree_model.feature_importances_, index=feature_names).sort_values(ascending=True)

    plt.figure(figsize=(10, 7))
    bars = plt.barh(importances.index, importances.to_numpy(dtype=float), color="#2E86C1")
    plt.axvline(0.10, linestyle="--", color="#D35400", linewidth=1.2, label="0.10 threshold")
    plt.title("Fig. 2.  Decision Tree Feature Importance", fontsize=14, fontweight="bold", color="#1F4F88")
    plt.xlabel("Relative Importance Score")
    plt.legend(loc="lower right")

    for bar in bars:
        width = bar.get_width()
        x_position = width - 0.002 if width > 0.03 else width + 0.002
        horizontal_align = "right" if width > 0.03 else "left"
        label_color = "white" if width > 0.08 else "black"
        plt.text(
            x_position,
            bar.get_y() + (bar.get_height() / 2),
            f"{width:.3f}",
            va="center",
            ha=horizontal_align,
            fontweight="bold",
            color=label_color,
        )

    plt.tight_layout()
    plt.savefig(GRAPHS_DIR / "fig2_decision_tree_feature_importance.png", dpi=240)
    plt.close()


def save_fig3_distributions(df: pd.DataFrame) -> None:
    phishing_df = df[df["label"] == 1]
    legit_df = df[df["label"] == 0]

    fig, axes = plt.subplots(1, 2, figsize=(12, 5))

    axes[0].hist(phishing_df["url_length"], bins=36, alpha=0.7, density=True, label="Phishing URLs", color="#E76F51")
    axes[0].hist(legit_df["url_length"], bins=36, alpha=0.7, density=True, label="Legitimate URLs", color="#4EA8DE")
    axes[0].set_title("(a) URL Length Distribution", fontsize=10, fontweight="bold")
    axes[0].set_xlabel("URL Length (characters)")
    axes[0].set_ylabel("Density")
    axes[0].legend()

    axes[1].hist(phishing_df["digit_count"], bins=22, alpha=0.7, density=True, label="Phishing URLs", color="#E76F51")
    axes[1].hist(legit_df["digit_count"], bins=22, alpha=0.7, density=True, label="Legitimate URLs", color="#4EA8DE")
    axes[1].set_title("(b) Digit Count Distribution", fontsize=10, fontweight="bold")
    axes[1].set_xlabel("Digit Count")
    axes[1].set_ylabel("Density")
    axes[1].legend()

    fig.suptitle("Fig. 3.  Feature distributions: Phishing vs. Legitimate URLs", fontsize=13, fontweight="bold", color="#1F4F88")
    plt.tight_layout()
    plt.savefig(GRAPHS_DIR / "fig3_feature_distributions.png", dpi=240)
    plt.close()


def save_fig4_correlation_heatmap(df: pd.DataFrame, feature_cols: list[str]) -> None:
    correlation = df[feature_cols].corr().fillna(0.0)

    plt.figure(figsize=(12, 8))
    heatmap = plt.imshow(correlation, cmap="Blues", vmin=0.0, vmax=1.0)
    plt.title("Fig. 4.  Correlation Heatmap of URL-Based Features", fontsize=13, fontweight="bold", color="#1F4F88")
    plt.xticks(range(len(feature_cols)), feature_cols, rotation=90)
    plt.yticks(range(len(feature_cols)), feature_cols)

    for row in range(len(feature_cols)):
        for column in range(len(feature_cols)):
            plt.text(column, row, f"{correlation.iat[row, column]:.2f}", ha="center", va="center", fontsize=8)

    colorbar = plt.colorbar(heatmap)
    colorbar.set_label("Pearson r")
    plt.tight_layout()
    plt.savefig(GRAPHS_DIR / "fig4_correlation_heatmap.png", dpi=240)
    plt.close()


def save_fig5_radar(metrics_df: pd.DataFrame) -> None:
    metric_labels = ["Accuracy", "Precision", "Recall"]
    angles = np.linspace(0, 2 * np.pi, len(metric_labels), endpoint=False).tolist()
    angles += angles[:1]

    plt.figure(figsize=(8, 7))
    polar_axis = plt.subplot(111, polar=True)

    colors = {
        "Logistic Regression": "#3498DB",
        "Decision Tree": "#239B56",
        "Naive Bayes": "#E74C3C",
    }

    for _, row in metrics_df.iterrows():
        values = [row["Accuracy"], row["Precision"], row["Recall"]]
        values += values[:1]
        color = colors.get(row["Model"], "#555555")
        polar_axis.plot(angles, values, linewidth=2.2, label=row["Model"], color=color)
        polar_axis.fill(angles, values, alpha=0.10, color=color)

    polar_axis.set_xticks(angles[:-1])
    polar_axis.set_xticklabels(metric_labels)
    polar_axis.set_ylim(0.97, 1.0)
    polar_axis.set_title(
        "Fig. 5.  Model Comparison Using Accuracy, Precision, and Recall",
        fontsize=13,
        fontweight="bold",
        color="#1F4F88",
        pad=18,
    )
    polar_axis.legend(loc="upper right", bbox_to_anchor=(1.35, 1.12))
    plt.tight_layout()
    plt.savefig(GRAPHS_DIR / "fig5_model_comparison_radar.png", dpi=240)
    plt.close()


def save_fig6_error_analysis(y_true: pd.Series, predictions: dict[str, np.ndarray]) -> None:
    names: list[str] = []
    false_positives: list[int] = []
    false_negatives: list[int] = []

    for model_name, y_pred in predictions.items():
        matrix = confusion_matrix(y_true, y_pred)
        tn, fp, fn, tp = matrix.ravel()
        names.append(model_name.replace(" ", "\n"))
        false_positives.append(int(fp))
        false_negatives.append(int(fn))

    x_positions = np.arange(len(names))
    plt.figure(figsize=(10, 6))
    plt.bar(x_positions, false_positives, width=0.55, color="#E74C3C", label="False Positives")
    plt.bar(x_positions, false_negatives, width=0.55, bottom=false_positives, color="#D4AC0D", label="False Negatives")

    for index, value in enumerate(false_positives):
        plt.text(index, value / 2, str(value), ha="center", va="center", color="white", fontweight="bold")

    for index, value in enumerate(false_negatives):
        plt.text(index, false_positives[index] + value / 2, str(value), ha="center", va="center", color="black", fontweight="bold")

    plt.xticks(x_positions, names)
    plt.ylabel("Count")
    plt.title(
        "Fig. 6.  Error Analysis Using False Positives and False Negatives",
        fontsize=13,
        fontweight="bold",
        color="#1F4F88",
    )
    plt.legend()
    plt.tight_layout()
    plt.savefig(GRAPHS_DIR / "fig6_error_analysis_fp_fn.png", dpi=240)
    plt.close()


def save_fig7_roc(y_true: pd.Series, probabilities: dict[str, np.ndarray]) -> None:
    plt.figure(figsize=(8, 6))
    for model_name, y_proba in probabilities.items():
        fpr, tpr, _ = roc_curve(y_true, y_proba)
        roc_auc = roc_auc_score(y_true, y_proba)
        plt.plot(fpr, tpr, linewidth=2, label=f"{model_name} (AUC={roc_auc:.4f})")

    plt.plot([0, 1], [0, 1], linestyle="--", color="gray")
    plt.xlabel("False Positive Rate")
    plt.ylabel("True Positive Rate")
    plt.title("Fig. 7.  ROC Curve Comparison", fontsize=13, fontweight="bold", color="#1F4F88")
    plt.legend()
    plt.tight_layout()
    plt.savefig(GRAPHS_DIR / "fig7_roc_comparison.png", dpi=240)
    plt.close()


def save_fig8_precision_recall(y_true: pd.Series, probabilities: dict[str, np.ndarray]) -> None:
    plt.figure(figsize=(8, 6))
    for model_name, y_proba in probabilities.items():
        precision, recall, _ = precision_recall_curve(y_true, y_proba)
        plt.plot(recall, precision, linewidth=2, label=model_name)

    plt.xlabel("Recall")
    plt.ylabel("Precision")
    plt.title("Fig. 8.  Precision-Recall Curve Comparison", fontsize=13, fontweight="bold", color="#1F4F88")
    plt.legend()
    plt.tight_layout()
    plt.savefig(GRAPHS_DIR / "fig8_pr_curve_comparison.png", dpi=240)
    plt.close()


def save_fig9_metrics_heatmap(metrics_df: pd.DataFrame) -> None:
    metric_names = ["Accuracy", "Precision", "Recall", "F1"]
    matrix = metrics_df[metric_names].to_numpy(dtype=float)

    plt.figure(figsize=(8, 4))
    heatmap = plt.imshow(matrix, cmap="YlGnBu", vmin=0.95, vmax=1.00)
    plt.yticks(range(len(metrics_df)), metrics_df["Model"].astype(str).tolist())
    plt.xticks(range(len(metric_names)), metric_names)

    for row in range(matrix.shape[0]):
        for column in range(matrix.shape[1]):
            plt.text(column, row, f"{matrix[row, column]:.4f}", ha="center", va="center")

    plt.title("Fig. 9.  Metrics Heatmap", fontsize=13, fontweight="bold", color="#1F4F88")
    colorbar = plt.colorbar(heatmap)
    colorbar.set_label("Score")
    plt.tight_layout()
    plt.savefig(GRAPHS_DIR / "fig9_metrics_heatmap.png", dpi=240)
    plt.close()


def save_fig10_feature_spread(X_test: pd.DataFrame) -> None:
    plt.figure(figsize=(12, 6))
    X_test.boxplot(rot=45)
    plt.title("Fig. 10.  Test Feature Spread (Boxplot)", fontsize=13, fontweight="bold", color="#1F4F88")
    plt.tight_layout()
    plt.savefig(GRAPHS_DIR / "fig10_test_feature_spread.png", dpi=240)
    plt.close()


def train_and_generate() -> None:
    ensure_dirs()

    data, url_column, label_column, csv_path = load_dataset(PROJECT_ROOT / "data")
    features = build_feature_frame(data[url_column])
    labels = data[label_column].astype(int)

    feature_columns = features.columns.tolist()

    X_train, X_test, y_train, y_test = train_test_split(
        features,
        labels,
        test_size=TEST_SIZE,
        random_state=RANDOM_STATE,
        stratify=labels,
    )

    models: dict[str, Any] = {
        "Logistic Regression": Pipeline(
            [
                ("scaler", StandardScaler()),
                ("classifier", LogisticRegression(max_iter=1200, random_state=RANDOM_STATE)),
            ]
        ),
        "Decision Tree": DecisionTreeClassifier(random_state=RANDOM_STATE),
        "Naive Bayes": GaussianNB(),
    }

    predictions: dict[str, np.ndarray] = {}
    probabilities: dict[str, np.ndarray] = {}
    result_rows: list[dict[str, object]] = []

    for model_name, model in models.items():
        model.fit(X_train, y_train)
        y_pred = model.predict(X_test)

        if hasattr(model, "predict_proba"):
            y_proba = model.predict_proba(X_test)[:, 1]
        else:
            y_proba = y_pred.astype(float)

        predictions[model_name] = y_pred
        probabilities[model_name] = y_proba

        matrix = confusion_matrix(y_test, y_pred)

        slug = model_name.lower().replace(" ", "_")
        save_confusion_matrix_image(matrix, model_name, GRAPHS_DIR / f"confusion_matrix_{slug}.png")
        save_confusion_matrix_image(matrix, model_name, GRAPHS_DIR / f"{slug}_confusion_matrix.png")

        result_rows.append(
            {
                "Model": model_name,
                "Accuracy": accuracy_score(y_test, y_pred),
                "Precision": precision_score(y_test, y_pred, zero_division=0),
                "Recall": recall_score(y_test, y_pred, zero_division=0),
                "F1": f1_score(y_test, y_pred, zero_division=0),
                "False Positives": int(matrix[0, 1]),
                "False Negatives": int(matrix[1, 0]),
            }
        )

    metrics_df = pd.DataFrame(result_rows).sort_values("Accuracy", ascending=False).reset_index(drop=True)

    best_model_name = metrics_df.iloc[0]["Model"]
    best_model = models[best_model_name]
    joblib.dump(
        {
            "model_name": best_model_name,
            "model": best_model,
            "feature_names": feature_columns,
        },
        MODELS_DIR / "best_model.joblib",
    )

    metrics_df.to_csv(REPORTS_DIR / "model_metrics.csv", index=False)

    save_fig2_feature_importance(cast(DecisionTreeClassifier, models["Decision Tree"]), feature_columns)
    full_feature_df = features.copy()
    full_feature_df["label"] = labels
    save_fig3_distributions(full_feature_df)
    save_fig4_correlation_heatmap(features, feature_columns)
    save_fig5_radar(metrics_df)
    save_fig6_error_analysis(y_test, predictions)
    save_fig7_roc(y_test, probabilities)
    save_fig8_precision_recall(y_test, probabilities)
    save_fig9_metrics_heatmap(metrics_df)
    save_fig10_feature_spread(X_test)

    print(f"Dataset: {csv_path}")
    print(f"Graphs saved to: {GRAPHS_DIR}")
    print(f"Best model saved to: {MODELS_DIR / 'best_model.joblib'}")
    print("\nModel metrics:")
    print(metrics_df.to_string(index=False))


if __name__ == "__main__":
    train_and_generate()
