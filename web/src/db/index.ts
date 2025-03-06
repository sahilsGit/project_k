import { PostgresJsDatabase, drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@/db/schema";

const client = postgres(process.env.DATABASE_URL!);
const db: PostgresJsDatabase<typeof schema> = drizzle(client, { schema });

export { client, db };