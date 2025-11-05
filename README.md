# blog_aggregator
an RSS feed aggregator in TypeScript!


At its core, this project is not one application, but two distinct applications that share a single database.

The CLI (The "Frontend"): This is what the user interacts with. It's a command-line tool (like git or npm) that you'll build. Its job is to write commands to the database (like "add this feed" or "follow this feed") and read data from it ("show me the latest posts").

The Fetcher (The "Backend Worker"): This is a long-running, automated service. It has no user interface. Its only job is to periodically:

Read the list of all feeds from the database.

Fetch the content of each RSS feed (which is just an XML file).

Parse the XML, find any new posts, and save them to the database.

The PostgreSQL database is the central "meeting place" where these two services communicate. The CLI adds a feed URL, and the Worker later sees it, fetches it, and adds posts. The CLI user can then see the posts the worker added.