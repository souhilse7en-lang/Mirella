const ITEMS = [
  "Livraison partout en Algérie",
  "Paiement à la livraison",
  "Retours gratuits sous 30 jours",
  "Nouvelles pièces chaque semaine",
];

export default function AnnouncementBar() {
  const doubled = [...ITEMS, ...ITEMS];
  return (
    <div className="overflow-hidden py-2.5" style={{ backgroundColor: "#C98A9B" }}>
      <div className="flex gap-12 animate-marquee whitespace-nowrap">
        {doubled.map((text, i) => (
          <span key={i} className="text-xs uppercase tracking-widest text-white">
            {text}
            <span className="mx-6 text-white/40">·</span>
          </span>
        ))}
      </div>
    </div>
  );
}
