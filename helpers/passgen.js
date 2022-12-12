const Dictionary = require('./dictionary/phraser');
const crypto = require('crypto');
const Exception = require('./Exception');

module.exports = async (hexSize = 8) => {
    try {
        const dict = Dictionary.getInstance();
        const randomWord = dict.pickWord();
        const randomHex = crypto.randomBytes(hexSize).toString('hex');
        return `${randomWord}-${randomHex}`;
    } catch (error) {
        throw new Exception('Error creating password.', 500);
    }
};
