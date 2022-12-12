const { auth } = require('../middlewares/auth');
const {
    searchFile,
    getFile,
    viewFile,
} = require('../controllers/file.controller');
const router = require('express').Router();

router.use(auth);
router.get('/search', searchFile);
router.get('/:id', getFile);
router.get('/view', viewFile);

module.exports = router;
