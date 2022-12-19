const express = require("express");
const router = express.Router();
const lga = require("../controllers/lgas");

router.route("/result").get(lga.getLgaList).post(lga.getLgaResult);

router.get("/:id/show-result", lga.showLgaResult);

module.exports = router;
