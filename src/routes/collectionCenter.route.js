const express = require('express');
const router = express.Router();
const passport = require('passport');
require('./../../config/passport')(passport);
const controller = require('../controllers/collectionCenter.controller');
const passportAuthentication = passport.authenticate('jwt', { session: false });
const { ccRoleMiddleware, farmerRoleMiddleware } = require('../../config/userRoleMiddleware');


router.post('/registerToCollectionCenter', passportAuthentication, controller.registerToCollectionCenter);

router.get('/getCollectionCenterData', passportAuthentication, ccRoleMiddleware, controller.getCollectionCenterData);

router.get('/getAllCollectionCenterList', passportAuthentication, farmerRoleMiddleware, controller.getAllCollectionCenterList);

router.patch('/updateCollectionCenterData', passportAuthentication, ccRoleMiddleware, controller.updateCollectionCenterData);

router.post('/logOut', passportAuthentication, ccRoleMiddleware, controller.logout);




module.exports = router;

