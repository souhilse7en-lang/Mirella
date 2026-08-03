import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false, autoRefreshToken: false } }
);

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body?.order || !Array.isArray(body.items) || body.items.length === 0) {
    return NextResponse.json({ error: "Payload invalide" }, { status: 400 });
  }

  const { order, items } = body;

  // Insérer la commande (service role → contourne RLS)
  const { data: createdOrder, error: orderErr } = await supabaseAdmin
    .from("orders")
    .insert(order)
    .select("id, numero_commande")
    .single();

  if (orderErr || !createdOrder) {
    return NextResponse.json(
      { error: orderErr?.message ?? "Erreur création commande" },
      { status: 500 }
    );
  }

  // Insérer les articles
  const { error: itemsErr } = await supabaseAdmin.from("order_items").insert(
    items.map((item: Record<string, unknown>) => ({
      ...item,
      order_id: createdOrder.id,
    }))
  );

  if (itemsErr) {
    // Rollback : supprimer la commande créée
    await supabaseAdmin.from("orders").delete().eq("id", createdOrder.id);
    return NextResponse.json({ error: itemsErr.message }, { status: 500 });
  }

  // Déclencher l'email en arrière-plan (fire-and-forget)
  const origin = req.headers.get("origin") ?? "";
  fetch(`${origin}/api/send-order-email`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ orderId: createdOrder.id }),
  }).catch(() => {});

  return NextResponse.json({
    id: createdOrder.id,
    numero_commande: createdOrder.numero_commande,
  });
}
