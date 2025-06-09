import OctokitWrapper from './octokit-wrapper.js';

export default async function () {
    console.log('Running Refresh Token update');

    try {
        const [accessToken, refreshToken] = await OctokitWrapper.getAccessTokenFromRefreshToken();

        console.log('Access Token acquired');

        await OctokitWrapper.storeRefreshToken(accessToken, refreshToken);

        console.log('Refresh Token stored');
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}