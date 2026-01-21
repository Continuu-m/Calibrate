import pytest
import json
from unittest.mock import Mock, patch
from pathlib import Path

@pytest.fixture(scope="session")
def mock_model_task():
    """Mock ModelTask for deterministic tests."""
    mock_task = Mock()
    mock_task.run.return_value = [{"prediction": '{"subtasks": [{"id":1,"desc":"test"}]}'}]
    return mock_task

@pytest.fixture(scope="module")
def prompts_dir(tmp_path_factory):
    """Temp prompts dir with sample templates."""
    temp_dir = tmp_path_factory.mktemp("prompts")
    Path(temp_dir / "task_breakdown.jinja").write_text("Mock template")
    return str(temp_dir)

@pytest.fixture
def sample_tasks():
    """Sample tasks data for CRUD tests."""
    return [
        {"id": 1, "description": "Test task", "complete": False, "est_hours": 2}
    ]

@pytest.fixture(autouse=True)
def mock_open():
    """Auto-mock JSON file ops for isolation."""
    with patch("builtins.open", new_callable=Mock):
        yield
