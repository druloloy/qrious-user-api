if (process.env.NODE_ENV !== 'production') require('dotenv').config();

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const app = express();

const corsConfig = require('./cors.config');
const Dictionary = require('./helpers/dictionary/phraser');
const { shortdatems } = require('./helpers/shortdate/shortdate');

// connect to database
require('./db/connect').connect();

// initialize dictionary
new Dictionary();
// InitializePassport(passport); // auth logic

const PORT = process.env.PORT || 5000;
const version = process.env.API_VERSION || 1;

app.use(helmet());
app.use(cors(corsConfig));
app.use(
    cookieParser('sample', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
        maxAge: shortdatems('1m'),
    })
);

app.use(
    compression({
        strategy: 3,
        level: 8,
        memLevel: 8,
    })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
// api/[version]/[privilege: public|private]/
const properApiUri = `/api/v${version}`;

// student route
app.use(`${properApiUri}/user`, require('./routes/user.route'));

// files route
app.use(`${properApiUri}/files`, require('./routes/file.route'));

// error handler
app.use(require('./middlewares/errorHandler'));

const server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

/**
 * For handling unhandled rejections,
 * for additional security and debugging efficiency
 * @param {Error} err
 */
const rejectionHandler = (err) => {
    console.warn('Server timed out.');
    console.log(`ERROR LOG: ${err}`);
    /**Close the server if an error is unhandled. */
    server.close((_) => process.exit(1));
};

/**
 * For handling uncaught expection,
 * for additional security and debugging efficiency
 * @param {Error} err
 */
const exceptionHandler = (err) => {
    console.error('Unhandled exception.');
    console.error(err.stack);
};

process.on('uncaughtException', exceptionHandler);
process.on('unhandledRejection', rejectionHandler);
