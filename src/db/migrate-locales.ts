/**
 * One-time migration: ensure every product has its locales persisted in product_locales.
 * Safe to run multiple times (uses onConflictDoNothing).
 */
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { productLocales } from "./schema";

const sql = postgres(process.env.DATABASE_URL!, { prepare: false });
const db = drizzle(sql);

await db.insert(productLocales).values([
  // hone — English only, never had a DB row
  { productId: "hone",  code: "en", label: "English", flag: "🇺🇸", sortOrder: 0 },
  // amfo — English only, never had a DB row
  { productId: "amfo",  code: "en", label: "English", flag: "🇺🇸", sortOrder: 0 },
  // lichta, tinysteps, fitfo already seeded — onConflictDoNothing keeps them intact
  { productId: "lichta",    code: "vi", label: "Tiếng Việt", flag: "🇻🇳", sortOrder: 0 },
  { productId: "lichta",    code: "en", label: "English",    flag: "🇺🇸", sortOrder: 1 },
  { productId: "tinysteps", code: "en", label: "English",    flag: "🇺🇸", sortOrder: 0 },
  { productId: "tinysteps", code: "vi", label: "Tiếng Việt", flag: "🇻🇳", sortOrder: 1 },
  { productId: "fitfo",     code: "en", label: "English",    flag: "🇺🇸", sortOrder: 0 },
]).onConflictDoNothing();

await sql.end();
console.log("Migration complete.");
