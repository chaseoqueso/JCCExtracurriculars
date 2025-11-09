import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

console.log("create-user updated");

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

    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

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

    // Parse request
    const payload = await req.json();
    const { username, email, role } = payload;
    if (!username || !email || !role) {
      return new Response(JSON.stringify({ error: "Missing fields" }), {
        status: 400,
        headers: corsHeaders(),
      });
    }

    // ✅ fetch default password
    const { data: setting, error: fetchError } = await serviceClient
      .from("app_settings")
      .select("value")
      .eq("key", "default_general_password")
      .single();

    if (fetchError || !setting?.value) {
      return new Response(
        JSON.stringify({ error: "Could not fetch default password" }),
        { status: 500, headers: corsHeaders() }
      );
    }

    const defaultPassword = setting.value;

    // ✅ create auth user
    const { data: authUser, error: authError } =
      await serviceClient.auth.admin.createUser({
        email,
        password: defaultPassword,
        email_confirm: true,
      });

    if (authError || !authUser?.user) {
      return new Response(
        JSON.stringify({ error: authError?.message || "Auth failure" }),
        { status: 400, headers: corsHeaders() }
      );
    }

    // ✅ add to users table
    const { error: insertError } = await serviceClient.from("users").insert({
      id: authUser.user.id,
      username,
      role,
      email,
    });

    if (insertError) {
      return new Response(JSON.stringify({ error: insertError.message }), {
        status: 400,
        headers: corsHeaders(),
      });
    }

    return new Response(JSON.stringify({ message: "User created" }), {
      status: 200,
      headers: corsHeaders(),
    });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: "Unexpected error" }), {
      status: 500,
      headers: corsHeaders(),
    });
  }
});
