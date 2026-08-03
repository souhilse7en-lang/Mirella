"use client";

import { useState, useEffect } from "react";
import { useCart } from "@/lib/cart-context";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { CheckCircle, Loader2 } from "lucide-react";

async function fetchCommunes(wilayaId: number): Promise<Commune[]> {
  const res = await fetch(`/api/communes?wilaya_id=${wilayaId}`);
  if (!res.ok) return [];
  return res.json();
}

interface Wilaya {
  id: number;
  nom: string;
  frais_livraison_domicile: number;
  frais_livraison_stopdesk: number;
  delai_estime_jours: number;
}

interface Commune {
  id: number;
  nom: string;
}

export default function CheckoutForm({ wilayas }: { wilayas: Wilaya[] }) {
  const supabase = createClient();
  const { items, total, clear } = useCart();

  const [nom, setNom] = useState("");
  const [telephone, setTelephone] = useState("");
  const [wilayaId, setWilayaId] = useState<number | "">("");
  const [communeId, setCommuneId] = useState<number | "">("");
  const [communes, setCommunes] = useState<Commune[]>([]);
  const [loadingCommunes, setLoadingCommunes] = useState(false);
  const [adresse, setAdresse] = useState("");
  const [typeLivraison, setTypeLivraison] = useState<"domicile" | "stopdesk">("domicile");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [numeroCommande, setNumeroCommande] = useState("");
  const [telephone2, setTelephone2] = useState("");

  const selectedWilaya = wilayas.find((w) => w.id === wilayaId);
  const fraisLivraison = selectedWilaya
    ? typeLivraison === "domicile"
      ? selectedWilaya.frais_livraison_domicile
      : selectedWilaya.frais_livraison_stopdesk
    : null;
  const montantTotal = fraisLivraison !== null ? total + fraisLivraison : null;

  useEffect(() => {
    if (!wilayaId) { setCommunes([]); setCommuneId(""); return; }
    setLoadingCommunes(true);
    setCommuneId("");
    fetchCommunes(Number(wilayaId)).then((data) => {
      setCommunes(data);
      setLoadingCommunes(false);
    });
  }, [wilayaId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!wilayaId || fraisLivraison === null || montantTotal === null) return;
    setError("");
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();

    const orderPayload: Record<string, unknown> = {
      user_id: user?.id ?? null,
      client_nom: nom,
      client_telephone: telephone,
      client_wilaya_id: wilayaId,
      client_adresse: adresse,
      type_livraison: typeLivraison,
      frais_livraison: fraisLivraison,
      montant_produits: total,
      montant_total: montantTotal,
      notes: notes || null,
    };
    if (communeId) orderPayload.client_commune_id = communeId;

    const orderItems = items.map((item) => ({
      product_id: item.productId,
      variant_id: item.variantId,
      product_name: item.name,
      size: item.size,
      color: item.color || null,
      unit_price: item.price,
      quantity: item.quantity,
    }));

    const res = await fetch("/api/place-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ order: orderPayload, items: orderItems }),
    });

    const json = await res.json().catch(() => ({}));

    if (!res.ok || !json.numero_commande) {
      setError(json.error ?? "Erreur lors de la création de la commande.");
      setLoading(false);
      return;
    }

    clear();
    setNumeroCommande(json.numero_commande);
    setTelephone2(telephone);
    setDone(true);
    setLoading(false);
  }

  if (done) {
    return (
      <div className="max-w-lg mx-auto text-center py-16 px-6">
        <CheckCircle size={56} className="mx-auto mb-6" style={{ color: "#C98A9B" }} />
        <h1 className="text-2xl font-semibold mb-2" style={{ color: "#4A2E38" }}>Commande confirmée !</h1>
        <p className="mb-4" style={{ color: "#9B6B76" }}>
          Votre commande <span className="font-mono font-semibold" style={{ color: "#4A2E38" }}>{numeroCommande}</span> a été enregistrée.
        </p>
        <p className="text-sm mb-8" style={{ color: "#9B6B76" }}>
          Notre équipe vous contactera au <strong style={{ color: "#4A2E38" }}>{telephone2}</strong> pour confirmer la livraison.
        </p>
        <Button asChild className="rounded-full px-8" style={{ backgroundColor: "#4A2E38", color: "#FAF7F5" }}>
          <a href="/collections">Continuer mes achats</a>
        </Button>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-lg mx-auto text-center py-16 px-6">
        <p className="mb-4" style={{ color: "#9B6B76" }}>Votre panier est vide.</p>
        <Button asChild><a href="/collections">Voir les collections</a></Button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-semibold tracking-tight mb-10" style={{ color: "#4A2E38" }}>Finaliser la commande</h1>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-5 gap-10">

        {/* ── FORMULAIRE ──────────────────── */}
        <div className="lg:col-span-3 space-y-6">

          {/* Infos client */}
          <section className="bg-background border border-border rounded-xl p-6 space-y-4">
            <h2 className="font-medium">Informations personnelles</h2>
            <div>
              <label className="text-sm font-medium block mb-1.5">Nom complet *</label>
              <input value={nom} onChange={(e) => setNom(e.target.value)} required placeholder="Prénom Nom"
                className="w-full border border-input rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1.5">Numéro de téléphone *</label>
              <input value={telephone} onChange={(e) => setTelephone(e.target.value)} required placeholder="0555 000 000" type="tel"
                className="w-full border border-input rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
          </section>

          {/* Livraison */}
          <section className="bg-background border border-border rounded-xl p-6 space-y-4">
            <h2 className="font-medium">Livraison</h2>

            {/* Wilaya */}
            <div>
              <label className="text-sm font-medium block mb-1.5">Wilaya *</label>
              <select
                value={wilayaId}
                onChange={(e) => setWilayaId(e.target.value ? Number(e.target.value) : "")}
                required
                className="w-full border border-input rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">— Sélectionnez votre wilaya —</option>
                {wilayas.map((w) => (
                  <option key={w.id} value={w.id}>{String(w.id).padStart(2, "0")} — {w.nom}</option>
                ))}
              </select>
            </div>

            {/* Commune */}
            {wilayaId !== "" && (
              <div>
                <label className="text-sm font-medium block mb-1.5">
                  Commune
                  {loadingCommunes && <Loader2 size={12} className="inline ml-2 animate-spin text-muted-foreground" />}
                </label>
                <select
                  value={communeId}
                  onChange={(e) => setCommuneId(e.target.value ? Number(e.target.value) : "")}
                  disabled={loadingCommunes || communes.length === 0}
                  className="w-full border border-input rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
                >
                  <option value="">— Optionnel —</option>
                  {communes.map((c) => (
                    <option key={c.id} value={c.id}>{c.nom}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Type de livraison */}
            <div>
              <label className="text-sm font-medium block mb-2">Mode de livraison *</label>
              <div className="grid grid-cols-2 gap-3">
                {(["domicile", "stopdesk"] as const).map((type) => {
                  const frais = selectedWilaya
                    ? type === "domicile"
                      ? selectedWilaya.frais_livraison_domicile
                      : selectedWilaya.frais_livraison_stopdesk
                    : null;
                  const label = type === "domicile" ? "À domicile" : "Stop Desk";
                  const desc  = type === "domicile" ? "Livraison chez vous" : "Retrait en agence";
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setTypeLivraison(type)}
                      className="text-left p-3 rounded-lg border-2 transition-colors"
                      style={{
                        borderColor: typeLivraison === type ? "#C98A9B" : "#E8DFE3",
                        backgroundColor: typeLivraison === type ? "rgba(201,138,155,0.06)" : "transparent",
                      }}
                    >
                      <p className="text-sm font-medium">{label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
                      {frais !== null && (
                        <p className="text-sm font-semibold mt-1">{frais.toLocaleString("fr-FR")} DA</p>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Adresse */}
            <div>
              <label className="text-sm font-medium block mb-1.5">Adresse détaillée *</label>
              <textarea
                value={adresse}
                onChange={(e) => setAdresse(e.target.value)}
                required rows={3}
                placeholder={typeLivraison === "domicile" ? "Numéro, rue, quartier, commune…" : "Nom ou adresse de l'agence Stop Desk"}
                className="w-full border border-input rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              />
            </div>

            {selectedWilaya && (
              <p className="text-xs text-muted-foreground">
                Délai estimé : <strong>{selectedWilaya.delai_estime_jours} jour{selectedWilaya.delai_estime_jours > 1 ? "s" : ""}</strong> ouvré{selectedWilaya.delai_estime_jours > 1 ? "s" : ""}
              </p>
            )}
          </section>

          {/* Notes */}
          <section className="bg-background border border-border rounded-xl p-6">
            <label className="text-sm font-medium block mb-1.5">Notes (optionnel)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Instructions particulières pour la livraison…"
              className="w-full border border-input rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            />
          </section>
        </div>

        {/* ── RÉSUMÉ ──────────────────────── */}
        <div className="lg:col-span-2">
          <div className="bg-background border border-border rounded-xl p-6 sticky top-20 space-y-4">
            <h2 className="font-semibold">Votre commande</h2>

            <div className="space-y-3 max-h-64 overflow-y-auto">
              {items.map((item) => (
                <div key={item.variantId} className="flex gap-3 items-center">
                  <div className="w-12 h-14 bg-muted rounded-lg flex-shrink-0 overflow-hidden">
                    {item.imageUrl && <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{item.size}{item.color && ` · ${item.color}`} × {item.quantity}</p>
                  </div>
                  <p className="text-sm font-semibold flex-shrink-0">{(item.price * item.quantity).toLocaleString("fr-FR")} DA</p>
                </div>
              ))}
            </div>

            <div className="border-t border-border pt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Produits</span>
                <span>{total.toLocaleString("fr-FR")} DA</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Livraison</span>
                <span>
                  {fraisLivraison !== null
                    ? `${fraisLivraison.toLocaleString("fr-FR")} DA`
                    : <span className="italic text-muted-foreground text-xs">Sélectionnez une wilaya</span>
                  }
                </span>
              </div>
              <div className="flex justify-between font-semibold text-base border-t border-border pt-2 mt-1">
                <span>Total</span>
                <span>{montantTotal !== null ? `${montantTotal.toLocaleString("fr-FR")} DA` : "—"}</span>
              </div>
            </div>

            <p className="text-xs text-muted-foreground bg-muted rounded-lg p-3">
              Paiement à la livraison — notre équipe vous contacte pour confirmer votre commande.
            </p>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <Button
              type="submit"
              disabled={loading || !wilayaId || fraisLivraison === null}
              className="w-full h-11 rounded-xl"
              style={{ backgroundColor: "#4A2E38", color: "#FAF7F5" }}
            >
              {loading ? "Enregistrement…" : "Confirmer la commande"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
