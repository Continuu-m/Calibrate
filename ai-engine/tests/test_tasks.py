from src.api import add_task, view_tasks, mark_complete
import io
import sys


def test_add_task(sample_tasks):
    tasks = sample_tasks.copy()
    add_task(tasks, "New task")
    assert len(tasks) == 2
    assert tasks[-1]["description"] == "New task"

def test_mark_complete(sample_tasks, capsys):
    tasks = sample_tasks.copy()
    mark_complete(tasks, 0)
    captured = capsys.readouterr()
    assert tasks[0]["complete"] is True
