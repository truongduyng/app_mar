import { getSerializableProducts } from "@/db/queries";
import { ScreenshotsPage } from "@/components/ScreenshotsPage";

export const dynamic = "force-dynamic";

export default async function Page() {
  const products = await getSerializableProducts();
  return <ScreenshotsPage rawProducts={products} />;
}
