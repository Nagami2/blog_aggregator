// file to hold queries for feeds table
import { db } from '..';
import {feeds, users} from '../../schema';
import { eq } from 'drizzle-orm';

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