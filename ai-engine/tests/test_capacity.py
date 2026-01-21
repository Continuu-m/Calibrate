from src.services.capacity_checker import CapacityChecker


def test_capacity_ok(mock_model_task, prompts_dir):
    checker = CapacityChecker(prompts_dir)
    checker.model_task = mock_model_task
    
    result = checker.check("Simple task", 1000)
    
    assert result["can_handle"] is True

def test_capacity_over(mock_model_task, prompts_dir):
    checker = CapacityChecker(prompts_dir)
    checker.model_task = mock_model_task
    
    result = checker.check("Heavy task", 9000, max_tokens=8000)
    
    assert result["can_handle"] is False
