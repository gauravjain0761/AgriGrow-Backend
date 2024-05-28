const express = require('express');
const router = express.Router();
const passport = require('passport');
require('./../../config/passport')(passport);
const controller = require('../controllers/farmerOrder.controller');
const passportAuthentication = passport.authenticate('jwt', { session: false });
const { farmerRoleMiddleware } = require('../../config/userRoleMiddleware');


router.get('/farmerAllOrderList', passportAuthentication, farmerRoleMiddleware, controller.farmerAllOrderList);



module.exports = router;
