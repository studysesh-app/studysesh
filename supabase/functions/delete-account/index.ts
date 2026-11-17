// Permanently deletes the caller's auth user (cascades to public.users and every
// related row via ON DELETE CASCADE foreign keys). Requires the service role, which
// regular clients never have, so this must run as an Edge Function.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";
import { removeUserStorage } from "../_shared/storage_cleanup.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const callerClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: userError } = await callerClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Not authenticated" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(supabaseUrl, serviceRoleKey);
    const { data: attempt, error: leaseError } = await admin.rpc("begin_account_deletion", { p_user_id: user.id });
    if (leaseError) throw new Error(leaseError.message);
    if (typeof attempt !== "string") {
      return new Response(JSON.stringify({ error: "Account deletion is already in progress. Please retry later." }), {
        status: 409,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    try {
      for (const name of ["avatars", "proofs"]) {
        const bucket = admin.storage.from(name);
        await removeUserStorage({
          list: async (prefix, offset, limit) => {
            const { data, error } = await bucket.list(prefix, { offset, limit, sortBy: { column: "name", order: "asc" } });
            return { data: data?.map((entry) => ({ name: entry.name, id: entry.id ?? null })) ?? null, error };
          },
          remove: async (paths) => {
            const { error } = await bucket.remove(paths);
            return { error };
          },
        }, user.id);
      }
      const { error: deleteError } = await admin.auth.admin.deleteUser(user.id);
      if (deleteError) throw new Error(deleteError.message);
    } catch (failure) {
      const { error: releaseError } = await admin.from("account_deletions").delete()
        .eq("user_id", user.id).eq("attempt_id", attempt);
      if (releaseError) {
        console.error("Could not release deletion lease:", releaseError);
        throw new Error("Account deletion failed and cleanup could not be unlocked. Please retry later or contact support.");
      }
      console.error("Account deletion failed:", failure);
      throw new Error("Account deletion failed. Some files may already have been removed; please retry or contact support.");
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Delete account error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
