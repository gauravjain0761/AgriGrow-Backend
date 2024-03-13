const express = require( 'express' );
const router = express.Router();
const controller = require( '../controllers/city.controller' );


router.get( '/get-city-list', controller.getCityList );

module.exports = router;
