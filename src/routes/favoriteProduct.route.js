const express = require( 'express' );
const router = express.Router();
const passport = require( 'passport' );
require( './../../config/passport' )( passport );
const controller = require( '../controllers/favoriteProduct.controller' );
const passportAuthentication = passport.authenticate( 'jwt', { session: false } );
const { userRoleMiddleware } = require( '../../config/userRoleMiddleware' );


router.post( '/add-to-favorite/:id', passportAuthentication, userRoleMiddleware, controller.addToFavorite );

router.get( '/get-all-favorite-product', passportAuthentication, userRoleMiddleware, controller.getAllFavoriteProduct );


module.exports = router;
