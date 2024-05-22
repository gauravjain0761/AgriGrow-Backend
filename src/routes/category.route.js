const express = require('express');
const router = express.Router();
const passport = require('passport');
require('./../../config/passport')(passport);
const controller = require('../controllers/category.controller');
const categoryMiddleware = require('../middlewares/category.middleware');
const passportAuthentication = passport.authenticate('jwt', { session: false });
const { userRoleMiddleware } = require('../../config/userRoleMiddleware');



router.post('/add-category', /* categoryMiddleware.addCategory, */ controller.addCategory);

router.get('/get-all-category', passportAuthentication, userRoleMiddleware, controller.getAllCategory);


module.exports = router;
