import { db } from '..';
import { feedFollows, feeds, users } from '../../schema';
import { eq, and } from 'drizzle-orm';

/**
 * Creates a new feed_follow record.
 * this first inserts, then selects with joins to get the user/feed names.
 */
export async function createFeedFollow(userId: string, feedId: string) {
  // 1. Insert the new follow
  const [newFollow] = await db
    .insert(feedFollows)
    .values({
      userId: userId,
      feedId: feedId,
    })
    .returning();

  // 2. Select the joined data to return
  const [result] = await db
    .select({
      followId: feedFollows.id,
      feedName: feeds.name,
      userName: users.name,
    })
    .from(feedFollows)
    .innerJoin(feeds, eq(feedFollows.feedId, feeds.id))
    .innerJoin(users, eq(feedFollows.userId, users.id))
    .where(eq(feedFollows.id, newFollow.id));

  return result;
}

/**
 * Gets all feeds a user is following.
 */
export async function getFeedFollowsForUser(userId: string) {
  const follows = await db
    .select({
      feedId: feeds.id,
      feedName: feeds.name,
      feedUrl: feeds.url,
    })
    .from(feedFollows)
    .innerJoin(feeds, eq(feedFollows.feedId, feeds.id))
    .where(eq(feedFollows.userId, userId));

  return follows;
}