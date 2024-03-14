const express = require( 'express' );
const router = express.Router();
const passport = require( 'passport' );
require( './../../config/passport' )( passport );
const controller = require( '../controllers/farmer.controller' );
const farmerMiddleware = require( '../middlewares/farmer.middleware' );
const passportAuthentication = passport.authenticate( 'jwt', { session: false } );



router.post( '/sign-up', farmerMiddleware.farmerSignUp, controller.farmerSignUp );

router.post( '/login', farmerMiddleware.farmerLogin, controller.farmerLogin );

// router.post( '/send-reset-password-otp', farmerMiddleware.sendResetPasswordOtp, controller.sendResetPasswordOtp );

// router.post( '/reset-password', farmerMiddleware.resetPassword, controller.resetPassword );

// router.post( '/login-with-mobileNumber', farmerMiddleware.loginWithMobileNumber, controller.loginWithMobileNumber );

// router.post( '/verify-verification-code', farmerMiddleware.verifyVerificationCode, controller.verifyVerificationCode );

// router.post( '/signIn-with-google', farmerMiddleware.signInWithGoogle, controller.signInWithGoogle );

// router.post( '/signIn-with-facebook', farmerMiddleware.signInWithFacebook, controller.signInWithFacebook );

// router.get( '/get-profile', passportAuthentication, controller.getProfile );

// router.patch( '/update-profile', passportAuthentication, farmerMiddleware.updateProfile, controller.updateProfile );

// router.post( '/logOut', passportAuthentication, controller.farmerLogOut );




module.exports = router;
