import {TokenManager} from './js/token-manager.js';
import {OctokitWrapper} from '@stgroves/octokit-wrapper';

const PATH = process.env.EXECUTION_PATH;
/**
 * @type {string}
 */
const CLIENT_ID = 'Iv23liaI5AFKuWHs41ny';
const APP_ID = '1301208';

/**
 *
 * @param {string} repoSource
 * @returns {Context}
 */
const createContext = async (repoSource) => {
    const [owner, repo] = repoSource.split('/');
    return {owner, repo, appID: APP_ID, sodium: await OctokitWrapper.getSodium()};
};
/**
 *
 * @param {Context} context
 * @param {string} pem
 * @param {number} installID
 * @param {string} clientSecret
 * @returns SetupContext
 */
const createSetupContext = (context, pem, installID, clientSecret) => {
    const getAppOctokit = OctokitWrapper.createAppOctokitProvider(context.appID, pem, installID);

    const clientID = CLIENT_ID;
    const getAccessTokenFromCode = OctokitWrapper.getAccessTokenFromCode;
    /**
     * @type {UpdateSecrets}
     */
    const updateSecrets = OctokitWrapper.updateSecrets;

    return {
        getAppOctokit,
        getAccessTokenFromCode,
        updateSecrets,
        clientID,
        installID,
        clientSecret,
        ...context
    };
};

/**
 *
 * @param {Context} context
 * @param {string} secretsJSON
 * @returns {Promise<SecretContext>}
 */
const contextFromSecrets = async (context, secretsJSON) => {
    const secrets = JSON.parse(secretsJSON);
    const getAppOctokit = OctokitWrapper.createAppOctokitProvider(secrets.appID, secrets.pem, secrets.installID);
    const octokitResult = await getAppOctokit();

    if (!octokitResult.success) {
        console.error(octokitResult.error);
        process.exit(1);
    }

    return {...context, ...secrets, octokit: octokitResult.data};
};

async function main() {
    switch (PATH) {
        case 'SETUP': {
            const context = createContext(
                process.env.GITHUB_REPOSITORY
            );

            const preparedPEM = TokenManager.preparePEM(process.env.PEM);
            const setupContext = createSetupContext(
                context,
                process.env.PEM,
                Number(process.env.INSTALL_ID),
                process.env.CLIENT_SECRET
            );

            await TokenManager.setup(
                setupContext,
                preparedPEM,
                process.env.AUTH_CODE
            );
            break;
        }
        case 'ADD_REPO': {
            const context = createContext(process.env.GITHUB_REPOSITORY);
            const secretContext = await contextFromSecrets(context, process.env.SECRETS);
            const [owner, repo] = process.env.REPO.split('/');

            const repoID = Number(await OctokitWrapper.getRepoID(secretContext.octokit, owner, repo));
            await TokenManager.createNewEntry(secretContext, repoID, process.env.CRITICAL === 'true');
            break;
        }

        default:
            console.error(`${PATH} not recognised. Unable to run program.`);
            process.exit(1);
    }
}

/**
 * @typedef {object} Context
 * @property {string} owner
 * @property {string} repo
 * @property {string} appID
 * @property {object} sodium
 */

/**
 * @typedef {Context & {
 *   getAccessTokenFromCode: function,
 *   updateSecrets: import('@stgroves/octokit-wrapper').UpdateSecrets,
 *   getAppOctokit: function,
 *   clientID: string,
 *   clientSecret: string,
 *   installID: number
 * }} SetupContext
 */

/**
 * @typedef {object} SecretObject
 * @property {string} pem
 * @property {string} clientSecret
 * @property {number} installationID
 * @property {string} refreshToken
 * @property {number} refreshTokenLastUpdated
 */

/**
 * @typedef {Context & SecretObject & {
 *     octokit: FullOctokit
 * }} SecretContext
 */