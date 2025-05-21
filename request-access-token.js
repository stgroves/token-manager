import { Octokit } from '@octokit/core';
import generateJWT from './generate-jwt.js';
import fs from 'fs';

const INSTALLATION_ID = process.env.INSTALLATION_ID;
const MAX_RETRIES = 3; // Set retry count
const RETRY_DELAY_MS = 2000; // 2 seconds

// Read and format repo list
const repos = fs.readFileSync(process.env.REPOS, 'utf-8')
    .split('\n') // Split by new line
    .map(repo => {
        const repoPath = repo.trim().split('/');

        return repoPath[repoPath.length - 1];
    }) // Remove whitespace
    .filter(repo => repo); // Remove empty lines

async function getAccessToken() {
    let attempt = 1;
    while (attempt <= MAX_RETRIES) {
        try {
            const JWT = generateJWT();
            const octokit = new Octokit({ auth: JWT });

            const response = await octokit.request("POST /app/installations/{installation_id}/access_tokens", {
                installation_id: INSTALLATION_ID,
                repositories: repos,
                permissions: {
                    packages: 'write',
                    secrets: 'read'
                },
                headers: { "X-GitHub-Api-Version": "2022-11-28" }
            });

            console.log(response.data.token); //Acts as 'return'
            return response.data.access_token;
        } catch (error) {
            console.error(`Attempt ${attempt} failed:`, error.response ? error.response.data : error.message);

            if (attempt >= MAX_RETRIES) {
                console.error(`Failed after ${MAX_RETRIES} attempts. Exiting.`);
                process.exit(1);
            }

            console.log(`Retrying in ${RETRY_DELAY_MS / 1000} seconds...`);
            await new Promise((res) => setTimeout(res, RETRY_DELAY_MS));
            attempt++;
        }
    }
}

getAccessToken();