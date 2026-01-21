from src.services.ai_analyzer import AIAnalyzer
import pytest


def test_analyze_task(mock_model_task, prompts_dir):
    analyzer = AIAnalyzer(prompts_dir)
    analyzer.model_task = mock_model_task  # Inject mock
    
    subtasks = analyzer.analyze_task("Test input")
    
    assert len(subtasks) == 1
    assert subtasks[0]["id"] == 1
    mock_model_task.run.assert_called_once()
