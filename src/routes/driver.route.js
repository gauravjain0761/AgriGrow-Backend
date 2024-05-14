const express = require('express');
const router = express.Router();
const passport = require('passport');
require('./../../config/passport')(passport);
const controller = require('../controllers/driver.controller');
const passportAuthentication = passport.authenticate('jwt', { session: false });
const { ccRoleMiddleware, driverRoleMiddleware } = require('../../config/userRoleMiddleware');



router.post('/addDriver', passportAuthentication, ccRoleMiddleware, controller.addDriver);

router.get('/allDriverList', passportAuthentication, controller.allDriverList);

router.get('/getDriverDetailsById/:driverId', passportAuthentication, controller.getDriverDetailsById);

router.post('/searchDriver', passportAuthentication, controller.searchDriver);

router.delete('/removeDriver/:driverId', passportAuthentication, ccRoleMiddleware, controller.removeDriver);

router.get('/driverAllOrderList', passportAuthentication, driverRoleMiddleware, controller.driverAllOrderList);

// router.post('/deliverOrder/:id', passportAuthentication, driverRoleMiddleware, controller.deliverOrder);

router.post('/customerNotAvailable/:id', passportAuthentication, driverRoleMiddleware, controller.customerNotAvailable);

router.get('/orderDeliveredDetails/:id', passportAuthentication, driverRoleMiddleware, controller.orderDeliveredDetails);





module.exports = router;
