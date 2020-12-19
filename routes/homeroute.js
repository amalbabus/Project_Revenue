const express = require("express");
const homecontroller = require("../controller/homepage");
const calcontroller = require("../controller/calculator");

const router = express.Router();

router.get("/", homecontroller.getHomePage);
router.post("/calculator", calcontroller.revCalculator);

module.exports = router;
