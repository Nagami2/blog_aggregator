// src/schema.ts
import { pgTable, timestamp, uuid, text } from "drizzle-orm/pg-core";

// users table
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom().notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()), // This updates the timestamp on change
  name: text("name").notNull().unique(),
});

// feeds table
export const feeds = pgTable("feeds", {
    id: uuid("id").primaryKey().defaultRandom().notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
        .notNull()
        .defaultNow()
        .$onUpdate(() => new Date()), // This updates the timestamp on change
    name: text("name").notNull(),
    url: text("url").notNull().unique(),
    userId: uuid("user_id")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }), // Foreign key to users table
});

// Drizzle type helpers for TypeScript inference
export type User = typeof users.$inferSelect;
export type Feed = typeof feeds.$inferSelect;