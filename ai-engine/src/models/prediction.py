#time estimates
# models/prediction.py

from typing import Any, Dict, List


class ModelPredictor:
    """
    Wraps the underlying model and exposes a simple predict() interface.
    """

    def __init__(self, model: Any) -> None:
        self.model = model

    def predict(self, inputs: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Run inference on a batch of inputs and return model outputs.
        """
        # TODO: adapt this to your actual model
        outputs = []
        for item in inputs:
            # Example: dummy echo prediction
            outputs.append(
                {
                    "input": item,
                    "prediction": self.model(item) if callable(self.model) else None,
                }
            )
        return outputs
