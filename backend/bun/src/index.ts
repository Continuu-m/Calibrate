import { serve } from "bun";
import index from "./index.html";
import { supabase } from "./supabase";
import { requireUser } from "./auth";
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

      return Response.json({
        id: user.id,
        email: user.email,
      });
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
