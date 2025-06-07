import OctokitWrapper from '../octokit/wrapper.js';

export default async function () {
    const [accessToken, refreshToken] = await OctokitWrapper.getAccessToken();
    OctokitWrapper.authoriseOctokit(accessToken);

    const [owner, repo] = process.env.GITHUB_REPOSITORY.split('/');

    await OctokitWrapper.updateSecrets(
        owner,
        repo,
        [
            { key: 'REFRESH_TOKEN', value: refreshToken }
        ]
    );
}