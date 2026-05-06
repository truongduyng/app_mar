import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL!;

// Disable prefetch for Next.js serverless (connection pooling)
const client = postgres(connectionString, { prepare: false });

export const db = drizzle(client, { schema });
