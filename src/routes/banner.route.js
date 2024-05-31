const express = require('express');
const router = express.Router();
const passport = require('passport');
require('./../../config/passport')(passport);
const controller = require('../controllers/banner.controller');



router.post('/addBanner', controller.addBanner);

router.get('/getAllBanners', controller.getAllBanners);



module.exports = router;
