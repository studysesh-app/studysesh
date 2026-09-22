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

    // Look for an existing 1:1 conversation shared by both participants.
    const { data: myConvs, error: myConvsError } = await admin
      .from("conversation_participants")
      .select("conversation_id")
      .eq("user_id", user.id);
    if (myConvsError) throw myConvsError;

    const myConvIds = (myConvs ?? []).map((c) => c.conversation_id);
    if (myConvIds.length > 0) {
      const { data: sharedConv, error: sharedError } = await admin
        .from("conversation_participants")
        .select("conversation_id")
        .eq("user_id", otherUserId)
        .in("conversation_id", myConvIds)
        .limit(1)
        .maybeSingle();
      if (sharedError) throw sharedError;
      if (sharedConv) {
        return new Response(JSON.stringify({ conversationId: sharedConv.conversation_id, created: false }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
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
