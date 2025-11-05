// src/index.ts
import { setUser, readConfig } from './config';
import { createUser, getUserByName, deleteAllUsers, getAllUsers } from './db/queries/users';
import postgres from 'postgres'; // We need this to check for specific DB errors
import { fetchFeed } from './rss';

// --- 1. Command System Types ---

/**
 * CommandHandler now returns a Promise, so it can be async
 */
type CommandHandler = (cmdName: string, ...args: string[]) => Promise<void>; // <-- CHANGED

type CommandsRegistry = Record<string, CommandHandler>;

// --- 3. Command System Functions ---

function registerCommand(
  registry: CommandsRegistry,
  cmdName: string,
  handler: CommandHandler
) {
  registry[cmdName] = handler;
}

/**
 * runCommand is now async
 */
async function runCommand( // <-- CHANGED
  registry: CommandsRegistry,
  cmdName: string,
  ...args: string[]
) {
  const handler = registry[cmdName];
  if (!handler) {
    throw new Error(`Unknown command: ${cmdName}`);
  }
  
  // We await the handler, since it's now async
  await handler(cmdName, ...args); // <-- CHANGED
}

// --- 2. Command Handlers ---

/**
 * handlerLogin is now async and checks the DB
 */
async function handlerLogin(cmdName: string, ...args: string[]) { // <-- CHANGED
  // 1. Validate arguments
  if (args.length === 0) {
    throw new Error('Usage: login <username>');
  }
  if (args.length > 1) {
    throw new Error('Usage: login <username> (too many arguments)');
  }
  const username = args[0];

  // 2. Check if user exists in DB
  const user = await getUserByName(username);
  if (!user) {
    throw new Error(`User "${username}" not found. Please register first.`);
  }

  // 3. Set user in config and log success
  setUser(username);
  console.log(`Successfully logged in as: ${username}`);
}

/**
 * handlerRegister is the new command
 */
async function handlerRegister(cmdName: string, ...args: string[]) {
  // 1. Validate arguments
  if (args.length === 0) {
    throw new Error('Usage: register <username>');
  }
  if (args.length > 1) {
    throw new Error('Usage: register <username> (too many arguments)');
  }
  const username = args[0];

  try {
    // 2. Try to create the user
    const newUser = await createUser(username);
    
    // 3. If successful, set as current user
    setUser(username);
    
    console.log(`Successfully registered and logged in as: ${username}`);
    console.log('New user data:', newUser);

  } catch (err) {
    // 4. Handle errors (like "user already exists")
    if (err instanceof postgres.PostgresError && err.code === '23505') {
      // 23505 is the "unique_violation" error code
      throw new Error(`User "${username}" already exists. Try logging in.`);
    }
    // Re-throw other unexpected errors
    throw err;
  }
}

/**
 * handlerReset is the new command
 */
async function handlerReset(cmdName: string, ...args: string[]) {
  // 1. Validate arguments (should be none)
  if (args.length > 0) {
    throw new Error('Usage: reset (takes no arguments)');
  }

  try {
    // 2. Call the delete query
    await deleteAllUsers();

    // 3. Log success
    console.log('Database has been reset successfully.');

  } catch (err) {
    // 4. Handle errors
    console.error('Failed to reset database.');
    throw err; // Re-throw to be caught by main
  }
}


/**
 * handlerListUsers is the new command
 */
async function handlerListUsers(cmdName: string, ...args: string[]) {
  // 1. Validate arguments (should be none)
  if (args.length > 0) {
    throw new Error('Usage: users (takes no arguments)');
  }

  try {
    // 2. Get the current user from the config file
    const config = readConfig();
    const currentUserName = config.currentUserName;

    // 3. Get all users from the database
    const allUsers = await getAllUsers();

    if (allUsers.length === 0) {
      console.log('No users found.');
      return;
    }

    // 4. Loop, check, and print
    console.log('Users:');
    for (const user of allUsers) {
      if (user.name === currentUserName) {
        console.log(`* ${user.name} (current)`);
      } else {
        console.log(`* ${user.name}`);
      }
    }

  } catch (err) {
    console.error('Failed to list users.');
    throw err; // Re-throw to be caught by main
  }
}

/**
 * handlerAgg is the new command
 */
async function handlerAgg(cmdName: string, ...args: string[]) {
  // 1. Validate arguments (should be none)
  if (args.length > 0) {
    throw new Error('Usage: agg (takes no arguments)');
  }

  // 2. Get the test feed URL from the assignment
  const feedURL = 'https://www.wagslane.dev/index.xml';

  console.log(`Fetching feed from ${feedURL}...`);

  try {
    // 3. Call your new fetch function
    const feed = await fetchFeed(feedURL);

    // 4. Print the entire object
    console.log('Feed fetched successfully:');
    console.log(JSON.stringify(feed, null, 2)); // Pretty-print the JSON

  } catch (err) {
    console.error('Failed to fetch feed.');
    throw err; // Re-throw to be caught by main
  }
}

// --- 5. Main Application Entry Point ---

/**
 * main is now async
 */
async function main() { // <-- CHANGED
  const registry: CommandsRegistry = {};
  
  // Register all our commands
  registerCommand(registry, 'login', handlerLogin);
  registerCommand(registry, 'register', handlerRegister);
  registerCommand(registry, 'reset', handlerReset);
  registerCommand(registry, 'users', handlerListUsers);
  registerCommand(registry, 'agg', handlerAgg);

  const args = process.argv.slice(2);

  try {
    if (args.length === 0) {
      throw new Error('No command provided. Usage: <command> [...args]');
    }

    const cmdName = args[0];
    const cmdArgs = args.slice(1);

    // Run and await the command
    await runCommand(registry, cmdName, ...cmdArgs); // <-- CHANGED

    // Exit with "success" code
    process.exit(0); // <-- NEW

  } catch (err) {
    if (err instanceof Error) {
      console.error(`Error: ${err.message}`);
    } else {
      console.error('An unknown error occurred.');
    }
    // Exit with "failure" code
    process.exit(1); 
  }
}

main();