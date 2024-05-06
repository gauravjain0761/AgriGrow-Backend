const express = require( 'express' );
const router = express.Router();
const passport = require( 'passport' );
require( './../../config/passport' )( passport );
const controller = require( '../controllers/collectionCenter.controller' );
const passportAuthentication = passport.authenticate( 'jwt', { session: false } );
const { userRoleMiddleware } = require( '../../config/userRoleMiddleware' );


router.post( '/registerToCollectionCenter', passportAuthentication, controller.registerToCollectionCenter );


module.exports = router;










