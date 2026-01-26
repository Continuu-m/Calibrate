import { supabase } from "./supabase";

/**
 * Extract + verify user from Authorization header
 */
export async function requireUser(req: Request) {
  const header = req.headers.get("authorization");

  if (!header || !header.startsWith("Bearer ")) {
    return null;
  }

  const token = header.slice(7);

  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data.user) return null;

  return data.user;
}
