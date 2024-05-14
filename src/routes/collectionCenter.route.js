const express = require('express');
const router = express.Router();
const passport = require('passport');
require('./../../config/passport')(passport);
const controller = require('../controllers/collectionCenter.controller');
const passportAuthentication = passport.authenticate('jwt', { session: false });


router.post('/registerToCollectionCenter', passportAuthentication, controller.registerToCollectionCenter);

router.get('/get', passportAuthentication, controller.get);

module.exports = router;

