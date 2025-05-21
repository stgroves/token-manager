import fs from 'fs';
import generateJwt from './js/generate-jwt.js';
import updateSecrets from './js/update-secrets.js';

const repos = fs.readFileSync(process.env.REPOS, 'utf-8')
    .split('\n') // Split by new line
    .map(repo => {
        const repoPath = repo.trim().split('/');

        return repoPath[repoPath.length - 1];
    }) // Remove whitespace
    .filter(repo => repo); // Remove empty lines

await updateSecrets(generateJwt(), repos);