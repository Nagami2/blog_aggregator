// src/db/index.ts
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { readConfig } from '../config';

// Import all your schemas
// (Right now it's just 'users', but this scales well)
import * as schema from '../schema';

// Read the config
const config = readConfig();

if (!config.dbUrl) {
  throw new Error('Database URL is not set in config');
}

// Create the connection
const connection = postgres(config.dbUrl);

// Create the Drizzle instance and export it
export const db = drizzle(connection, { schema });