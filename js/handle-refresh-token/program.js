import {Octokit} from 'octokit';
import request from 'js/octokit/request.js';

export default async function () {
    const octokit = new Octokit();

    const CLIENT_ID = process.env.CLIENT_ID;
    const CLIENT_SECRET = process.env.CLIENT_SECRET;
    const REFRESH_TOKEN = process.env.REFRESH_TOKEN;
    const AUTH_CODE = process.env.AUTH_CODE;

    try {
        if (!REFRESH_TOKEN) {
            console.log('Creating initial token.');

            const response = await request(
                octokit,
                'POST /login/oauth/access_token',
                {
                    client_id: CLIENT_ID,
                    client_secret: CLIENT_SECRET,
                    code: AUTH_CODE,
                    headers: {accept: 'application/json'}
                }
            );

            console.log(response);
        }

        console.log("Refreshing OAuth token...");
        const response = await octokit.request("POST /login/oauth/access_token", {
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
            refresh_token: REFRESH_TOKEN,
            grant_type: "refresh_token",
            headers: {accept: "application/json"}
        });

        const newAccessToken = response.data.access_token;
        const newRefreshToken = response.data.refresh_token;

        console.log("New OAuth token refreshed:", newAccessToken);
        console.log("New refresh token:", newRefreshToken);

        return {newAccessToken, newRefreshToken};
    } catch (error) {
        console.error("Token refresh failed:", error.message);
    }
}