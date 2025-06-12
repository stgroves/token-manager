import TokenManager from './js/token-manager.js';
import runUpdateRefreshToken from './js/update-refresh-token.js'
import runRequestAccessToken from './js/request-access-token.js'

const PATH = process.env.EXECUTION_PATH;

const tokenManager = new TokenManager();

switch (PATH) {
    case 'REFRESH':
        runUpdateRefreshToken();
        break;

    case 'SETUP':
        await tokenManager.setup();
        break;

    case 'REQUEST':
        runRequestAccessToken();
        break;

    default:
        console.error(`${PATH} not recognised. Unable to run program.`);
        process.exit(1);
}