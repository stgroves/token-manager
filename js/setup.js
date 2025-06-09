import OctokitWrapper from './octokit-wrapper.js';

export default async function() {
    console.log('Running Setup');

    try {
        const [accessToken, refreshToken] = await OctokitWrapper.getAccessTokenFromCode();

        console.log('Access Token acquired');

        await OctokitWrapper.storeRefreshToken(accessToken, refreshToken);

        console.log('Refresh Token stored');
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}