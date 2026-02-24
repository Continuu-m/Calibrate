const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

class TaskService {
    static async getTasks(token, status = null) {
        let url = `${API_URL}/tasks`;
        if (status) {
            url += `?status=${status}`;
        }

        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch tasks: ${response.statusText}`);
        }

        return await response.json();
    }

    static async createTask(token, taskData) {
        const response = await fetch(`${API_URL}/tasks`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(taskData)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || `Failed to create task: ${response.statusText}`);
        }

        return await response.json();
    }

    static async updateTask(token, taskId, updates) {
        const response = await fetch(`${API_URL}/tasks/${taskId}`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updates)
        });

        if (!response.ok) {
            throw new Error(`Failed to update task: ${response.statusText}`);
        }

        return await response.json();
    }
}

export default TaskService;
