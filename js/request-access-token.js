import OctokitWrapper from './octokit-wrapper.js';

export default async function () {
    console.log('Running Access Token request');

    try {
        const [accessToken, refreshToken] = await OctokitWrapper.getAccessTokenFromRefreshToken();

        console.log('Access Token acquired');

        await OctokitWrapper.storeRefreshToken(accessToken, refreshToken);

        console.log('Refresh Token stored');

        const fs = await import('fs');
        fs.appendFileSync(process.env.GITHUB_ENV, `ACCESS_TOKEN=${accessToken}\n`);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}