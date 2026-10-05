// Finds an existing 1:1 conversation between the caller and another user, or creates one.
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

    const { otherUserId } = await req.json();
    if (!otherUserId || typeof otherUserId !== "string") {
      return new Response(JSON.stringify({ error: "otherUserId is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (otherUserId === user.id) {
      return new Response(JSON.stringify({ error: "Cannot start a conversation with yourself" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(supabaseUrl, serviceRoleKey);

    const { data: blockRows, error: blockError } = await admin
      .from("blocked_users")
      .select("blocker_id")
      .or(`and(blocker_id.eq.${user.id},blocked_id.eq.${otherUserId}),and(blocker_id.eq.${otherUserId},blocked_id.eq.${user.id})`)
      .limit(1);
    if (blockError) throw blockError;
    if (blockRows && blockRows.length > 0) {
      return new Response(JSON.stringify({ error: "You can't message this person" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Reuse a 1:1 even if one person previously left it, instead of opening a second thread.
    const { data: related, error: relatedError } = await admin
      .from("conversation_participants")
      .select("conversation_id")
      .in("user_id", [user.id, otherUserId]);
    if (relatedError) throw relatedError;

    const candidateIds = [...new Set((related ?? []).map((row) => row.conversation_id))];
    for (const convId of candidateIds) {
      const { data: parts, error: partsError } = await admin
        .from("conversation_participants")
        .select("user_id")
        .eq("conversation_id", convId);
      if (partsError) throw partsError;
      const ids = (parts ?? []).map((p) => p.user_id);
      if (ids.length === 0 || ids.some((id) => id !== user.id && id !== otherUserId)) continue;

      const otherIsHere = ids.includes(otherUserId);
      if (!otherIsHere) {
        const { data: fromOther, error: fromOtherError } = await admin
          .from("messages")
          .select("id")
          .eq("conversation_id", convId)
          .eq("sender_id", otherUserId)
          .limit(1);
        if (fromOtherError) throw fromOtherError;
        if (!fromOther || fromOther.length === 0) continue;
      }

      const missing = [user.id, otherUserId].filter((id) => !ids.includes(id));
      if (missing.length > 0) {
        const { error: rejoinError } = await admin
          .from("conversation_participants")
          .insert(missing.map((id) => ({ conversation_id: convId, user_id: id })));
        if (rejoinError) throw rejoinError;
      }
      return new Response(JSON.stringify({ conversationId: convId, created: false }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: newConv, error: createError } = await admin
      .from("conversations")
      .insert({})
      .select("id")
      .single();
    if (createError) throw createError;

    const { error: participantsError } = await admin
      .from("conversation_participants")
      .insert([
        { conversation_id: newConv.id, user_id: user.id },
        { conversation_id: newConv.id, user_id: otherUserId },
      ]);
    if (participantsError) throw participantsError;

    return new Response(JSON.stringify({ conversationId: newConv.id, created: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
