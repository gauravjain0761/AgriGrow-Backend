const express = require('express');
const router = express.Router();
const passport = require('passport');
require('./../../config/passport')(passport);
const controller = require('../controllers/vehicle.controller');
const passportAuthentication = passport.authenticate('jwt', { session: false });
const { farmerRoleMiddleware } = require('../../config/userRoleMiddleware');



router.post('/addVehicle', passportAuthentication, farmerRoleMiddleware, controller.addVehicle);

router.get('/allVehicleList', passportAuthentication, farmerRoleMiddleware, controller.allVehicleList);

router.get('/getVehicleDetailsById/:vehicleId', passportAuthentication, farmerRoleMiddleware, controller.getVehicleDetailsById);

router.post('/searchVehicle', passportAuthentication, farmerRoleMiddleware, controller.searchVehicle);

router.delete('/removeVehicle/:vehicleId', passportAuthentication, farmerRoleMiddleware, controller.removeVehicle);




module.exports = router;
