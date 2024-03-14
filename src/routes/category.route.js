const express = require( 'express' );
const router = express.Router();
const passport = require( 'passport' );
require( './../../config/passport' )( passport );
const controller = require( '../controllers/category.controller' );
const categoryMiddleware = require( '../middlewares/category.middleware' );
const passportAuthentication = passport.authenticate( 'jwt', { session: false } );



router.post( '/add-category', categoryMiddleware.addCategory, passportAuthentication, controller.addCategory );

router.get( '/get-all-category', passportAuthentication, controller.getAllCategory );


module.exports = router;
