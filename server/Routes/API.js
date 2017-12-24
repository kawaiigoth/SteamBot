var express = require('express'),
    loger = require('../libs/loger')(module),
    bodyParser = require('body-parser'),
    path = require('path'),
    BL = require('../BL'),
    router = express.Router(),
    bl = new BL();


router.use(bodyParser.urlencoded({
    extended: true
}));
router.use(bodyParser.json());






module.exports = router;