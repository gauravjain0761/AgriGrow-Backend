const express = require('express');
const router = express.Router();
const passport = require('passport');
require('./../../config/passport')(passport);
const controller = require('../controllers/order.controller');
const passportAuthentication = passport.authenticate('jwt', { session: false });
const { ccRoleMiddleware, driverRoleMiddleware } = require('../../config/userRoleMiddleware');




router.post('/addOrder', passportAuthentication, ccRoleMiddleware, controller.addOrder);

router.get('/allOrderList', passportAuthentication, controller.allOrderList);

router.get('/statusNewOrderList', passportAuthentication, controller.statusNewOrderList);

router.post('/assignJobToDriver', passportAuthentication, ccRoleMiddleware, controller.assignJobToDriver);

router.get('/searchOrderByOrderId/:orderId', passportAuthentication, controller.searchOrderByOrderId);

router.get('/filterOrder', passportAuthentication, controller.filterOrder);





module.exports = router;
