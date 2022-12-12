const User = require('../models/User.model');
const Student = require('../models/Student.model');
const Exception = require('../helpers/Exception');
const passgen = require('../helpers/passgen');
const Dictionary = require('../helpers/dictionary/phraser');
const mailer = require('../mail/mailer');

exports.signup = async (req, res, next) => {
    try {
        const { inst_id, firstName, middleName, lastName, suffix, email } =
            req.body;

        const userExists = await User.findOne({ inst_id, email });
        if (userExists) {
            const password = await passgen(4);
            userExists.password = password;
            // create session token
            const token = await userExists.createSession();
            res.cookie('session', token);
            await userExists.save();

            const userObj = userExists.toObject();
            delete userObj.password;
            delete userObj.sessionToken;

            // send password to email
            return await mailer.sendUser_Password(
                { to: email, password },
                (err) => {
                    if (err) return next(err);
                    res.status(201).json({
                        message: 'User created successfully.',
                    });
                }
            );
        }

        // create password
        const password = await passgen(4);

        // create recovery phrase
        const recoveryPhrase = Dictionary.getInstance().getPhrase(12);

        // create new user
        const user = await User.create({
            inst_id,
            firstName,
            middleName,
            lastName,
            suffix,
            email,
            password,
            recovery_phrase: recoveryPhrase,
        });

        // create session token
        const token = await user.createSession();
        res.cookie('session', token);

        // save user
        await user.save();

        const userObj = user.toObject();
        delete userObj.password;
        delete userObj.sessionToken;

        // send password to email
        await mailer.sendUser_Password({ to: email, password }, (err) => {
            if (err) return next(err);
            res.status(201).json({
                message: 'User created successfully.',
                recovery_phrase: recoveryPhrase,
            });
        });
    } catch (error) {
        next(error);
    }
};

exports.login = async (req, res, next) => {
    try {
        const { inst_id, password } = req.body;
        if (!password)
            throw new Exception('Please provide all required fields.', 400);

        const user = await User.findOne({ inst_id });

        if (!user)
            return next(new Exception('The id or password is incorrect.', 400));

        const isMatch = await user.comparePassword(password);
        if (!isMatch)
            return next(new Exception('The id or password is incorrect.', 400));
        const token = await user.createSession();
        res.cookie('session', token);

        const userObj = user.toObject();
        delete userObj.recovery_phrase;
        delete userObj.sessionToken;

        res.status(200).json({
            message: `Welcome back, ${user.firstName}}!`,
            user: userObj,
        });
    } catch (error) {
        next(error);
    }
};

exports.logout = async (req, res, next) => {
    try {
        const { id } = req.user;
        const { session } = req.cookies;
        const user = await User.findById(id);
        if (!user) return next(new Exception('User not found.', 404));

        user.removeSession(session);
        await user.save();

        res.clearCookie('session');
        res.status(200).json({
            message: 'User logged out successfully.',
        });
    } catch (error) {
        next(error);
    }
};

exports.recover = async (req, res, next) => {
    try {
        const { recoveryPhrase } = req.body;
        const { id } = req.query;

        const user = await User.findOne({ inst_id: id });
        if (!user) return next(new Exception('User not found.', 404));

        const isMatch = Dictionary.comparePhrase(
            recoveryPhrase,
            user.recovery_phrase
        );
        if (!isMatch)
            return next(new Exception('Recovery phrase is incorrect.', 400));

        // create password
        const password = await passgen();
        user.password = password;
        // generate new recovery phrase
        const newRecoveryPhrase = Dictionary.getInstance().getPhrase(12);
        user.recovery_phrase = newRecoveryPhrase;
        await user.save();

        // send new password
        await mailer.sendUser_Password({ to: user.email, password }, (err) => {
            if (err) return next(err);
            res.status(200).json({
                message:
                    'Your password was sent to your email. Please save the new recovery phrase.',
                recovery_phrase: newRecoveryPhrase,
            });
        });
    } catch (error) {
        next(error);
    }
};

exports.me = async (req, res, next) => {
    try {
        console.log('working');
        const user = req.user;
        res.status(200).json({
            message: 'Login successful.',
            content: user,
        });
    } catch (error) {
        next(error);
    }
};
