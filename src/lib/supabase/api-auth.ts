import { createClient } from "./server";

export async function getAuthenticatedUser(req?: Request) {
  if (req) {
    const authHeader = req.headers.get("Authorization");
    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.slice(7);
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser(token);
      if (user) return { user, supabase, accessToken: token };
    }
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return { user, supabase, accessToken: null };
}
