// file to hold queries for feeds table
import { db } from '..';
import {feeds, users} from '../../schema';
import { eq, sql } from 'drizzle-orm';

export async function createFeed(name: string, url: string, userId: string) {
    const [newFeed] = await db
        .insert(feeds)
        .values({
            name,
            url,
            userId
        })
        .returning();

    return newFeed;
}

/**
 * This query joins the feeds table with the users table
 * to get the username of the person who created the feed.
 */
export async function getAllFeeds() {
  const allFeeds = await db
    .select({
      id: feeds.id,
      name: feeds.name,
      url: feeds.url,
      // Get the name from the 'users' table and rename it
      addedBy: users.name, 
    })
    .from(feeds)
    .leftJoin(users, eq(feeds.userId, users.id)); // <-- The JOIN

  return allFeeds;
}

// get feed by url
export async function getFeedByUrl(url: string) {
  const [feed] = await db
    .select()
    .from(feeds)
    .where(eq(feeds.url, url));

  return feed;
}

/**
 * Finds the next feed to be fetched.
 * Logic: Finds the feed with the oldest 'lastFetchedAt' time.
 * Feeds that have NEVER been fetched (NULL) are fetched first.
 */
export async function getNextFeedToFetch() {
  // Drizzle's 'asc' operator has a 'nulls' property.
  // We can use this instead of raw SQL for a cleaner query.
  const [feed] = await db
    .select()
    .from(feeds)
    .orderBy(sql`${feeds.lastFetchedAt} ASC NULLS FIRST`) // <-- Key logic
    .limit(1);

  return feed;
}

/**
 * Marks a feed as fetched by updating its timestamps.
 */
export async function markFeedFetched(feedId: string) {
  const [feed] = await db
    .update(feeds)
    .set({
      lastFetchedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(feeds.id, feedId))
    .returning();

  return feed;
}