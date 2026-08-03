import { createClient } from "@/lib/supabase/server";
import UpdateMessageStatus from "./update-status";

const statusLabel: Record<string, string> = {
  non_lu:  "Non lu",
  lu:      "Lu",
  répondu: "Répondu",
};
const statusColor: Record<string, string> = {
  non_lu:  "bg-blue-100 text-blue-800",
  lu:      "bg-muted text-muted-foreground",
  répondu: "bg-green-100 text-green-800",
};

export default async function AdminMessagesPage() {
  const supabase = await createClient();
  const { data: messages } = await supabase
    .from("messages_contact")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-8">Messages de contact</h1>

      <div className="space-y-4">
        {messages && messages.length > 0 ? (
          messages.map((m) => (
            <div key={m.id} className="bg-background border border-border rounded-xl p-5">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <p className="font-medium">{m.nom}</p>
                  <p className="text-sm text-muted-foreground">{m.email}{m.telephone && ` · ${m.telephone}`}</p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${statusColor[m.statut] ?? "bg-muted text-muted-foreground"}`}>
                    {statusLabel[m.statut] ?? m.statut}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(m.created_at).toLocaleDateString("fr-FR")}
                  </span>
                </div>
              </div>
              <p className="text-sm leading-relaxed whitespace-pre-wrap border-t border-border pt-3">{m.message}</p>
              <div className="mt-3">
                <UpdateMessageStatus id={m.id} currentStatus={m.statut} />
              </div>
            </div>
          ))
        ) : (
          <p className="px-6 py-12 text-sm text-muted-foreground text-center bg-background border border-border rounded-xl">
            Aucun message pour le moment.
          </p>
        )}
      </div>
    </div>
  );
}
