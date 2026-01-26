import { db } from "../supabase";
import { users, tasks, subtasks } from "../db/schema";
import { eq } from "drizzle-orm";
import type { User as SupabaseUser } from "@supabase/supabase-js";

export class UserService {
    static async syncUser(supabaseUser: SupabaseUser) {
        // Check if user exists
        const [existing] = await db
            .select()
            .from(users)
            .where(eq(users.supabaseId, supabaseUser.id))
            .limit(1);

        if (existing) {
            return existing;
        }

        // Create user if not exists
        const [newUser] = await db
            .insert(users)
            .values({
                supabaseId: supabaseUser.id,
                email: supabaseUser.email!,
                preferences: JSON.stringify({ theme: "dark", workHours: 8 }),
            })
            .returning();

        return newUser;
    }

    static async getProfile(supabaseId: string) {
        const [user] = await db
            .select()
            .from(users)
            .where(eq(users.supabaseId, supabaseId))
            .limit(1);

        return user;
    }

    static async updateProfile(supabaseId: string, data: Partial<{ preferences: string }>) {
        const [updated] = await db
            .update(users)
            .set(data)
            .where(eq(users.supabaseId, supabaseId))
            .returning();

        return updated;
    }

    static async exportData(supabaseId: string) {
        const profile = await this.getProfile(supabaseId);
        if (!profile) return null;

        // Fetch all related data
        const userTasks = await db
            .select()
            .from(tasks)
            .where(eq(tasks.userId, profile.id));

        return {
            profile,
            tasks: userTasks,
        };
    }

    static async deleteAccount(supabaseId: string) {
        // Cascade delete should handle related tables if foreign keys are set correctly
        // but we'll manually ensure user is gone from our DB. 
        // Note: Supabase Auth deletion is handled separately via Supabase API/Console.
        await db.delete(users).where(eq(users.supabaseId, supabaseId));
    }
}
