"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

const STATUSES = [
  { value: "en_attente",     label: "En attente" },
  { value: "confirmée",      label: "Confirmée" },
  { value: "en_préparation", label: "En préparation" },
  { value: "expédiée",       label: "Expédiée" },
  { value: "livrée",         label: "Livrée" },
  { value: "refusée",        label: "Refusée" },
];

export default function UpdateStatusButton({ orderId, currentStatus }: { orderId: string; currentStatus: string }) {
  const [status, setStatus] = useState(currentStatus);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleUpdate() {
    setLoading(true);
    await supabase.from("orders").update({ status }).eq("id", orderId);
    router.refresh();
    setLoading(false);
  }

  return (
    <div className="flex items-center gap-3">
      <select
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        className="border border-input rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
      >
        {STATUSES.map((s) => (
          <option key={s.value} value={s.value}>{s.label}</option>
        ))}
      </select>
      <Button onClick={handleUpdate} disabled={loading || status === currentStatus}>
        {loading ? "Mise à jour…" : "Enregistrer"}
      </Button>
    </div>
  );
}
