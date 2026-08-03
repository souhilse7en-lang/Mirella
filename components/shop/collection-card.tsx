import Link from "next/link";
import Image from "next/image";

interface Props {
  name: string;
  slug: string;
  image_url: string | null;
}

export default function CollectionCard({ name, slug, image_url }: Props) {
  return (
    <Link href={`/collections/${slug}`} className="group block overflow-hidden rounded-lg">
      <div className="relative aspect-[3/4] bg-muted overflow-hidden">
        {image_url ? (
          <Image
            src={image_url}
            alt={name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-muted">
            <span className="text-muted-foreground text-sm">{name}</span>
          </div>
        )}
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />
        <div className="absolute bottom-4 left-4">
          <p className="text-white font-medium text-lg tracking-wide">{name}</p>
        </div>
      </div>
    </Link>
  );
}
