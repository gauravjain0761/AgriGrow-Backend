const express = require( 'express' );
const router = express.Router();
const passport = require( 'passport' );
require( './../../config/passport' )( passport );
const controller = require( '../controllers/farmer.controller' );
const farmerMiddleware = require( '../middlewares/farmer.middleware' );
const passportAuthentication = passport.authenticate( 'jwt', { session: false } );
const { farmerRoleMiddleware } = require( '../../config/userRoleMiddleware' );



router.post( '/sign-up',/*  farmerMiddleware.farmerSignUp, */ controller.farmerSignUp );

router.post( '/login', farmerMiddleware.farmerLogin, controller.farmerLogin );

router.post( '/send-reset-password-otp', controller.sendResetPasswordOtp );

router.post( '/reset-password', controller.resetPassword );

router.post( '/login-with-mobileNumber', controller.loginWithMobileNumber );

router.post( '/verify-verification-code', controller.verifyVerificationCode );

router.post( '/signIn-with-google', controller.signInWithGoogle );

router.post( '/signIn-with-facebook', controller.signInWithFacebook );

router.get( '/get-profile', passportAuthentication, farmerRoleMiddleware, controller.getProfile );

router.patch( '/update-profile', passportAuthentication, farmerRoleMiddleware, controller.updateProfile );

router.patch( '/update-farm-details', passportAuthentication, farmerRoleMiddleware, controller.updateFarmDetails );

router.patch( '/add-certificates', passportAuthentication, farmerRoleMiddleware, controller.addCertificates );

// router.post( '/logOut', passportAuthentication, controller.farmerLogOut );




module.exports = router;
