import runHandleRefreshToken from './js/handle-refresh-token/program.js'
import runUpdateSecrets from './js/update-secrets/program.js'

const PATH = process.env.PATH;

switch (PATH) {
    case 'HANDLE_REFRESH_TOKEN':
        console.log('Running "Handle Refresh Token" program...');
        runHandleRefreshToken();
        break;

    case 'UPDATE_SECRETS':
        console.log('Running "Update Secrets" program...');
        runUpdateSecrets();
        break;

    default:
        console.error(`${PATH} not recognised. Unable to run program.`);
        process.exit(1);
}