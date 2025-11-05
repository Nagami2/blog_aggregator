// src/rss.ts
import { XMLParser } from 'fast-xml-parser';

// --- Types (from the lesson) ---

export type RSSItem = {
  title: string;
  link: string;
  description: string;
  pubDate: string;
};

export type RSSFeed = {
  channel: {
    title: string;
    link: string;
    description: string;
    item: RSSItem[];
  };
};

// --- The Fetch & Parse Function ---

export async function fetchFeed(feedURL: string): Promise<RSSFeed> {
  // 1. Fetch the data
  let response: Response;
  try {
    response = await fetch(feedURL, {
      method: 'GET',
      headers: {
        // We use our own user-agent
        'User-Agent': 'blog_aggregator/1.0',
      },
    });
  } catch (err) {
    throw new Error(`Failed to fetch: ${err}`);
  }
  
  if (!response.ok) {
    throw new Error(`Fetch failed with status ${response.status}`);
  }

  const xmlData = await response.text();

  // 2. Parse the XML
  const parser = new XMLParser();
  const parsedData = parser.parse(xmlData);

  // 3. Validate the channel field
  if (!parsedData.rss || !parsedData.rss.channel) {
    throw new Error('Invalid RSS feed: Missing channel');
  }
  const channel = parsedData.rss.channel;

  // 4. Extract metadata
  const title = channel.title;
  const link = channel.link;
  const description = channel.description;

  if (typeof title !== 'string' || typeof link !== 'string' || typeof description !== 'string') {
    throw new Error('Invalid RSS feed: Missing channel metadata');
  }
  
  // 5. Extract feed items
  let items: RSSItem[] = [];
  if (channel.item) {
    const rawItems = Array.isArray(channel.item) ? channel.item : [channel.item];
    
    for (const item of rawItems) {
      // 6. Validate each item and skip invalid ones
      if (
        typeof item.title === 'string' &&
        typeof item.link === 'string' &&
        typeof item.description === 'string' &&
        typeof item.pubDate === 'string'
      ) {
        items.push({
          title: item.title,
          link: item.link,
          description: item.description,
          pubDate: item.pubDate,
        });
      }
      // If an item is missing fields, we just skip it
    }
  }

  // 7. Assemble and return the result
  const feed: RSSFeed = {
    channel: {
      title,
      link,
      description,
      item: items,
    },
  };
  
  return feed;
}