const express = require('express');
const router = express.Router();
const passport = require('passport');
require('./../../config/passport')(passport);
const controller = require('../controllers/banner.controller');



router.post('/addBanner', controller.addBanner);

router.get('/allBannerList', controller.allBannerList);



module.exports = router;
