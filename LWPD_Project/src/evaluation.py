from pathlib import Path

import matplotlib.pyplot as plt
import pandas as pd
from sklearn.metrics import accuracy_score, confusion_matrix, precision_score, recall_score


def _ensure_graph_dir(output_dir: Path) -> Path:
    output_dir.mkdir(parents=True, exist_ok=True)
    return output_dir


def save_confusion_matrix(y_true, y_pred, model_name, output_path):
    matrix = confusion_matrix(y_true, y_pred)
    plt.figure(figsize=(5, 4))
    plt.imshow(matrix, cmap="Blues")
    plt.title(f"Confusion Matrix - {model_name}")
    plt.xlabel("Predicted")
    plt.ylabel("Actual")
    plt.xticks([0, 1], ["Legit", "Phishing"])
    plt.yticks([0, 1], ["Legit", "Phishing"])

    for row_index in range(matrix.shape[0]):
        for column_index in range(matrix.shape[1]):
            plt.text(column_index, row_index, str(int(matrix[row_index, column_index])), ha="center", va="center")

    plt.tight_layout()
    plt.savefig(output_path, dpi=300, bbox_inches="tight")
    plt.close()
    return matrix


def evaluate_model(model_name, model, test_features, test_labels, graph_dir):
    graph_dir = _ensure_graph_dir(Path(graph_dir))
    predictions = model.predict(test_features)

    accuracy = accuracy_score(test_labels, predictions)
    precision = precision_score(test_labels, predictions, zero_division=0)
    recall = recall_score(test_labels, predictions, zero_division=0)

    matrix_path = graph_dir / f"{model_name.lower().replace(' ', '_')}_confusion_matrix.png"
    matrix = save_confusion_matrix(test_labels, predictions, model_name, matrix_path)

    return {
        "Model": model_name,
        "Accuracy": accuracy,
        "Precision": precision,
        "Recall": recall,
        "Confusion Matrix": matrix,
        "Confusion Matrix Path": str(matrix_path),
    }


def save_accuracy_comparison(results, output_path):
    output_path = Path(output_path)
    output_path.parent.mkdir(parents=True, exist_ok=True)

    comparison = pd.DataFrame(results)
    plt.figure(figsize=(8, 5))
    plt.bar(comparison["Model"], comparison["Accuracy"], color=["#1f77b4", "#ff7f0e", "#2ca02c"])
    plt.ylim(0, 1)
    plt.ylabel("Accuracy")
    plt.title("Model Accuracy Comparison")
    plt.xticks(rotation=15)
    plt.tight_layout()
    plt.savefig(output_path, dpi=300, bbox_inches="tight")
    plt.close()
    return output_path
