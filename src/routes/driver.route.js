const express = require('express');
const router = express.Router();
const passport = require('passport');
require('./../../config/passport')(passport);
const controller = require('../controllers/driver.controller');
const passportAuthentication = passport.authenticate('jwt', { session: false });
const { ccRoleMiddleware, driverRoleMiddleware } = require('../../config/userRoleMiddleware');



router.post('/addDriver', passportAuthentication, ccRoleMiddleware, controller.addDriver);

router.get('/allDriverList', passportAuthentication, ccRoleMiddleware, controller.allDriverList);

router.get('/getDriverDetailsById/:driverId', passportAuthentication, controller.getDriverDetailsById);

router.post('/searchDriver', passportAuthentication, ccRoleMiddleware, controller.searchDriver);

router.patch('/updateDriverData/:driverId', passportAuthentication, ccRoleMiddleware, controller.updateDriverData);

router.patch('/updateDriverStatus/:driverId', passportAuthentication, ccRoleMiddleware, controller.updateDriverStatus);

router.delete('/removeDriver/:driverId', passportAuthentication, ccRoleMiddleware, controller.removeDriver);

router.get('/trackDriverLocation/:driverId', passportAuthentication, ccRoleMiddleware, controller.trackDriverLocation);


// ---------------------------------------------------------------------------------------


router.get('/driverAllOrderList', passportAuthentication, driverRoleMiddleware, controller.driverAllOrderList);

// router.post('/deliverOrder/:id', passportAuthentication, driverRoleMiddleware, controller.deliverOrder);

router.patch('/customerNotAvailable/:id', passportAuthentication, driverRoleMiddleware, controller.customerNotAvailable);

router.get('/deliveredOrderDetails/:id', passportAuthentication, driverRoleMiddleware, controller.deliveredOrderDetails);

router.patch('/addDriverLocation', passportAuthentication, driverRoleMiddleware, controller.addDriverLocation);




module.exports = router;
