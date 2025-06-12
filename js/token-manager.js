import OctokitWrapper from './octokit-wrapper.js';

export default class TokenManager {
    static #DAYS_BEFORE_EXPIRY = 5;
    static #EXPIRY_DAYS = 184;

    static #PATTERN = /^[\w.\-]+\/[\w.\-]+$/;

    static #CLIENT_ID = 'Iv23liaI5AFKuWHs41ny';

    static get now() {
        return Date.now() / 1000;
    }

    #repo;
    #owner;

    constructor() {
        [this.#owner, this.#repo] = process.env.GITHUB_REPOSITORY.split('/');
    }

    async setup() {
        console.log('Running Setup');

        try {
            const clientSecret = process.env.CLIENT_SECRET;
            const [_, refreshToken] = await OctokitWrapper.getAccessTokenFromCode(
                TokenManager.#CLIENT_ID,
                clientSecret,
                process.env.AUTH_CODE
            );
            const secretObj = {
                clientSecret,
                pem: process.env.PEM,
                installationID: process.env.INSTALL_ID,
                refreshToken,
                refreshTokenLastUpdated: TokenManager.now
            };
            const dataIndexObj = {
                maxPageCount: process.env.MAX_PAGES,
                maxPageSize: process.env.MAX_PAGE_SIZE,
                pages: []
            }

            await OctokitWrapper.updateSecrets(
                this.#owner,
                this.#repo,
                [
                    {key: 'SECRETS', value: JSON.stringify(secretObj)},
                    {key: 'DATA_INDEX', value: JSON.stringify(dataIndexObj)},
                ]
            );
        } catch (e) {
            console.error(e);
            process.exit(1);
        }
    }
}