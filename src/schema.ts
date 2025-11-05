// src/schema.ts
import { pgTable, timestamp, uuid, text, unique } from "drizzle-orm/pg-core";

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

// feeds table; add lastFetchedAt column
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
    lastFetchedAt: timestamp("last_fetched_at"), // it's nullable by default
});

//feed follows table
export const feedFollows = pgTable(
    "feed_follows",
    {
        id: uuid("id").primaryKey().defaultRandom().notNull(),
        createdAt: timestamp("created_at").notNull().defaultNow(),
        updatedAt: timestamp("updated_at")
            .notNull()
            .defaultNow()
            .$onUpdate(() => new Date()), // This updates the timestamp on change
        userId: uuid("user_id")
            .notNull()
            .references(() => users.id, { onDelete: "cascade" }), // Foreign key to users table
        feedId: uuid("feed_id")
            .notNull()
            .references(() => feeds.id, { onDelete: "cascade" }), // Foreign key to feeds table
    },

    // this function adds the unique constraint on the *pair* of userId and feedId
    // a user can't follw the same feed more than once'
    (table) => {
        return {
            uniqueUserFeed: unique().on(table.userId, table.feedId),
        };
    }
);

// add the posts table
export const posts = pgTable("posts", {
  id: uuid("id").primaryKey().defaultRandom().notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()), 
  title: text("title").notNull(),
  url: text("url").notNull().unique(),
  description: text("description"),
  // the rss feed gives a string, but we'll parse it to a Data
  // and store it as a timestamp
  publishedAt: timestamp("published_at").notNull(),
  feedId: uuid("feed_id")
    .notNull()
    .references(() => feeds.id, { onDelete: "cascade" }), // Foreign key to feeds table 
});

// Drizzle type helpers for TypeScript inference
export type User = typeof users.$inferSelect;
export type Feed = typeof feeds.$inferSelect;
export type Post = typeof posts.$inferSelect;