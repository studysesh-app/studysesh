// Classmates discovery: finds users who share a course with the caller, excluding
// blocked/connected users, and respecting each profile's gender-based visibility setting.
// Runs with the service role so it can join across tables regardless of per-row RLS,
// but the caller's identity is verified first via their access token.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

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
    const body = await req.json().catch(() => ({}));
    const limit: number = body.limit ?? 30;

    const { data: myCourses, error: coursesError } = await admin
      .from("user_courses")
      .select("course_id")
      .eq("user_id", user.id);
    if (coursesError) throw coursesError;

    const courseIds = (myCourses ?? []).map((c) => c.course_id);
    if (courseIds.length === 0) {
      return new Response(JSON.stringify({ classmates: [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const [{ data: me }, { data: blockedRows }, { data: connectionRows }, { data: sharedRows }, { data: courseRows }] =
      await Promise.all([
        admin.from("users").select("gender").eq("id", user.id).single(),
        admin.from("blocked_users").select("blocker_id, blocked_id").or(`blocker_id.eq.${user.id},blocked_id.eq.${user.id}`),
        admin.from("connections").select("requester_id, receiver_id").or(`requester_id.eq.${user.id},receiver_id.eq.${user.id}`),
        admin.from("user_courses").select("user_id, course_id").in("course_id", courseIds),
        admin.from("courses").select("id, code").in("id", courseIds),
      ]);

    const blockedIds = new Set(
      (blockedRows ?? []).map((b) => (b.blocker_id === user.id ? b.blocked_id : b.blocker_id)),
    );
    const connectedIds = new Set(
      (connectionRows ?? []).map((c) => (c.requester_id === user.id ? c.receiver_id : c.requester_id)),
    );
    const courseCodeById = new Map((courseRows ?? []).map((c) => [c.id, c.code]));

    const sharedByUser = new Map<string, string[]>();
    for (const row of sharedRows ?? []) {
      if (row.user_id === user.id) continue;
      if (blockedIds.has(row.user_id) || connectedIds.has(row.user_id)) continue;
      const code = courseCodeById.get(row.course_id);
      if (!code) continue;
      if (!sharedByUser.has(row.user_id)) sharedByUser.set(row.user_id, []);
      sharedByUser.get(row.user_id)!.push(code);
    }

    const candidateIds = [...sharedByUser.keys()];
    if (candidateIds.length === 0) {
      return new Response(JSON.stringify({ classmates: [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const [{ data: users, error: usersError }, { data: promptRows }] = await Promise.all([
      admin
        .from("users")
        .select("id, name, pronouns, gender, year, major, photo_url, bio, profile_visibility")
        .in("id", candidateIds),
      admin
        .from("user_prompts")
        .select("user_id, prompt, answer, sort_order")
        .in("user_id", candidateIds)
        .order("sort_order"),
    ]);
    if (usersError) throw usersError;

    const promptsByUser = new Map<string, Array<{ prompt: string; answer: string }>>();
    for (const row of promptRows ?? []) {
      if (!promptsByUser.has(row.user_id)) promptsByUser.set(row.user_id, []);
      promptsByUser.get(row.user_id)!.push({ prompt: row.prompt, answer: row.answer });
    }

    const myGender = me?.gender;
    const classmates = (users ?? [])
      .filter((u) => {
        if (u.profile_visibility !== "women-nb-only") return true;
        return myGender === "Woman" || myGender === "Non-Binary";
      })
      .slice(0, limit)
      .map((u) => ({
        id: u.id,
        name: u.name,
        pronouns: u.pronouns,
        gender: u.gender,
        year: u.year,
        major: u.major,
        photoUrl: u.photo_url,
        bio: u.bio,
        sharedCourses: sharedByUser.get(u.id) ?? [],
        prompts: promptsByUser.get(u.id) ?? [],
      }));

    return new Response(JSON.stringify({ classmates }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
