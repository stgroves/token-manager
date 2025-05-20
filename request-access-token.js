const axios = require('axios');
const generateJWT = require('./generate-jwt.js');

const INSTALLATION_ID = process.env.INSTALLATION_ID;
const MAX_RETRIES = 3; // Set retry count
const RETRY_DELAY_MS = 2000; // 2 seconds

async function getAccessToken() {
    let attempt = 1;
    while (attempt <= MAX_RETRIES) {
        try {
            const JWT = generateJWT();
            const response = await axios.post(
                `https://api.github.com/app/installations/${INSTALLATION_ID}/access_tokens`,
                {},
                {headers: {Authorization: `Bearer ${JWT}`, Accept: "application/vnd.github+json"}}
            );

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