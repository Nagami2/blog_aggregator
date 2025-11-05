import { read } from 'fs';
import { setUser, readConfig } from './config.js';

// 1. command system types
// a Commandhandler is a function that takes the command name and a veriable number of string args
type CommandHandler = (cmdName: string, ...args: string[]) => void;
// CommandRegistry maps command name to corresponding handler function. we use Record utility for this
type CommandsRegistry = Record<string, CommandHandler>;

// --- 3. Command system functions ---
// registers a new command by adding it to the registry
function registerCommand(
    registry: CommandsRegistry,
    cmdName: string,
    handler: CommandHandler
): void {
    registry[cmdName] = handler;
}

// looksup and runs a command from the registry
function runCommand(
    registry: CommandsRegistry,
    cmdName: string,
    args: string[]
): void {
    const handler = registry[cmdName];
    if (!handler) {
        throw new Error(`Unknown command: ${cmdName}`);
    }
    handler(cmdName, ...args);
}

// --- 2. the "login" command handler ---
// handles the "login" command by setting the user in config
function handlerLogin(cmdName: string, ...args: string[]): void {
    if (args.length < 1) {
        throw new Error(`Usage: ${cmdName} <username>`);
    }
    if (args.length > 1) {
        throw new Error(`Usage: ${cmdName} <username>`);
    }

    const username = args[0];
    setUser(username);
    console.log(`User set to "${username}"`);
}



function main() {
    // 6. create a new registry
    const registry: CommandsRegistry = {};

    // 7. register our "login" command
    registerCommand(registry, 'login', handlerLogin);

    // 8. get command-line arguments from node
    // process.argv = ['node', 'src/index.ts', 'login', 'alice']
    const args = process.argv.slice(2);
    try {   
            if (args.length === 0) {
                throw new Error('No command provided');
            }
            
            const cmdName = args[0];
            const cmdArgs = args.slice(1);

            // 9. run the command
            runCommand(registry, cmdName, cmdArgs);

        } catch (err) {
            if (err instanceof Error) {
                console.error(`Error: ${err.message}`);
            } else {
                console.error('Unknown error occurred');
            }
            process.exit(1);
    }
}

// run the main function
main();
