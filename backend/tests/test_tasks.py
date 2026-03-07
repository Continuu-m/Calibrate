import pytest
from fastapi import status

def test_create_task(auth_client):
    response = auth_client.post(
        "/tasks/",
        json={
            "title": "Test Task",
            "description": "This is a test task",
            "priority": "medium",
            "estimated_time": 30
        }
    )
    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert data["title"] == "Test Task"
    assert "id" in data

def test_get_tasks(auth_client):
    # Create a task first
    auth_client.post(
        "/tasks/",
        json={"title": "List Task", "estimated_time": 30}
    )
    
    response = auth_client.get("/tasks/")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert "tasks" in data
    assert any(t["title"] == "List Task" for t in data["tasks"])

def test_update_task(auth_client):
    # Create
    create_res = auth_client.post(
        "/tasks/",
        json={"title": "Update Me", "estimated_time": 15}
    )
    task_id = create_res.json()["id"]
    
    # Update
    response = auth_client.put(
        f"/tasks/{task_id}",
        json={"title": "Updated Title", "status": "completed"}
    )
    assert response.status_code == status.HTTP_200_OK
    assert response.json()["title"] == "Updated Title"
    assert response.json()["status"] == "completed"

def test_delete_task(auth_client):
    # Create
    create_res = auth_client.post(
        "/tasks/",
        json={"title": "Delete Me", "estimated_time": 10}
    )
    task_id = create_res.json()["id"]
    
    # Delete
    response = auth_client.delete(f"/tasks/{task_id}")
    assert response.status_code == status.HTTP_200_OK
    
    # Verify deleted
    get_res = auth_client.get("/tasks/")
    assert not any(t["id"] == task_id for t in get_res.json()["tasks"])
