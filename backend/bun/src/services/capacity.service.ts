import { db } from "../supabase";
import { tasks, users } from "../db/schema";
import { eq, and, sql } from "drizzle-orm";

export class CapacityService {
    static async getStatus(userId: number) {
        // 1. Get user preferences
        const [user] = await db
            .select()
            .from(users)
            .where(eq(users.id, userId))
            .limit(1);

        if (!user) throw new Error("User not found");

        const preferences = JSON.parse(user.preferences || "{}");
        const workHoursPerDay = preferences.workHours || 8; // default 8 hours
        const availableMinutes = workHoursPerDay * 60;

        // 2. Get planned tasks for "today" (simple implementation: all uncompleted tasks with a deadline today or no deadline)
        // For MVP, we'll just sum all PLANNED/IN_PROGRESS tasks
        const plannedTasks = await db
            .select({
                estimatedTime: tasks.estimatedTime,
            })
            .from(tasks)
            .where(
                and(
                    eq(tasks.userId, userId),
                    sql`${tasks.status} IN ('PLANNED', 'IN_PROGRESS')`
                )
            );

        const plannedMinutes = plannedTasks.reduce((sum, task) => {
            return sum + (parseInt(task.estimatedTime || "0") || 0);
        }, 0);

        // 3. Determine status
        const percentage = (plannedMinutes / availableMinutes) * 100;
        let status: "GREEN" | "YELLOW" | "RED" = "GREEN";

        if (percentage > 100) {
            status = "RED";
        } else if (percentage > 80) {
            status = "YELLOW";
        }

        return {
            availableMinutes,
            plannedMinutes,
            percentage: Math.round(percentage),
            status,
            recommendation: status === "RED" ? "You are overcommitted. Consider deferring some tasks." :
                status === "YELLOW" ? "You are nearing capacity." : "Your schedule looks manageable.",
        };
    }
}
