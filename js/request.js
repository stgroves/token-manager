const MAX_RETRIES = 3; // Set retry count
const RETRY_DELAY_MS = 2000; // 2 seconds

export default async function (octokit, restQuery, queryObject, propertyName = null) {
    let attempt = 1;

    while (attempt <= MAX_RETRIES) {
        try {
            const response = await octokit.request(restQuery, queryObject);

            if (!propertyName)
                return response.data;

            return response.data[propertyName];
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