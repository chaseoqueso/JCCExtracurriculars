import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

console.log("delete-user live");

serve(async (req: Request) => {
  console.log("Incoming request:", req.method, req.url, [...req.headers.entries()]);
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders() });
  }

  try {
    console.log("1")
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: corsHeaders(),
      });
    }
    console.log("2")

    const authHeader = req.headers.get("Authorization") || "";

    // ✅ anon client to validate the requesting user's token
    const anonClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );
    console.log("3")

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
    console.log("4")

    // ✅ service client for admin actions
    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );
    console.log("5")

    // confirm the caller is an admin
    const { data: isAdmin, error: isAdminError } = await serviceClient.rpc(
      "is_admin",
      { uid: user.id }
    );
    console.log("6")

    if (isAdminError || !isAdmin) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: corsHeaders(),
      });
    }
    console.log("7")

    // parse payload
    const payload = await req.json();
    console.log("delete-user payload:", payload);
    const { userId } = payload;
    if (!userId) {
      return new Response(JSON.stringify({ error: "Missing userId" }), {
        status: 400,
        headers: corsHeaders(),
      });
    }
    console.log("8")

    // delete from auth
    const { error: authError } = await serviceClient.auth.admin.deleteUser(
      userId
    );
    console.log("Attempting to delete auth user:", userId);
    const { data: authCheck, error: authCheckError } = await serviceClient.auth.admin.getUserById(userId);
    console.log("Auth lookup:", authCheck, authCheckError);
    console.log("9")

    if (authError) {
      console.log(authError)
      return new Response(JSON.stringify({ error: authError.message }), {
        status: 400,
        headers: corsHeaders(),
      });
    }
    console.log("10")

    // delete from users table
    const { error: dbError } = await serviceClient
      .from("users")
      .delete()
      .eq("id", userId);
    console.log("11")

    if (dbError) {
      return new Response(JSON.stringify({ error: dbError.message }), {
        status: 400,
        headers: corsHeaders(),
      });
    }
    console.log("12")

    return new Response(JSON.stringify({ message: "User deleted" }), {
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
