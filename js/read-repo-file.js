import fs from 'fs';

export default function () {
    return fs.readFileSync(process.env.REPOS, 'utf-8')
        .split('\n') // Split by new line
        .map(repo => repo.trim().split('/').pop()) // Get Repo names
        .filter(repo => repo); // Remove blank lines
}