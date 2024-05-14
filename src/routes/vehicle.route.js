const express = require('express');
const router = express.Router();
const passport = require('passport');
require('./../../config/passport')(passport);
const controller = require('../controllers/vehicle.controller');
const passportAuthentication = passport.authenticate('jwt', { session: false });
const { ccRoleMiddleware } = require('../../config/userRoleMiddleware');



router.post('/addVehicle', passportAuthentication, ccRoleMiddleware, controller.addVehicle);

router.get('/allVehicleList', passportAuthentication, ccRoleMiddleware, controller.allVehicleList);

router.get('/getVehicleDetailsById/:vehicleId', passportAuthentication, ccRoleMiddleware, controller.getVehicleDetailsById);

router.patch('/updateVehicleDetails/:vehicleId', passportAuthentication, ccRoleMiddleware, controller.updateVehicleDetails);

router.post('/searchVehicle', passportAuthentication, ccRoleMiddleware, controller.searchVehicle);

router.delete('/removeVehicle/:vehicleId', passportAuthentication, ccRoleMiddleware, controller.removeVehicle);




module.exports = router;
