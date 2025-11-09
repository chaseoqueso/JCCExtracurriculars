import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

console.log("update-passwords live");

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders() });
  }

  try {
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: corsHeaders(),
      });
    }

    const authHeader = req.headers.get("Authorization") || "";

    // anon client for verifying JWT
    const anonClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const {
      data: { user },
      error: userError,
    } = await anonClient.auth.getUser();

    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: corsHeaders(),
      });
    }

    // service client for admin operations
    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // confirm admin
    const { data: isAdmin, error: isAdminError } = await serviceClient.rpc(
      "is_admin",
      { uid: user.id }
    );

    if (isAdminError || !isAdmin) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: corsHeaders(),
      });
    }

    // parse input
    const payload = await req.json();
    const { newPassword } = payload;
    if (!newPassword) {
      return new Response(JSON.stringify({ error: "Missing newPassword" }), {
        status: 400,
        headers: corsHeaders(),
      });
    }

    // get all general users
    const { data: generalUsers, error: userQueryError } = await serviceClient
      .from("users")
      .select("id, email")
      .eq("role", "general");

    if (userQueryError) {
      return new Response(JSON.stringify({ error: userQueryError.message }), {
        status: 400,
        headers: corsHeaders(),
      });
    }

    if (!generalUsers?.length) {
      return new Response(JSON.stringify({ message: "No general users found" }), {
        status: 200,
        headers: corsHeaders(),
      });
    }

    console.log(`Updating ${generalUsers.length} users`);

    // batch update passwords
    const results = [];
    for (const u of generalUsers) {
      const { error } = await serviceClient.auth.admin.updateUserById(u.id, {
        password: newPassword,
      });
      if (error) {
        console.error(`Failed for ${u.email}:`, error.message);
        results.push({ email: u.email, status: "failed", error: error.message });
      } else {
        results.push({ email: u.email, status: "success" });
      }
    }

    // ✅ also update stored default password
    const { error: updateError } = await serviceClient
      .from("app_settings")
      .update({ value: newPassword, updated_at: new Date().toISOString() })
      .eq("key", "default_general_password");

    if (updateError) {
      console.error("Failed to update default password setting:", updateError.message);
    }

    return new Response(
      JSON.stringify({
        message: `Passwords updated for ${results.filter(r => r.status === "success").length} users.`,
        results,
      }),
      { status: 200, headers: corsHeaders() }
    );
  } catch (err) {
    console.error("Error in update-passwords:", err);
    return new Response(JSON.stringify({ error: "Unexpected error" }), {
      status: 500,
      headers: corsHeaders(),
    });
  }
});
