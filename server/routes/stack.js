const express = require('express')
const router = express.Router()

const { returnSettingFunc } = require('../controllers/settings');
const { returnHomeStack } = require('../controllers/home');
const { returnSocialList } = require('../controllers/social');

router.get("/settings", returnSettingFunc);
router.get("/home", returnHomeStack);
router.get("/social", returnSocialList);

module.exports = router
