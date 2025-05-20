import { Octokit } from '@octokit/core';
import generateJWT from './generate-jwt.js';

const INSTALLATION_ID = process.env.INSTALLATION_ID;
const MAX_RETRIES = 3; // Set retry count
const RETRY_DELAY_MS = 2000; // 2 seconds

async function getAccessToken() {
    let attempt = 1;
    while (attempt <= MAX_RETRIES) {
        try {
            const JWT = generateJWT();
            const octokit = new Octokit({ auth: JWT });

            /*const installations = await octokit.request("GET /app/installations");
            const installationId = installations.data[0]?.id;

            if (!installationId)
                throw new Error("No valid installation found!");*/

            const response = await octokit.request("POST /app/installations/{INSTALLATION_ID}/access_tokens", {
                installation_id: INSTALLATION_ID,
                headers: { "X-GitHub-Api-Version": "2022-11-28" }
            });

            console.log(response.data.token); //Acts as 'return'
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