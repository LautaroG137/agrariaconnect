import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function createPassword() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = crypto.getRandomValues(new Uint8Array(8));
  return Array.from(bytes, (byte) => alphabet[byte % alphabet.length]).join("");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ ok: false, error: "Método no permitido" }, 405);

  try {
    const { environmentId } = await req.json();
    if (!environmentId || typeof environmentId !== "string") {
      return json({ ok: false, error: "No se indicó el entorno." });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !serviceKey) {
      return json({ ok: false, error: "El servidor no está configurado." });
    }

    const admin = createClient(supabaseUrl, serviceKey);
    const { data: environment, error } = await admin
      .from("environments")
      .select("id, name, recovery_email, password_reset_at")
      .eq("id", environmentId)
      .maybeSingle();

    if (error || !environment) return json({ ok: false, error: "No se encontró el entorno." });

    const email = String(environment.recovery_email ?? "").trim();
    if (!email) return json({ ok: false, error: "Este entorno no tiene un mail de recuperación." });

    if (environment.password_reset_at) {
      const elapsed = Date.now() - new Date(environment.password_reset_at).getTime();
      if (elapsed < 60_000) {
        return json({ ok: false, error: "Esperá un minuto antes de pedir otra contraseña." });
      }
    }

    const apiKey = Deno.env.get("RESEND_API_KEY");
    const from = Deno.env.get("RESEND_FROM");
    if (!apiKey || !from) {
      return json({ ok: false, error: "El envío de mails todavía no está configurado." });
    }

    const password = createPassword();
    const mail = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [email],
        subject: `Nueva contraseña de ${environment.name}`,
        text: `Hola,\n\nLa nueva contraseña del entorno "${environment.name}" en AgrariaConnect es:\n\n${password}\n\nLa contraseña anterior ya no sirve.\n`,
      }),
    });

    if (!mail.ok) {
      console.error(await mail.text());
      return json({ ok: false, error: "No se pudo enviar el mail. Probá de nuevo en unos minutos." });
    }

    const { error: updateError } = await admin
      .from("environments")
      .update({ password, password_reset_at: new Date().toISOString() })
      .eq("id", environmentId);

    if (updateError) {
      return json({
        ok: false,
        error: "El mail salió, pero no se pudo guardar la contraseña nueva. Avisá a quien administra el sistema.",
      });
    }

    return json({ ok: true, email });
  } catch (error) {
    console.error(error);
    return json({ ok: false, error: "No se pudo recuperar la contraseña." }, 500);
  }
});
