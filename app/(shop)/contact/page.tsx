"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { CheckCircle } from "lucide-react";

export default function ContactPage() {
  const supabase = createClient();
  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");
  const [telephone, setTelephone] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error } = await supabase.from("messages_contact").insert({
      nom,
      email,
      telephone: telephone || null,
      message,
    });
    if (error) {
      setError("Une erreur s'est produite. Veuillez réessayer.");
    } else {
      setDone(true);
    }
    setLoading(false);
  }

  if (done) {
    return (
      <div className="max-w-xl mx-auto px-6 lg:px-8 py-24 text-center">
        <CheckCircle size={48} className="mx-auto text-green-600 mb-6" />
        <h1 className="text-2xl font-semibold mb-2">Message envoyé !</h1>
        <p className="text-muted-foreground">
          Nous vous répondrons sous 24h à l'adresse <strong>{email}</strong>.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-6 lg:px-8 py-16">
      <h1 className="text-3xl font-semibold mb-2">Contact</h1>
      <p className="text-muted-foreground mb-10">Une question ? Nous vous répondons sous 24h.</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-sm font-medium block mb-1.5">Nom *</label>
          <input type="text" required value={nom} onChange={(e) => setNom(e.target.value)} placeholder="Votre nom complet"
            className="w-full border border-input rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>
        <div>
          <label className="text-sm font-medium block mb-1.5">Email *</label>
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="votre@email.com"
            className="w-full border border-input rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>
        <div>
          <label className="text-sm font-medium block mb-1.5">Téléphone</label>
          <input type="tel" value={telephone} onChange={(e) => setTelephone(e.target.value)} placeholder="0555 000 000"
            className="w-full border border-input rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>
        <div>
          <label className="text-sm font-medium block mb-1.5">Message *</label>
          <textarea rows={5} required value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Votre message…"
            className="w-full border border-input rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <button type="submit" disabled={loading}
          className="w-full bg-foreground text-background rounded-xl py-3 text-sm font-medium hover:bg-foreground/80 transition-colors disabled:opacity-50">
          {loading ? "Envoi en cours…" : "Envoyer le message"}
        </button>
      </form>
    </div>
  );
}
