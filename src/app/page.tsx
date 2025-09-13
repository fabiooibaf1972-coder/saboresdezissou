import Header from "@/components/Header";
import ProductsOfTheDay from "@/components/ProductsOfTheDay";
import CustomProducts from "@/components/CustomProducts";
import FaleConosco from "@/components/FaleConosco";

export default function Home() {
  return (
    <main className="min-h-screen">
      <Header />
      <div className="container mx-auto px-4 py-8 space-y-12">
        <ProductsOfTheDay />
        <CustomProducts />
        <FaleConosco />
      </div>
    </main>
  );
}