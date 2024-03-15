const express = require( 'express' );
const router = express.Router();
const passport = require( 'passport' );
require( './../../config/passport' )( passport );
const controller = require( '../controllers/cart.controller' );
const passportAuthentication = passport.authenticate( 'jwt', { session: false } );



router.post( '/add-product-to-cart', passportAuthentication, controller.addProductToCart );

router.get( '/get-all-cart-products', passportAuthentication, controller.getAllCartProducts );


module.exports = router;
