import { PostgresJsDatabase, drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import * as schema from "./schema";

const initiateMigration = async () => {
  const client = postgres(process.env.DATABASE_URL!, { max: 1 });
  const db: PostgresJsDatabase<typeof schema> = drizzle(client);

  try {
    await migrate(db, { migrationsFolder: "./src/db/migrations" }); // Use absolute path from root here
    console.log("Migration Successful!");
  } catch (error: any) {
    console.log(error.message);
  } finally {
    await client.end();
  }
};

initiateMigration();
