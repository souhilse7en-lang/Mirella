"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const STATUSES = [
  { value: "non_lu",  label: "Non lu" },
  { value: "lu",      label: "Lu" },
  { value: "répondu", label: "Répondu" },
];

export default function UpdateMessageStatus({ id, currentStatus }: { id: string; currentStatus: string }) {
  const [status, setStatus] = useState(currentStatus);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleChange(newStatus: string) {
    setStatus(newStatus);
    setLoading(true);
    await supabase.from("messages_contact").update({ statut: newStatus }).eq("id", id);
    router.refresh();
    setLoading(false);
  }

  return (
    <select
      value={status}
      onChange={(e) => handleChange(e.target.value)}
      disabled={loading}
      className="border border-input rounded-md px-2 py-1 text-xs bg-background focus:outline-none focus:ring-1 focus:ring-ring"
    >
      {STATUSES.map((s) => (
        <option key={s.value} value={s.value}>{s.label}</option>
      ))}
    </select>
  );
}
