const express = require( 'express' );
const router = express.Router();
const passport = require( 'passport' );
require( './../../config/passport' )( passport );
const controller = require( '../controllers/product.controller' );
// const productMiddleware = require( '../middlewares/product.middleware' );
const passportAuthentication = passport.authenticate( 'jwt', { session: false } );
const { farmerRoleMiddleware } = require( '../../config/userRoleMiddleware' );

router.post( '/add-product/:id', /* productMiddleware.addProduct, */ passportAuthentication, farmerRoleMiddleware, controller.addProduct );

// router.post( '/product-addOns/:productId', passportAuthentication, farmerRoleMiddleware, controller.productAddOns );

router.post( '/update-product/:id', /* productMiddleware.addProduct, */ passportAuthentication, farmerRoleMiddleware, controller.updateProduct );

router.get( '/get-all-products', passportAuthentication, controller.getAllProducts );

router.get( '/get-all-best-deal-products', passportAuthentication, controller.getAllBestDealProducts );

router.get( '/get-product-details/:productId', passportAuthentication, controller.getProductDetails );

router.post( '/search-product', passportAuthentication, controller.searchProduct );

router.get( '/product-all-details/:productId', passportAuthentication, farmerRoleMiddleware, controller.productAllDetails );

router.delete( '/delete-product/:productId', passportAuthentication, farmerRoleMiddleware, controller.deleteProduct );


module.exports = router;
