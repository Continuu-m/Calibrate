import { serve } from "bun";
import index from "./index.html";
import { supabase, db } from "./supabase";
import { requireUser } from "./auth";
import { UserService } from "./services/user.service";
import { TaskService } from "./services/task.service";
import { CapacityService } from "./services/capacity.service";

const server = serve({
  routes: {
    // Serve index.html for all unmatched routes.
    "/*": index,

    // Health
    "/api/health": async () => {
      return Response.json({ ok: true });
    },

    // REGISTER
    "/api/auth/register": async req => {
      if (req.method !== "POST") {
        return new Response("Method not allowed", { status: 405 });
      }

      const body = await req.json();
      const { email, password } = body;

      if (!email || !password) {
        return Response.json({ error: "email and password required" }, { status: 400 });
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        return Response.json({ error: error.message }, { status: 400 });
      }

      // Sync user to DB
      await UserService.syncUser(data.user!);

      return Response.json({
        user: data.user,
        session: data.session,
      });
    },

    // LOGIN
    "/api/auth/login": async req => {
      if (req.method !== "POST") {
        return new Response("Method not allowed", { status: 405 });
      }

      const body = await req.json();
      const { email, password } = body;

      if (!email || !password) {
        return Response.json({ error: "email and password required" }, { status: 400 });
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return Response.json({ error: error.message }, { status: 401 });
      }

      // Sync user to DB
      await UserService.syncUser(data.user!);

      return Response.json({
        user: data.user,
        session: data.session, // access + refresh token
      });
    },

    // PROTECTED ROUTE
    "/api/me": async req => {
      const user = await requireUser(req);

      if (!user) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
      }

      // Ensure user is synced
      const dbUser = (await UserService.syncUser(user))!;

      return Response.json({
        id: dbUser.id,
        supabaseId: dbUser.supabaseId,
        email: dbUser.email,
        preferences: dbUser.preferences,
      });
    },

    "/api/profile/export": async req => {
      const user = await requireUser(req);
      if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

      const data = await UserService.exportData(user.id!);
      return Response.json(data);
    },

    "/api/profile": async req => {
      const user = await requireUser(req);
      if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

      if (req.method === "GET") {
        const profile = await UserService.getProfile(user.id!);
        if (!profile) return Response.json({ error: "Profile not found" }, { status: 404 });
        return Response.json(profile);
      }

      if (req.method === "PATCH") {
        const body = await req.json();
        const updated = await UserService.updateProfile(user.id!, {
          preferences: JSON.stringify(body.preferences)
        });
        return Response.json(updated);
      }

      if (req.method === "DELETE") {
        await UserService.deleteAccount(user.id!);
        return Response.json({ success: true });
      }

      return new Response("Method not allowed", { status: 405 });
    },

    // TASKS API
    "/api/tasks": async req => {
      const user = await requireUser(req);
      if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
      const dbUser = (await UserService.syncUser(user))!;

      if (req.method === "GET") {
        const tasks = await TaskService.listTasks(dbUser.id);
        return Response.json(tasks);
      }

      if (req.method === "POST") {
        const body = await req.json();
        const task = await TaskService.createTask(dbUser.id, body);
        return Response.json(task);
      }

      return new Response("Method not allowed", { status: 405 });
    },

    "/api/tasks/*": async req => {
      const user = await requireUser(req);
      if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
      const dbUser = (await UserService.syncUser(user))!;

      const url = new URL(req.url);
      const parts = url.pathname.split("/");
      const taskId = parseInt(parts[3] ?? "");

      if (isNaN(taskId)) return Response.json({ error: "Invalid task ID" }, { status: 400 });

      if (req.method === "PATCH") {
        const body = await req.json();
        const updated = await TaskService.updateTask(dbUser.id, taskId, body);
        return Response.json(updated);
      }

      if (req.method === "DELETE") {
        await TaskService.deleteTask(dbUser.id, taskId);
        return Response.json({ success: true });
      }

      return new Response("Method not allowed", { status: 405 });
    },

    // CAPACITY API
    "/api/capacity/status": async req => {
      const user = await requireUser(req);
      if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
      const dbUser = (await UserService.syncUser(user))!;

      const status = await CapacityService.getStatus(dbUser.id);
      return Response.json(status);
    },
  },


  development: process.env.NODE_ENV !== "production" && {
    // Enable browser hot reloading in development
    hmr: true,

    // Echo console logs from the browser to the server
    console: true,
  },
});

console.log(`🚀 Server running at ${server.url}`);
