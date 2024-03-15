const express = require( 'express' );
const router = express.Router();
const passport = require( 'passport' );
require( './../../config/passport' )( passport );
const controller = require( '../controllers/product.controller' );
const productMiddleware = require( '../middlewares/product.middleware' );
const passportAuthentication = passport.authenticate( 'jwt', { session: false } );


router.post( '/add-product/:id', /* productMiddleware.addProduct, */ passportAuthentication, controller.addProduct );

router.get( '/get-all-product', passportAuthentication, controller.getAllProduct );

router.get( '/get-product-details/:id', passportAuthentication, controller.getProductDetails );

router.post( '/search-product', passportAuthentication, controller.searchProduct );


module.exports = router;
