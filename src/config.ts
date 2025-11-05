import fs from "fs";
import os from "os";
import path from "path";

// the name of our config file
const configFileName = ".blog_aggregatorconfig.json";

// --- Types ---
// This is the shape of the data in the JSON file (snake_case)
type RawConfig = {
    db_url: string;
    current_user_name?: string;
};

// This is the shape of our in-memory config object(camelCase)
export type Config = {
    dbUrl: string;
    currentUserName?: string;
};

// function to get the full path to the config file
function getConfigFilePath(): string {
    return path.join(os.homedir(), configFileName);
}

// function to validate raw JSON config and map it to our camelCase Config type
function validateConfig(rawConfig: any): Config {
    if (typeof rawConfig?.db_url !== 'string') {
        throw new Error('Config is missing "db_url"');
    }

    return {
        dbUrl: rawConfig.db_url,
        currentUserName: rawConfig.current_user_name
    };
}

// function to write in-memory (camelCase) config object back to the JSON file(snake_case)
function writeConfig(config: Config): void {
    const filePath = getConfigFilePath();
    
    // 1. map from camecase(app) to snake_case(json)
    const rawConfig: RawConfig = {
        db_url: config.dbUrl,
        current_user_name: config.currentUserName
    };

    // 2. stringify with pretty-printing (2-space indent)
    const data = JSON.stringify(rawConfig, null, 2);

    // 3. write to disk
    fs.writeFileSync(filePath, data);
}

// function to read the config file from disk, parses, and validates it
export function readConfig(): Config {
    const filePath = getConfigFilePath();
    let rawData: string;

    try{
        rawData = fs.readFileSync(filePath, 'utf-8');
    } catch (err) {
        throw new Error(`Config file not found at: ${filePath}`);
    }

    const rawConfig = JSON.parse(rawData);
    return validateConfig(rawConfig);
}

// reads the current config, sets the new user, and writes it back to disk
export function setUser(username: string): void {
    // 1. read the current config
    const config = readConfig();

    // 2. update the user
    config.currentUserName = username;
    
    // 3. write it back to disk
    writeConfig(config);
}
