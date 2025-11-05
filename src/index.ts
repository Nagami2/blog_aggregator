import { setUser, readConfig } from './config.js';


function main() {
    // 1. set the current user
    const myName = "Hema";
    setUser(myName);
    console.log(`Set current user to: ${myName}`);

    // 2. read the config back and print it
    const config = readConfig();
    console.log('Config read from file:');
    console.log(config);
}

main();
