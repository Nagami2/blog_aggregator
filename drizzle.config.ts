// drizzle.config.ts
import { defineConfig } from "drizzle-kit";
import { readConfig } from "./src/config"; // Import your function

// Read the config from the file
const config = readConfig();

if (!config.dbUrl) {
  throw new Error("dbUrl is not set in config");
}

export default defineConfig({
  schema: "./src/schema.ts",        // Points to your schema file
  out: "./src/migrations",       // Where to save migration files
  dialect: "postgresql",          // Specify we're using Postgres
  dbCredentials: {
    url: config.dbUrl,            // Use the URL from your config!
  },
});