from pathlib import Path

import pandas as pd

from src.data_loader import load_dataset
from src.evaluation import evaluate_model, save_accuracy_comparison
from src.model_training import prepare_data, train_models


def main():
    project_root = Path(__file__).resolve().parent
    data_dir = project_root / "data"
    graph_dir = project_root / "results" / "graphs"

    data, url_column, label_column, csv_path = load_dataset(data_dir)
    print(f"\nLoaded dataset from: {csv_path}")

    train_features, test_features, train_labels, test_labels, _ = prepare_data(data, url_column, label_column)
    models = train_models(train_features, train_labels)

    results = []
    for model_name, model in models.items():
        result = evaluate_model(model_name, model, test_features, test_labels, graph_dir)
        results.append(result)
        print(f"\n{model_name}")
        print(f"Accuracy: {result['Accuracy']:.4f}")
        print(f"Precision: {result['Precision']:.4f}")
        print(f"Recall: {result['Recall']:.4f}")
        print("Confusion Matrix:")
        print(result["Confusion Matrix"])

    summary = pd.DataFrame(results)[["Model", "Accuracy", "Precision", "Recall"]]
    print("\nModel Summary:")
    print(summary.to_string(index=False))

    comparison_path = save_accuracy_comparison(results, graph_dir / "model_comparison.png")
    print(f"\nSaved comparison chart to: {comparison_path}")
    print(f"Saved confusion matrices to: {graph_dir}")


if __name__ == "__main__":
    main()
