import runSetup from './js/setup.js'
import runUpdateRefreshToken from './js/update-refresh-token.js'
import runRequestAccessToken from './js/request-access-token.js'

const PATH = process.env.EXECUTION_PATH;

switch (PATH) {
    case 'REFRESH':
        runUpdateRefreshToken();
        break;

    case 'SETUP':
        runSetup();
        break;

    case 'REQUEST':
        runRequestAccessToken();
        break;

    default:
        console.error(`${PATH} not recognised. Unable to run program.`);
        process.exit(1);
}