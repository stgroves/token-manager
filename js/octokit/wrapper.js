import {Octokit} from 'octokit';
import sodium from 'libsodium-wrappers';

export default class OctokitWrapper {
    static #octokit;
    static #sodium;

    static async getAccessToken() {
        OctokitWrapper.#octokit = new Octokit();

        const CLIENT_ID = process.env.CLIENT_ID;
        const CLIENT_SECRET = process.env.CLIENT_SECRET;
        const REFRESH_TOKEN = process.env.REFRESH_TOKEN;
        const AUTH_CODE = process.env.AUTH_CODE;

        try {
            if (!REFRESH_TOKEN) {
                console.log('Creating initial OAuth token.');

                const response = await OctokitWrapper.request(
                    'POST https://github.com/login/oauth/access_token',
                    {
                        client_id: CLIENT_ID,
                        client_secret: CLIENT_SECRET,
                        code: AUTH_CODE,
                        headers: {Accept: 'application/json'}
                    }
                );

                return [response.access_token, response.refresh_token];
            }

            console.log('Refreshing OAuth token.');

            const response = await OctokitWrapper.request(
                "POST https://github.com/login/oauth/access_token",
                {
                    client_id: CLIENT_ID,
                    client_secret: CLIENT_SECRET,
                    refresh_token: REFRESH_TOKEN,
                    grant_type: "refresh_token",
                    headers: {accept: "application/json"}
                }
            );

            return [response.data.access_token, response.data.refresh_token];
        } catch (error) {
            console.error("Token refresh failed:", error.message);
        }
    }

    static authoriseOctokit(accessToken) {
        OctokitWrapper.#octokit = new Octokit({
            auth: accessToken
        });
    }

    /**
     *
     * @param {String} repoOwner
     * @param {String} repo
     * @param {OctokitWrapper~SecretData[]} secrets
     * @returns {Promise<void>}
     */
    static async updateSecrets(repoOwner, repo, secrets) {
        if (!OctokitWrapper.#sodium) {
            console.log('Preparing sodium');
            await sodium.ready;
            console.log('sodium ready');
            OctokitWrapper.#sodium = sodium;
        }

        const HEADER = {"X-GitHub-Api-Version": "2022-11-28"};

        console.log(repoOwner);
        console.log(repo);

        const publicKeyData = await OctokitWrapper.request(
            'GET /repos/{owner}/{repo}/actions/secrets/public-key',
            {
                owner: repoOwner,
                repo: repo,
                headers: HEADER
            }
        );

        console.log(`Attempting to store secrets for ${repo}.`);

        for (const secret of secrets) {
            await OctokitWrapper.request(
                'PUT /repos/{owner}/{repo}/actions/secrets/{secret_name}',
                {
                    owner: repoOwner,
                    repo: repo,
                    secret_name: secret.key,
                    encrypted_value: await OctokitWrapper.encrypt(sodium, publicKeyData.key, secret.value),
                    key_id: publicKeyData.key_id,
                    headers: HEADER
                }
            );
        }
    }

    static async request(restQuery, queryObject, propertyName = null) {
        const MAX_RETRIES = 3; // Set retry count
        const RETRY_DELAY_MS = 2000; // 2 seconds

        let attempt = 1;

        while (attempt <= MAX_RETRIES) {
            try {
                const response = await OctokitWrapper.#octokit.request(restQuery, queryObject);

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

    static encrypt(publicKey, token) {
        console.log(publicKey);
        const binaryKey = OctokitWrapper.#sodium.from_base64(
            publicKey,
            OctokitWrapper.#sodium.base64_variants.ORIGINAL
        );
        const binaryToken = OctokitWrapper.#sodium.from_string(token);

        const encrypted = OctokitWrapper.#sodium.crypto_box_seal(binaryToken, binaryKey);

        return Promise.resolve(
            OctokitWrapper.#sodium.to_base64(
                encrypted,
                OctokitWrapper.#sodium.base64_variants.ORIGINAL
            )
        );
    }
}
/**
 * @typedef {Object} OctokitWrapper~SecretData
 * @property {String} key
 * @property {String} value
 */