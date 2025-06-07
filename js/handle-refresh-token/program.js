import {Octokit} from 'octokit';
import request from '../octokit/request.js';

export default async function () {
    const octokit = new Octokit();

    const CLIENT_ID = process.env.CLIENT_ID;
    const CLIENT_SECRET = process.env.CLIENT_SECRET;
    const REFRESH_TOKEN = process.env.REFRESH_TOKEN;
    const AUTH_CODE = process.env.AUTH_CODE;

    let accessToken;
    let refreshToken;

    try {
        if (!REFRESH_TOKEN) {
            console.log('Creating initial OAuth token.');

            const response = await request(
                octokit,
                'POST https://github.com/login/oauth/access_token',
                {
                    client_id: CLIENT_ID,
                    client_secret: CLIENT_SECRET,
                    code: AUTH_CODE,
                    headers: {Accept: 'application/json'}
                }
            );

            accessToken = response.access_token;
            refreshToken = response.refresh_token;
        } else {
            console.log('Refreshing OAuth token.');

            const response = await request(
                octokit,
                "POST https://github.com/login/oauth/access_token",
                {
                    client_id: CLIENT_ID,
                    client_secret: CLIENT_SECRET,
                    refresh_token: REFRESH_TOKEN,
                    grant_type: "refresh_token",
                    headers: {accept: "application/json"}
                }
            );

            accessToken = response.data.access_token;
            refreshToken = response.data.refresh_token;
        }


    } catch (error) {
        console.error("Token refresh failed:", error.message);
    }
}