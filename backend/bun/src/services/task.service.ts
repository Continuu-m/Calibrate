import { db } from "../supabase";
import { tasks, subtasks } from "../db/schema";
import { eq, and } from "drizzle-orm";

export class TaskService {
    static async listTasks(userId: number) {
        return await db
            .select()
            .from(tasks)
            .where(eq(tasks.userId, userId));
    }

    static async createTask(userId: number, data: any) {
        const [task] = await db
            .insert(tasks)
            .values({
                userId,
                title: data.title,
                description: data.description,
                deadline: data.deadline ? new Date(data.deadline) : null,
                estimatedTime: data.estimatedTime?.toString(),
                taskType: data.taskType || "GENERAL",
                priority: data.priority || 0,
            })
            .returning();

        if (data.subtasks && Array.isArray(data.subtasks)) {
            await db.insert(subtasks).values(
                data.subtasks.map((s: any, index: number) => ({
                    taskId: (task as any).id,
                    description: s.description,
                    estimatedTime: s.estimatedTime?.toString(),
                    order: index,
                }))
            );
        }

        return task;
    }

    static async updateTask(userId: number, taskId: number, data: any) {
        const [updatedTask] = await db
            .update(tasks)
            .set({
                ...data,
                deadline: data.deadline ? new Date(data.deadline) : undefined,
                estimatedTime: data.estimatedTime?.toString(),
            })
            .where(and(eq(tasks.id, taskId), eq(tasks.userId, userId)))
            .returning();

        return updatedTask;
    }

    static async deleteTask(userId: number, taskId: number) {
        await db
            .delete(tasks)
            .where(and(eq(tasks.id, taskId), eq(tasks.userId, userId)));
    }

    static async getSubtasks(taskId: number) {
        return await db
            .select()
            .from(subtasks)
            .where(eq(subtasks.taskId, taskId));
    }

    static async updateSubtask(subtaskId: number, data: any) {
        return await db
            .update(subtasks)
            .set(data)
            .where(eq(subtasks.id, subtaskId))
            .returning();
    }
}
