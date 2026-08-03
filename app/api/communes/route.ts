import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false, autoRefreshToken: false } }
);

export async function GET(req: NextRequest) {
  const wilayaId = req.nextUrl.searchParams.get("wilaya_id");
  if (!wilayaId || isNaN(Number(wilayaId))) {
    return NextResponse.json([], { status: 200 });
  }

  const { data, error } = await supabaseAdmin
    .from("communes")
    .select("id, nom")
    .eq("wilaya_id", Number(wilayaId))
    .order("nom");

  if (error) return NextResponse.json([], { status: 200 });
  return NextResponse.json(data ?? []);
}
