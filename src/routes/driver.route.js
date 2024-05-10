const express = require('express');
const router = express.Router();
const passport = require('passport');
require('./../../config/passport')(passport);
const controller = require('../controllers/driver.controller');
const passportAuthentication = passport.authenticate('jwt', { session: false });



router.post('/addDriver', passportAuthentication, controller.addDriver);

router.get('/allDriverList', passportAuthentication, controller.allDriverList);

router.get('/getDriverDetailsById/:driverId', passportAuthentication, controller.getDriverDetailsById);

router.post('/searchDriver', passportAuthentication, controller.searchDriver);

router.delete('/removeDriver/:driverId', passportAuthentication,  controller.removeDriver);


module.exports = router;
