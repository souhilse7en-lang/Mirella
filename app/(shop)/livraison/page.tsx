export default function LivraisonPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 lg:px-8 py-16">
      <h1 className="text-3xl font-semibold mb-8">Livraison & Retours</h1>
      <div className="space-y-8 text-sm text-muted-foreground leading-relaxed">
        <section>
          <h2 className="text-base font-medium text-foreground mb-2">Délais de livraison</h2>
          <p>Toutes les commandes sont préparées sous 24 à 48h ouvrées. Les délais de livraison varient selon la wilaya :</p>
          <ul className="mt-2 space-y-1 list-disc list-inside">
            <li>Alger, Blida, Boumerdès, Tipaza : <strong className="text-foreground">1 à 2 jours</strong></li>
            <li>Wilayas du Nord : <strong className="text-foreground">2 à 3 jours</strong></li>
            <li>Hauts Plateaux et Est/Ouest : <strong className="text-foreground">3 à 4 jours</strong></li>
            <li>Wilayas sahariennes : <strong className="text-foreground">4 à 8 jours</strong></li>
          </ul>
        </section>
        <section>
          <h2 className="text-base font-medium text-foreground mb-2">Frais de livraison</h2>
          <p>
            Les frais de livraison sont calculés automatiquement en fonction de votre wilaya et du mode de livraison choisi
            (livraison à domicile ou retrait Stop Desk). Les tarifs exacts sont affichés lors de la commande.
          </p>
        </section>
        <section>
          <h2 className="text-base font-medium text-foreground mb-2">Mode de paiement</h2>
          <p>
            Nous acceptons uniquement le <strong className="text-foreground">paiement à la livraison</strong> (espèces).
            Notre équipe vous contactera par téléphone pour confirmer votre commande avant l'envoi.
          </p>
        </section>
        <section>
          <h2 className="text-base font-medium text-foreground mb-2">Retours</h2>
          <p>Vous disposez de 30 jours à compter de la réception de votre commande pour retourner les articles non portés, étiquettes intactes. Contactez-nous pour organiser le retour.</p>
        </section>
      </div>
    </div>
  );
}
