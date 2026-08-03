"use client";

import { useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { Check, Loader2 } from "lucide-react";

interface Wilaya {
  id: number;
  nom: string;
  frais_livraison_domicile: number;
  frais_livraison_stopdesk: number;
  delai_estime_jours: number;
}

type EditableField = "frais_livraison_domicile" | "frais_livraison_stopdesk" | "delai_estime_jours";

interface CellState {
  wilayaId: number;
  field: EditableField;
  value: string;
}

export default function WilayasTable({ wilayas: initial }: { wilayas: Wilaya[] }) {
  const supabase = createClient();
  const [wilayas, setWilayas] = useState<Wilaya[]>(initial);
  const [editing, setEditing] = useState<CellState | null>(null);
  const [saving, setSaving] = useState<string | null>(null); // "wilayaId-field"
  const [saved, setSaved]   = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function startEdit(wilaya: Wilaya, field: EditableField) {
    setEditing({ wilayaId: wilaya.id, field, value: String(wilaya[field]) });
    setTimeout(() => inputRef.current?.select(), 10);
  }

  async function commitEdit() {
    if (!editing) return;
    const { wilayaId, field, value } = editing;
    const numValue = Number(value);
    if (isNaN(numValue) || numValue < 0) { setEditing(null); return; }

    const key = `${wilayaId}-${field}`;
    setSaving(key);
    setEditing(null);

    const { error } = await supabase
      .from("wilayas")
      .update({ [field]: numValue })
      .eq("id", wilayaId);

    setSaving(null);
    if (!error) {
      setWilayas((prev) =>
        prev.map((w) => w.id === wilayaId ? { ...w, [field]: numValue } : w)
      );
      setSaved(key);
      setTimeout(() => setSaved(null), 1500);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter")  commitEdit();
    if (e.key === "Escape") setEditing(null);
  }

  function Cell({
    wilaya,
    field,
    suffix = " DA",
    min = 0,
  }: {
    wilaya: Wilaya;
    field: EditableField;
    suffix?: string;
    min?: number;
  }) {
    const key = `${wilaya.id}-${field}`;
    const isEditing = editing?.wilayaId === wilaya.id && editing?.field === field;
    const isSaving  = saving === key;
    const isSaved   = saved  === key;

    if (isEditing) {
      return (
        <td className="px-4 py-2.5">
          <input
            ref={inputRef}
            type="number"
            min={min}
            value={editing.value}
            onChange={(e) => setEditing((prev) => prev ? { ...prev, value: e.target.value } : null)}
            onBlur={commitEdit}
            onKeyDown={handleKeyDown}
            className="w-24 border border-ring rounded-md px-2 py-1 text-sm text-right focus:outline-none focus:ring-2 focus:ring-ring bg-background"
          />
        </td>
      );
    }

    return (
      <td
        className="px-4 py-2.5 cursor-pointer select-none group"
        onClick={() => startEdit(wilaya, field)}
        title="Cliquer pour modifier"
      >
        <span className="inline-flex items-center gap-1.5">
          {isSaving && <Loader2 size={12} className="animate-spin text-muted-foreground" />}
          {isSaved  && <Check size={12} className="text-green-600" />}
          <span
            className={`tabular-nums rounded px-1.5 py-0.5 transition-colors ${
              isSaved ? "text-green-700 bg-green-50" : "group-hover:bg-muted"
            }`}
          >
            {wilaya[field].toLocaleString("fr-FR")}{suffix}
          </span>
        </span>
      </td>
    );
  }

  return (
    <div className="bg-background rounded-xl border border-border overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/40">
            <th className="text-left px-4 py-3 font-medium text-muted-foreground w-10">#</th>
            <th className="text-left px-4 py-3 font-medium text-muted-foreground">Wilaya</th>
            <th className="text-right px-4 py-3 font-medium text-muted-foreground">Domicile</th>
            <th className="text-right px-4 py-3 font-medium text-muted-foreground">Stop Desk</th>
            <th className="text-right px-4 py-3 font-medium text-muted-foreground">Délai (j)</th>
          </tr>
        </thead>
        <tbody>
          {wilayas.map((w, i) => (
            <tr
              key={w.id}
              className={`border-b border-border last:border-0 hover:bg-muted/20 transition-colors ${
                i % 2 === 0 ? "" : "bg-muted/10"
              }`}
            >
              <td className="px-4 py-2.5 text-muted-foreground tabular-nums text-xs">
                {String(w.id).padStart(2, "0")}
              </td>
              <td className="px-4 py-2.5 font-medium">{w.nom}</td>
              <Cell wilaya={w} field="frais_livraison_domicile" suffix=" DA" />
              <Cell wilaya={w} field="frais_livraison_stopdesk" suffix=" DA" />
              <Cell wilaya={w} field="delai_estime_jours" suffix=" j" min={1} />
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
