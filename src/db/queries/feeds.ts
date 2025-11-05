// file to hold queries for feeds table
import { db } from '..';
import {feeds} from '../../schema';

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

