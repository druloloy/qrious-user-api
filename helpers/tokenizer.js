const { sign, verify, decode } = require('jsonwebtoken');

const session_key = process.env.USER_SESSION_SECRET;
const expiration = '30d';
const options = {
    expiresIn: expiration,
    issuer: 'qrious-api',
    subject: 'qrious-session',
    audience: 'qrious-client',
};

const createSessionToken = (id, inst_id) => {
    const payload = {
        id,
        inst_id,
    };
    return sign(payload, session_key, options);
};
const verifySessionToken = (token) => {
    return verify(token, session_key, options);
};
const decodeSessionToken = (token) => {
    return decode(token, { complete: true, json: true });
};

module.exports = {
    createSessionToken,
    verifySessionToken,
    decodeSessionToken,
};
