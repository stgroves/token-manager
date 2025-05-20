const jwt = require('jsonwebtoken');

const APP_ID = '1301208'; // Replace with your GitHub App ID
const PRIVATE_KEY = process.env.PEM;

module.exports = function generateJWT() {
    const payload = {
        iat: Math.floor(Date.now() / 1000), // Issued at time
        exp: Math.floor(Date.now() / 1000) + 600, // Expires in 10 minutes
        iss: APP_ID // GitHub App ID
    };

    return jwt.sign(payload, PRIVATE_KEY, { algorithm: "RS256" });
}