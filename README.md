# Blog Aggregator 🐊

A command-line (CLI) and worker-based service for aggregating RSS feeds, built with TypeScript, PostgreSQL, and Drizzle.

This project is built in two parts:
1.  **The CLI:** A tool for users to register, log in, and manage their feed subscriptions.
2.  **The Worker:** A long-running service (`agg`) that continuously fetches feeds and saves new posts.

## 📋 Requirements

Before you begin, you will need:
* **[Node.js](https://nodejs.org/) v22.15.0+** (This project uses `.nvmrc` to manage the version. We recommend [nvm](https://github.com/nvm-sh/nvm)).
* **[Docker Desktop](https://www.docker.com/products/docker-desktop/)** to run the PostgreSQL database.

## 🛠️ Setup & Installation

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/your-username/blog_aggregator.git](https://github.com/your-username/blog_aggregator.git)
    cd blog_aggregator
    ```

2.  **Set the Node.js version:**
    ```bash
    nvm use
    ```

3.  **Install dependencies:**
    ```bash
    npm install
    ```

4.  **Start the database:**
    This command will start a PostgreSQL 16 container in the background.
    ```bash
    docker-compose up -d
    ```

5.  **Create your config file:**
    The app reads its configuration from a file in your home directory. Run this command to create it and add the *correct* database URL for the Docker container.
    ```bash
    echo '{ "db_url": "postgres://blog_user:blog_password@localhost:5432/blog_aggregator?sslmode=disable" }' > ~/.blog_aggregatorconfig.json
    ```

6.  **Run database migrations:**
    This will create all the necessary tables (`users`, `feeds`, `posts`, etc.).
    ```bash
    npm run migrate
    ```

You are now ready to use the app!

## 🖥️ Usage (Commands)

All commands are run via `npm run start --`.

### User Management
* **Register:** `npm run start register <username>`
* **Log in:** `npm run start login <username>`
* **List users:** `npm run start users`
* **Reset database:** `npm run start reset` (Deletes all users, feeds, and posts!)

### Feed Management
* **Add a feed:** `npm run start addfeed "<Feed Name>" "<feed-url>"` (You will automatically follow it)
* **List all feeds:** `npm run start feeds`
* **Follow a feed:** `npm run start follow "<feed-url>"`
* **Unfollow a feed:** `npm run start unfollow "<feed-url>"`
* **List your follows:** `npm run start following`

### Reading Posts
* **Browse posts:** `npm run start browse [limit]` (Shows latest posts from feeds you follow. `limit` defaults to 2.)
    * `npm run start browse`
    * `npm run start browse 10`

### Running the Worker
To start the backend worker that fetches posts, run `agg` with a duration (e.g., `1m` for 1 minute). This command will run forever until you stop it with `Ctrl+C`.

```bash
npm run start agg 1m
```