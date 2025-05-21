import runHandleRefreshToken from './js/handle-refresh-token/program.js'
import runUpdateSecrets from './js/update-secrets/program.js'

const PATH = process.env.PATH;

switch (PATH) {
    case 'HANDLE_REFRESH_TOKEN':
        runHandleRefreshToken();
        break;

    case 'UPDATE_SECRETS':
        runUpdateSecrets();
        break;

    default:
        console.error(`${PATH} not recognised. Unable to run program.`);
        process.exit(1);
}