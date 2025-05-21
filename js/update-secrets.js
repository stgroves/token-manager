import {Octokit} from '@octokit/core';
import request from './request.js';
import _sodium from 'libsodium-wrappers';

export default async function (JWT, repos) {
    const octokit = new Octokit({auth: JWT});

    const HEADER = {"X-GitHub-Api-Version": "2022-11-28"};
    const OWNER = process.env.USER_ID;
    const KEY = process.env.SECRET_KEY;
    const INSTALL_ID = process.env.INSTALLATION_ID;

    if (!OWNER)
        throw new Error("Missing USER_ID.");

    if (!KEY)
        throw new Error("Missing SECRET_KEY.");

    if (!INSTALL_ID)
        throw new Error("Missing INSTALLATION_ID.");

    console.log(`Attempting to get access token.`);

    const accessToken = await request(
        octokit,
        'POST /app/installations/{installation_id}/access_tokens',
        {
            installation_id: INSTALL_ID,
            repositories: repos,
            permissions: {
                packages: 'write',
                secrets: 'read'
            },
            headers: HEADER
        },
        'access_token');

    await _sodium.ready;
    const sodium = _sodium;

    for (const repo of repos) {
        console.log(`Attempting to get public key data for ${repo}.`);

        const publicKeyData = await request(
            octokit,
            'GET /repos/{owner}/{repo}/actions/secrets/public-key',
            {
                owner: OWNER,
                repo: repo,
                headers: HEADER
            }
        );

        console.log(`Attempting to set new access token for ${repo}.`);

        await request(
            octokit,
            'PUT /repos/{owner}/{repo}/actions/secrets/{secret_name}',
            {
                owner: OWNER,
                repo: repo,
                secret_name: KEY,
                encrypted_value: await encrypt(sodium, publicKeyData.key, accessToken),
                key_id: publicKeyData.key_id,
                headers: HEADER
            }
        );
    }
}

function encrypt(sodium, key, token) {
    const binaryKey = sodium.from_base64(key, sodium.base64_variants.ORIGINAL);
    const binaryToken = sodium.from_string(token);

    const encrypted = sodium.crypto_box_seal(binaryToken, binaryKey);

    return Promise.resolve(sodium.to_base64(encrypted, sodium.base64_variants.ORIGINAL));
}