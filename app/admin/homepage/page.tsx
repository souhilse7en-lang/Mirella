import { createClient } from "@/lib/supabase/server";
import HomepageEditor from "./homepage-editor";

const DEFAULTS: Record<string, string> = {
  hero_eyebrow:  "Nouvelle collection · Rentrée 2026",
  hero_title_1:  "L'élégance",
  hero_title_2:  "au quotidien",
  hero_subtitle: "La mode qui vous révèle.",
};

export default async function HomepagePage() {
  const supabase = await createClient();
  const { data } = await supabase.from("site_content").select("key, value");

  const content: Record<string, string> = { ...DEFAULTS };
  if (data) data.forEach((row) => { content[row.key] = row.value; });

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold">Page d'accueil</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Modifie les textes affichés dans la section hero de la boutique.
        </p>
      </div>
      <HomepageEditor content={content} />
    </div>
  );
}
