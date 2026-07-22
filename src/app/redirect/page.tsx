import { redirect } from "next/navigation";
import { getSerializableProducts } from "@/db/queries";

export const dynamic = "force-dynamic";

export default async function RedirectPage() {
  const products = await getSerializableProducts();
  const first = products[0];
  if (!first) return <div>No products configured.</div>;
  redirect(`/${first.id}/screenshots`);
}
