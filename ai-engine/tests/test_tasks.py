import unittest
import os
import sys
# Pylance fix via .vscode/settings.json - no sys.path needed

from tasks import add_task, view_tasks, remove_task, save_tasks, load_tasks

TASKS_FILE = "../data/test_tasks.json"

class TestTaskAnalyzer(unittest.TestCase):
    def setUp(self):
        """Setup before each test."""
        self.tasks = []
        os.makedirs(os.path.dirname(TASKS_FILE), exist_ok=True)

    def test_add_task(self):
        """Test adding task."""
        add_task(self.tasks, "Test task 1")
        self.assertEqual(len(self.tasks), 1)
        self.assertEqual(self.tasks[0]["description"], "Test task 1")
        self.assertFalse(self.tasks[0]["completed"])

    def test_view_tasks(self):
        """Test view output (capture print)."""
        self.tasks = [{"description": "View test", "completed": True}]
        # Test logic, not print (use unittest.mock for full)
        self.assertIsNone(view_tasks(self.tasks))  # No return expected

    def test_remove_task(self):
        """Test remove."""
        self.tasks = [{"description": "Remove me"}]
        removed = remove_task(self.tasks, 0)
        self.assertEqual(len(self.tasks), 0)
        self.assertEqual(removed["description"], "Remove me")

    def test_save_load(self):
        """Test persistence."""
        test_tasks = [{"description": "Persist test"}]
        save_tasks(TASKS_FILE, test_tasks)
        loaded = load_tasks(TASKS_FILE)
        self.assertEqual(loaded, test_tasks)
        os.remove(TASKS_FILE)  # Cleanup

    def test_mark_complete(self):
        """Test completion."""
        self.tasks = [{"description": "Complete me"}]
        from tasks import mark_complete
        success = mark_complete(self.tasks, 0)
        self.assertTrue(success)
        self.assertTrue(self.tasks[0]["completed"])

if __name__ == "__main__":
    unittest.main()
