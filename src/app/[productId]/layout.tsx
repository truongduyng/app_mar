import { notFound, redirect } from "next/navigation";
import { getSerializableProducts } from "@/db/queries";
import { ProductProvider } from "@/components/ProductContext";
import { AppShell } from "@/components/AppShell";

export const dynamic = "force-dynamic";

export default async function ProductLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ productId: string }>;
}) {
  const { productId } = await params;
  const products = await getSerializableProducts();

  if (products.length === 0) notFound();

  const product = products.find((p) => p.id === productId);
  if (!product) {
    // Unknown productId — redirect to the first product's screenshots
    redirect(`/${products[0].id}/screenshots`);
  }

  const initialLocale = product.locales?.[0]?.code ?? "en";

  return (
    <ProductProvider
      rawProducts={products}
      initialProductId={productId}
      initialLocale={initialLocale}
    >
      <AppShell>{children}</AppShell>
    </ProductProvider>
  );
}
