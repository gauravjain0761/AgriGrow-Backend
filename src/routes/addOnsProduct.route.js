const express = require( 'express' );
const router = express.Router();
const passport = require( 'passport' );
require( './../../config/passport' )( passport );
const controller = require( '../controllers/addOnsProduct.controller' );
// const productMiddleware = require( '../middlewares/product.middleware' );
const passportAuthentication = passport.authenticate( 'jwt', { session: false } );
const { farmerRoleMiddleware } = require( '../../config/userRoleMiddleware' );


router.post( '/product-addOns/:productId', passportAuthentication, farmerRoleMiddleware, controller.productAddOns );

router.get( '/get-all-addOns-products/:productId', passportAuthentication, farmerRoleMiddleware, controller.getAllAddOnsProducts );


module.exports = router;
