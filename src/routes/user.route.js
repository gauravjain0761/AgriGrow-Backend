const express = require('express');
const router = express.Router();
const passport = require('passport');
require('./../../config/passport')(passport);
const controller = require('../controllers/user.controller');
const userMiddleware = require('../middlewares/user.middleware');
const passportAuthentication = passport.authenticate('jwt', { session: false });
const { userRoleMiddleware } = require('../../config/userRoleMiddleware');


router.post('/sign-up', userMiddleware.userSignUp, controller.userSignUp);

router.patch('/updateMobileNumber', controller.updateMobileNumber);

router.post('/login',/*  userMiddleware.userLogin, */ controller.userLogin);

router.post('/send-reset-password-otp', userMiddleware.sendResetPasswordOtp, controller.sendResetPasswordOtp);

router.post('/verifyResetPasswordOTP', controller.verifyResetPasswordOTP);

router.post('/reset-password', userMiddleware.resetPassword, controller.resetPassword);

router.post('/login-with-mobileNumber', userMiddleware.loginWithMobileNumber, controller.loginWithMobileNumber);

router.post('/verify-verification-code', userMiddleware.verifyVerificationCode, controller.verifyVerificationCode);

router.post('/signIn-with-google', userMiddleware.signInWithGoogle, controller.signInWithGoogle);

router.post('/signIn-with-facebook', userMiddleware.signInWithFacebook, controller.signInWithFacebook);

router.get('/get-profile', passportAuthentication, userRoleMiddleware, controller.getProfile);

router.patch('/update-profile', passportAuthentication, userRoleMiddleware, userMiddleware.updateProfile, controller.updateProfile);

router.patch('/addNewAddress', passportAuthentication, userRoleMiddleware, controller.addNewAddress);

router.get('/getAllAddressList', passportAuthentication, userRoleMiddleware, controller.getAllAddressList);

router.patch('/editAddress/:deliveryAddressId', passportAuthentication, userRoleMiddleware, controller.editAddress);

router.delete('/deleteAddress/:deliveryAddressId', passportAuthentication, userRoleMiddleware, controller.deleteAddress);

router.post('/logOut', passportAuthentication, controller.userLogout);




module.exports = router;
