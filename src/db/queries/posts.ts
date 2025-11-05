import { db } from '..';
import {posts, feedFollows} from '../../schema';
import { eq, desc, sql } from 'drizzle-orm';
import { Post } from '../../schema';

// type for the data we get from the RSS parser
type NewPost = {
    title: string;
    url: string;
    description: string;
    publishedAt: Date; //it's a Date object
    feedId: string;
};

/**
 * Creates a new post in the database.
 */
export async function createPost(postData: NewPost): Promise<Post> {
  const [newPost] = await db
    .insert(posts)
    .values(postData)
    .returning();
  
  return newPost;
}

/**
 * Gets the most recent posts for a given user.
 * This is the 3-table JOIN.
 */
export async function getPostsForUser(
  userId: string,
  limit: number
) {
  const userPosts = await db
    .select({
      title: posts.title,
      url: posts.url,
      description: posts.description,
      publishedAt: posts.publishedAt,
    })
    .from(posts)
    .innerJoin(feedFollows, eq(posts.feedId, feedFollows.feedId))
    .where(eq(feedFollows.userId, userId))
    .orderBy(desc(posts.publishedAt)) // <-- Newest first
    .limit(limit);
  
  return userPosts;
}