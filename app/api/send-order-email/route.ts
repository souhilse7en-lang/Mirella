import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import { NextRequest, NextResponse } from "next/server";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false, autoRefreshToken: false } }
);

const ADMIN_EMAIL = "souhil.se7en@gmail.com";

export async function POST(req: NextRequest) {
  const { orderId } = await req.json().catch(() => ({}));
  if (!orderId) return NextResponse.json({ error: "orderId manquant" }, { status: 400 });

  if (!process.env.RESEND_API_KEY) {
    console.warn("[send-order-email] RESEND_API_KEY non définie — email ignoré");
    return NextResponse.json({ skipped: true });
  }

  // Récupérer commande + détails wilaya + commune
  const [{ data: order }, { data: items }] = await Promise.all([
    supabaseAdmin
      .from("orders")
      .select("*, wilayas(nom), communes(nom)")
      .eq("id", orderId)
      .single(),
    supabaseAdmin.from("order_items").select("*").eq("order_id", orderId),
  ]);

  if (!order) return NextResponse.json({ error: "Commande introuvable" }, { status: 404 });

  const wilayaNom  = (order.wilayas  as { nom: string } | null)?.nom  ?? `Wilaya ${order.client_wilaya_id}`;
  const communeNom = (order.communes as { nom: string } | null)?.nom  ?? null;
  const livraison  = order.type_livraison === "domicile" ? "À domicile" : "Stop Desk";
  const dateStr    = new Date(order.created_at).toLocaleDateString("fr-FR", {
    day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit",
  });

  const articlesHtml = (items ?? [])
    .map(
      (it) => `
      <tr>
        <td style="padding:8px 12px;border-bottom:1px solid #f0e8eb;">${it.product_name}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #f0e8eb;text-align:center;">${it.size}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #f0e8eb;text-align:center;">${it.color ?? "—"}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #f0e8eb;text-align:center;">${it.quantity}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #f0e8eb;text-align:right;">${(it.quantity * Number(it.unit_price)).toLocaleString("fr-FR")} DA</td>
      </tr>`
    )
    .join("");

  const html = `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#faf7f5;font-family:Georgia,serif;color:#4a2e38;">
  <div style="max-width:600px;margin:32px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 16px rgba(74,46,56,0.08);">

    <!-- Header -->
    <div style="background:#4a2e38;padding:28px 32px;">
      <p style="margin:0;font-size:22px;font-weight:700;letter-spacing:0.15em;color:#faf7f5;">MIRELLA</p>
      <p style="margin:6px 0 0;font-size:13px;color:#c98a9b;">Nouvelle commande reçue</p>
    </div>

    <div style="padding:28px 32px;">

      <!-- N° commande -->
      <div style="background:#faf7f5;border-radius:8px;padding:16px 20px;margin-bottom:24px;">
        <p style="margin:0;font-size:12px;color:#9b6b76;text-transform:uppercase;letter-spacing:0.1em;">Numéro de commande</p>
        <p style="margin:6px 0 0;font-size:20px;font-weight:700;font-family:monospace;color:#4a2e38;">${order.numero_commande}</p>
        <p style="margin:4px 0 0;font-size:12px;color:#9b6b76;">${dateStr}</p>
      </div>

      <!-- Client -->
      <h2 style="font-size:14px;text-transform:uppercase;letter-spacing:0.1em;color:#9b6b76;margin:0 0 12px;">Client</h2>
      <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
        <tr><td style="padding:5px 0;font-size:13px;color:#9b6b76;width:140px;">Nom</td><td style="padding:5px 0;font-size:14px;font-weight:600;">${order.client_nom}</td></tr>
        <tr><td style="padding:5px 0;font-size:13px;color:#9b6b76;">Téléphone</td><td style="padding:5px 0;font-size:14px;font-weight:600;">${order.client_telephone}</td></tr>
        <tr><td style="padding:5px 0;font-size:13px;color:#9b6b76;">Wilaya</td><td style="padding:5px 0;font-size:14px;">${wilayaNom}${communeNom ? ` — ${communeNom}` : ""}</td></tr>
        <tr><td style="padding:5px 0;font-size:13px;color:#9b6b76;">Adresse</td><td style="padding:5px 0;font-size:14px;">${order.client_adresse}</td></tr>
        <tr><td style="padding:5px 0;font-size:13px;color:#9b6b76;">Livraison</td><td style="padding:5px 0;font-size:14px;">${livraison}</td></tr>
        ${order.notes ? `<tr><td style="padding:5px 0;font-size:13px;color:#9b6b76;">Notes</td><td style="padding:5px 0;font-size:14px;font-style:italic;">${order.notes}</td></tr>` : ""}
      </table>

      <!-- Articles -->
      <h2 style="font-size:14px;text-transform:uppercase;letter-spacing:0.1em;color:#9b6b76;margin:0 0 12px;">Articles</h2>
      <table style="width:100%;border-collapse:collapse;margin-bottom:24px;font-size:13px;">
        <thead>
          <tr style="background:#faf7f5;">
            <th style="padding:8px 12px;text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:0.08em;color:#9b6b76;">Produit</th>
            <th style="padding:8px 12px;text-align:center;font-size:11px;text-transform:uppercase;letter-spacing:0.08em;color:#9b6b76;">Taille</th>
            <th style="padding:8px 12px;text-align:center;font-size:11px;text-transform:uppercase;letter-spacing:0.08em;color:#9b6b76;">Couleur</th>
            <th style="padding:8px 12px;text-align:center;font-size:11px;text-transform:uppercase;letter-spacing:0.08em;color:#9b6b76;">Qté</th>
            <th style="padding:8px 12px;text-align:right;font-size:11px;text-transform:uppercase;letter-spacing:0.08em;color:#9b6b76;">Prix</th>
          </tr>
        </thead>
        <tbody>${articlesHtml}</tbody>
      </table>

      <!-- Totaux -->
      <div style="background:#faf7f5;border-radius:8px;padding:16px 20px;">
        <div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:6px;">
          <span style="color:#9b6b76;">Produits</span>
          <span>${Number(order.montant_produits).toLocaleString("fr-FR")} DA</span>
        </div>
        <div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:10px;">
          <span style="color:#9b6b76;">Frais de livraison</span>
          <span>${Number(order.frais_livraison).toLocaleString("fr-FR")} DA</span>
        </div>
        <div style="display:flex;justify-content:space-between;font-size:16px;font-weight:700;border-top:1px solid #e8dfe3;padding-top:10px;">
          <span>Total</span>
          <span>${Number(order.montant_total).toLocaleString("fr-FR")} DA</span>
        </div>
      </div>

    </div>

    <!-- Footer -->
    <div style="background:#faf7f5;padding:20px 32px;text-align:center;border-top:1px solid #e8dfe3;">
      <p style="margin:0;font-size:12px;color:#9b6b76;">Mirella — Paiement à la livraison</p>
    </div>
  </div>
</body>
</html>`;

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: "Mirella <onboarding@resend.dev>",
      to: [ADMIN_EMAIL],
      subject: `Nouvelle commande ${order.numero_commande}`,
      html,
    });
    return NextResponse.json({ sent: true });
  } catch (err) {
    console.error("[send-order-email]", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
