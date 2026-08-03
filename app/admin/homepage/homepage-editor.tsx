"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle, Loader2, AlertCircle } from "lucide-react";

interface Props {
  content: Record<string, string>;
}

const FIELDS = [
  {
    key: "hero_eyebrow",
    label: "Topline (petite accroche)",
    description: 'Le texte au-dessus du titre — ex. "Nouvelle collection · Rentrée 2026"',
    type: "input" as const,
  },
  {
    key: "hero_title_1",
    label: "Titre — ligne 1 (gras)",
    description: "Première ligne du grand titre hero",
    type: "input" as const,
  },
  {
    key: "hero_title_2",
    label: "Titre — ligne 2 (italique/clair)",
    description: "Deuxième ligne en italique",
    type: "input" as const,
  },
  {
    key: "hero_subtitle",
    label: "Sous-titre / tagline",
    description: "Phrase courte sous le titre",
    type: "input" as const,
  },
];

export default function HomepageEditor({ content }: Props) {
  const [values, setValues] = useState<Record<string, string>>(content);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  function set(key: string, value: string) {
    setValues((v) => ({ ...v, [key]: value }));
    setSaved(false);
  }

  async function handleSave() {
    setSaving(true);
    setError("");
    setSaved(false);

    const rows = FIELDS.map((f) => ({ key: f.key, value: values[f.key] ?? "" }));

    const res = await fetch("/api/site-content", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rows }),
    });

    const json = await res.json().catch(() => ({}));
    setSaving(false);

    if (!res.ok) {
      setError(json.error ?? "Erreur lors de la sauvegarde.");
      return;
    }

    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <div className="space-y-6">

      {/* Prévisualisation live */}
      <div className="bg-background border border-border rounded-xl p-6 space-y-1" style={{ background: "linear-gradient(135deg,#F5EDE8,#FAF7F5,#F0E8ED)" }}>
        <p className="text-[10px] uppercase tracking-[0.35em]" style={{ color: "#C98A9B" }}>
          {values.hero_eyebrow || "—"}
        </p>
        <p className="text-2xl font-semibold leading-tight" style={{ color: "#4A2E38" }}>
          {values.hero_title_1 || "—"}
        </p>
        <p className="text-2xl italic font-light leading-tight" style={{ color: "#9B6B76" }}>
          {values.hero_title_2 || "—"}
        </p>
        <p className="text-sm mt-2" style={{ color: "#9B6B76" }}>
          {values.hero_subtitle || "—"}
        </p>
        <p className="text-[10px] text-muted-foreground mt-3">Prévisualisation du hero</p>
      </div>

      {/* Champs */}
      <div className="bg-background border border-border rounded-xl divide-y divide-border">
        {FIELDS.map((field) => (
          <div key={field.key} className="p-5 space-y-2">
            <div>
              <label className="text-sm font-medium">{field.label}</label>
              <p className="text-xs text-muted-foreground mt-0.5">{field.description}</p>
            </div>
            <input
              value={values[field.key] ?? ""}
              onChange={(e) => set(field.key, e.target.value)}
              className="w-full border border-input rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder={field.label}
            />
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <Button
          onClick={handleSave}
          disabled={saving}
          className="px-6"
          style={{ backgroundColor: "#4A2E38", color: "#FAF7F5" }}
        >
          {saving ? <><Loader2 size={14} className="animate-spin mr-2" />Sauvegarde…</> : "Enregistrer les modifications"}
        </Button>

        {saved && (
          <span className="flex items-center gap-1.5 text-sm text-green-600">
            <CheckCircle size={14} /> Sauvegardé
          </span>
        )}
        {error && (
          <span className="flex items-center gap-1.5 text-sm text-destructive">
            <AlertCircle size={14} /> {error}
          </span>
        )}
      </div>

      {error?.includes("site_content") && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
          <p className="font-medium mb-1">Table manquante</p>
          <p>Exécute <code className="bg-amber-100 px-1 rounded">supabase/site_content.sql</code> dans le SQL Editor Supabase, puis recharge cette page.</p>
        </div>
      )}
    </div>
  );
}
