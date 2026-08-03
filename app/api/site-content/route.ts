import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false, autoRefreshToken: false } }
);

export async function POST(req: NextRequest) {
  const { rows } = await req.json().catch(() => ({}));
  if (!Array.isArray(rows)) {
    return NextResponse.json({ error: "Payload invalide" }, { status: 400 });
  }

  const { error } = await supabaseAdmin
    .from("site_content")
    .upsert(
      rows.map((r: { key: string; value: string }) => ({
        key:        r.key,
        value:      r.value ?? "",
        updated_at: new Date().toISOString(),
      })),
      { onConflict: "key" }
    );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
