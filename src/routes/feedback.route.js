const express = require( 'express' );
const router = express.Router();
const passport = require( 'passport' );
require( './../../config/passport' )( passport );
const controller = require( '../controllers/feedback.controller' );
// const feedbackMiddleware = require( '../middlewares/feedback.middleware' );
const passportAuthentication = passport.authenticate( 'jwt', { session: false } );
const { userRoleMiddleware } = require( '../../config/userRoleMiddleware' );


router.post( '/add-feedback/:productId', /* feedbackMiddleware.addFeedback, */ passportAuthentication, userRoleMiddleware, controller.addFeedback );

router.get( '/get-all-feedback', passportAuthentication, controller.getAllFeedback );


module.exports = router;
