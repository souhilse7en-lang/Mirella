import Navbar from "@/components/shop/navbar";
import Footer from "@/components/shop/footer";
import AnnouncementBar from "@/components/shop/announcement-bar";
import { CartProvider } from "@/lib/cart-context";

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <AnnouncementBar />
      <Navbar />
      <main className="min-h-screen">{children}</main>
      <Footer />
    </CartProvider>
  );
}
