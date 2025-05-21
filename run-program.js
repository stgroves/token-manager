import fs from 'fs';
import updateSecrets from './js/update-secrets.js';
import {App} from 'octokit';

const APP_ID = 1301208;

const repos = fs.readFileSync(process.env.REPOS, 'utf-8')
    .split('\n') // Split by new line
    .map(repo => {
        const repoPath = repo.trim().split('/');

        return repoPath[repoPath.length - 1];
    }) // Remove whitespace
    .filter(repo => repo); // Remove empty lines

const app = new App({
    appId: APP_ID, // Replace with your GitHub App ID
    privateKey: process.env.PEM, // Replace with your private key
});

if (!app) {
    console.error(`Could not find app ${APP_ID}`);
    process.exit(1);
}

await updateSecrets(app, repos);