const express = require('express');
const router = express.Router();
const passport = require('passport');
require('./../../config/passport')(passport);
const controller = require('../controllers/cart.controller');
const passportAuthentication = passport.authenticate('jwt', { session: false });
const { userRoleMiddleware } = require('../../config/userRoleMiddleware');


router.post('/add-product-to-cart', passportAuthentication, userRoleMiddleware, controller.addProductToCart);

router.get('/get-all-cart-products', passportAuthentication, userRoleMiddleware, controller.getAllCartProducts);

router.get('/getAllPlacedOrdersList', passportAuthentication, userRoleMiddleware, controller.getAllPlacedOrdersList);

router.post('/update-cart-product/:id', passportAuthentication, userRoleMiddleware, controller.updateCartProduct);

router.post('/remove-product-from-cart/:id', passportAuthentication, userRoleMiddleware, controller.removeProductFromCart);

router.post('/buyProduct', passportAuthentication, userRoleMiddleware, controller.buyProduct);


module.exports = router;










