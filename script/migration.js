/* eslint-disable no-console */
import { exec } from 'child_process';
import dotenvFlow from 'dotenv-flow';

dotenvFlow.config();

// Read Database URL from environment variables
const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
    console.error('Error: MongoDB URI is required. Set MONGO_URI in .env file.');
    process.exit(1);
}

// Command Line Arguments
const command = process.argv[2];
const migrationName = process.argv[3];

// Valid Migration Commands
const validCommands = ['create', 'up', 'down', 'list', 'prune'];
if (!validCommands.includes(command)) {
    console.error(`Invalid command: Command must be one of ${validCommands}`);
    process.exit(0);
}

const commandsWithoutMigrationNameRequired = ['list', 'prune'];
if (!commandsWithoutMigrationNameRequired.includes(command)) {
    if (!migrationName) {
        console.error('Migration name is required');
        process.exit(0);
    }
}

function runNpmScript() {
    return new Promise((resolve, reject) => {
        let execCommand = ``;

        if (commandsWithoutMigrationNameRequired.includes(command)) {
            execCommand = `migrate ${command} --uri "${DATABASE_URL}"`;
        } else {
            execCommand = `migrate ${command} ${migrationName} --uri "${DATABASE_URL}`;
        }

        const childProcess = exec(execCommand, (error, stdout) => {
            if (error) {
                reject(`Error running script: ${error}`);
            } else {
                resolve(stdout);
            }
        });

        childProcess.stderr.on('data', (data) => {
            console.error(data);
        });
    });
}

// Example usage:
runNpmScript()
    .then((output) => {
        console.info(output);
    })
    .catch((error) => {
        console.error('Error:', error);
    });
