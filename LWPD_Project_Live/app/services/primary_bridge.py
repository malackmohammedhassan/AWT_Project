from __future__ import annotations

import importlib.util
from dataclasses import dataclass
from pathlib import Path
from types import ModuleType
from typing import Callable

import pandas as pd


@dataclass
class _ModuleCacheEntry:
    mtime: float
    module: ModuleType


class PrimaryBridge:
    def __init__(self, primary_root: Path):
        self.primary_root = Path(primary_root)
        self.src_dir = self.primary_root / "src"
        self._cache: dict[str, _ModuleCacheEntry] = {}

    def _load_module(self, key: str, file_path: Path) -> ModuleType:
        if not file_path.exists():
            raise FileNotFoundError(f"Missing primary module: {file_path}")

        current_mtime = file_path.stat().st_mtime
        cached = self._cache.get(key)
        if cached and cached.mtime == current_mtime:
            return cached.module

        spec = importlib.util.spec_from_file_location(f"primary_{key}", file_path)
        if spec is None or spec.loader is None:
            raise ImportError(f"Unable to load module spec for {file_path}")

        module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)
        self._cache[key] = _ModuleCacheEntry(mtime=current_mtime, module=module)
        return module

    def data_loader(self) -> ModuleType:
        return self._load_module("data_loader", self.src_dir / "data_loader.py")

    def model_training(self) -> ModuleType:
        return self._load_module("model_training", self.src_dir / "model_training.py")

    def evaluation(self) -> ModuleType:
        return self._load_module("evaluation", self.src_dir / "evaluation.py")

    def load_primary_dataset(self) -> pd.DataFrame:
        data_loader = self.data_loader()
        data, _, _, _ = data_loader.load_dataset(self.primary_root / "data")
        return data

    def normalize_uploaded_dataset(self, dataframe: pd.DataFrame) -> pd.DataFrame:
        data_loader = self.data_loader()

        url_column = data_loader._detect_column(dataframe.columns, data_loader.URL_COLUMNS)
        label_column = data_loader._detect_column(dataframe.columns, data_loader.LABEL_COLUMNS)

        if url_column is None or label_column is None:
            if len(dataframe.columns) < 2:
                raise ValueError("Dataset must contain at least two columns: URL and label")
            url_column = dataframe.columns[0]
            label_column = dataframe.columns[1]

        data = dataframe[[url_column, label_column]].copy().dropna()
        data = data.rename(columns={url_column: "url", label_column: "label"})
        data["url"] = data["url"].astype(str).str.strip()
        data["label"] = data_loader._standardize_label_values(data["label"])
        return data

    def train_and_evaluate(
        self,
        dataframe: pd.DataFrame,
        graph_dir: Path,
        logger: Callable[[str], None],
    ):
        model_training = self.model_training()
        evaluation = self.evaluation()

        logger("Building train/test split and URL feature matrix")
        train_features, test_features, train_labels, test_labels, _ = model_training.prepare_data(
            dataframe,
            "url",
            "label",
        )

        logger("Training Logistic Regression, Decision Tree, and Naive Bayes")
        models = model_training.train_models(train_features, train_labels)

        results = []
        for model_name, model in models.items():
            logger(f"Evaluating {model_name}")
            result = evaluation.evaluate_model(model_name, model, test_features, test_labels, graph_dir)
            results.append(result)

        logger("Saving model accuracy comparison graph")
        evaluation.save_accuracy_comparison(results, graph_dir / "model_comparison.png")

        return models, results

    def build_prediction_features(self, url: str) -> pd.DataFrame:
        model_training = self.model_training()
        return model_training._build_url_features(pd.Series([url]))
