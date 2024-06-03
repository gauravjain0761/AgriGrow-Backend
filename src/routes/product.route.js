const express = require('express');
const router = express.Router();
const passport = require('passport');
require('./../../config/passport')(passport);
const controller = require('../controllers/product.controller');
// const productMiddleware = require( '../middlewares/product.middleware' );
const passportAuthentication = passport.authenticate('jwt', { session: false });
const { farmerRoleMiddleware, driverRoleMiddleware } = require('../../config/userRoleMiddleware');

router.post('/add-product/:id', /* productMiddleware.addProduct, */ passportAuthentication, farmerRoleMiddleware, controller.addProduct);

// router.post( '/product-addOns/:productId', passportAuthentication, farmerRoleMiddleware, controller.productAddOns );

router.patch('/update-product/:id', passportAuthentication, farmerRoleMiddleware, controller.updateProduct);

router.get('/get-all-products', passportAuthentication, farmerRoleMiddleware, controller.getAllProducts);

router.delete('/delete-product/:productId', passportAuthentication, farmerRoleMiddleware, controller.deleteProduct);

// ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

router.get('/getProductsListByCategory/:categoryId', passportAuthentication, controller.getProductsListByCategory);

router.get('/getAllProductsList', passportAuthentication, controller.getAllProductsList);

// router.get('/get-all-best-deal-products', passportAuthentication, controller.getAllBestDealProducts);

router.get('/get-product-details/:productId', passportAuthentication, controller.getProductDetails);

router.post('/search-product', passportAuthentication, controller.searchProduct);

router.get('/product-all-details/:productId', passportAuthentication, farmerRoleMiddleware, controller.productAllDetails);



module.exports = router;
