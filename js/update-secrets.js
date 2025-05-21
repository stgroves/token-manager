import {Octokit} from '@octokit/core';
import request from './request.js';
import _sodium from 'libsodium-wrappers';

export default async function (JWT, repos) {
    const octokit = new Octokit({auth: JWT});

    const HEADER = {"X-GitHub-Api-Version": "2022-11-28"};
    const OWNER = process.env.USER_ID;
    const KEY = process.env.SECRET_KEY;

    const accessToken = await request(
        octokit,
        'POST /app/installations/{installation_id}/access_tokens',
        {
            installation_id: process.env.INSTALLATION_ID,
            repositories: repos,
            permissions: {
                packages: 'write',
                secrets: 'read'
            },
            headers: HEADER
        },
        'access_token');

    for (const repo of repos) {
        const publicKey = await request(
            octokit,
            'GET /repos/{owner}/{repo}/actions/secrets/public-key',
            {
                owner: OWNER,
                repo: repo,
                headers: HEADER
            },
            'key_id'
        );

        await request(
            octokit,
            'PUT /repos/{owner}/{repo}/actions/secrets/{secret_name}',
            {
                owner: OWNER,
                repo: repo,
                secret_name: KEY,
                encrypted_value: encrypt(publicKey, accessToken),
                key_id: publicKey,
                headers: HEADER
            }
        );
    }
}

async function encrypt(key, token) {
    return (async() => {
        await _sodium.ready;
        const sodium = _sodium;

        const binaryKey = sodium.from_base64(key, sodium.base64_variants.ORIGINAL);
        const binaryToken = sodium.from_string(token);

        const encrypted = sodium.crypto_box_seal(binaryToken, binaryKey);

        return sodium.to_base64(encrypted, sodium.base64_variants.ORIGINAL);
    })();
}