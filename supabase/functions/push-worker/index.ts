import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { authorizePushWorker, deliverPushJob, type PushJob } from "../_shared/push_delivery.ts";

function isPushJob(value: unknown): value is PushJob {
  if (typeof value !== "object" || value === null) return false;
  const row: Record<string, unknown> = { ...value };
  return typeof row.id === "string" && typeof row.lease_id === "string"
    && typeof row.token === "string" && typeof row.activity_id === "string"
    && typeof row.activity_type === "string"
    && ["message", "connection_request", "connection_accepted", "board_like", "board_reply"].includes(row.activity_type)
    && (row.ticket_id === null || typeof row.ticket_id === "string");
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });
  const secret = Deno.env.get("PUSH_WORKER_SECRET");
  const authorization = await authorizePushWorker(req.headers.get("x-push-worker-secret") ?? "", secret);
  if (authorization === "unconfigured") return new Response("Push worker is not configured", { status: 503 });
  if (authorization !== "ok") {
    return new Response("Unauthorized", { status: 401 });
  }
  const url = Deno.env.get("SUPABASE_URL");
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !key) return new Response("Push worker is not configured", { status: 503 });

  try {
    const admin = createClient(url, key);
    const { data, error } = await admin.rpc("claim_push_deliveries", { p_limit: 50 });
    if (error || !Array.isArray(data) || !data.every(isPushJob)) {
      console.error("Could not claim push deliveries:", error?.message ?? "Invalid response");
      return new Response("Could not claim deliveries", { status: 500 });
    }

    let completed = 0;
    let failed = 0;
    for (let offset = 0; offset < data.length; offset += 8) {
      await Promise.all(data.slice(offset, offset + 8).map(async (job) => {
        try {
          const { data: valid, error: validationError } = await admin.rpc("validate_push_delivery", {
            p_id: job.id, p_lease: job.lease_id,
          });
          if (validationError || typeof valid !== "boolean") {
            console.error("Could not validate a push delivery:", validationError?.message ?? "Invalid response");
            failed++;
            return;
          }
          if (!valid) { completed++; return; }
          const result = await deliverPushJob(job, fetch, Deno.env.get("EXPO_ACCESS_TOKEN"));
          const { error: completionError } = await admin.rpc("complete_push_delivery", {
            p_id: job.id, p_lease: job.lease_id, p_action: result.action,
            p_ticket: result.ticket ?? null, p_error: result.error ?? null,
          });
          if (completionError) {
            console.error("Could not record a push delivery:", completionError.message);
            failed++;
          } else {
            completed++;
          }
        } catch (failure) {
          console.error("Push delivery processing failed:", failure instanceof Error ? failure.message : "Unknown error");
          failed++;
        }
      }));
    }
    return Response.json({ claimed: data.length, completed, failed }, { status: failed ? 500 : 200 });
  } catch (failure) {
    console.error("Push worker failed:", failure instanceof Error ? failure.message : "Unknown error");
    return new Response("Push worker failed", { status: 500 });
  }
});
