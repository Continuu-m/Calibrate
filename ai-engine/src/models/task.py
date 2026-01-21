#Pydantic task/subtask

from dataclasses import dataclass,field
from typing import List,Dict,Any

from .prediction import ModelPredictor
@dataclass
class ModelTask:
    
    name: str
    predictor: ModelPredictor
    config: Dict[str, Any] = field(default_factory=dict)
    
    def run(self, raw_inputs: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Apply any task-specific preprocessing/postprocessing around prediction.
        """
        preprocessed = [self._preprocess(x) for x in raw_inputs]
        raw_outputs = self.predictor.predict(preprocessed)
        return [self._postprocess(o) for o in raw_outputs]

    def _preprocess(self, item: Dict[str, Any]) -> Dict[str, Any]:
        # TODO: implement task-specific preprocessing
        return item

    def _postprocess(self, output: Dict[str, Any]) -> Dict[str, Any]:
        # TODO: implement task-specific postprocessing
        return output