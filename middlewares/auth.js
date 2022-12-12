const { verifySessionToken } = require('../helpers/tokenizer');
const Exception = require('../helpers/Exception');
const User = require('../models/User.model');

const separateCookie = (cookie) => {
    const cookieArr = cookie.split(';');
    const cookieObj = {};
    cookieArr.forEach((c) => {
        const [key, value] = c.split('=');
        cookieObj[key.trim()] = value;
    });
    return cookieObj;
};

exports.auth = async (req, res, next) => {
    try {
        const cookie =
            req.headers['set-cookie']?.length > 0
                ? separateCookie(req.headers['set-cookie'][0])
                : null;
        const token = req.cookies.session || cookie.session;

        if (!token) return next(new Exception('Session token invalid', 401));
        const user = verifySessionToken(token);

        if (!user) return next(new Exception('Session token invalid', 401));

        const dbUser = await User.findById(user.id);
        if (!dbUser.sessionToken[0] === token)
            return next(
                new Exception('Session expired. Please login again.', 401)
            );

        req.user = user;
        next();
    } catch (error) {
        return next(error);
    }
};
