const express = require("express");
const router = express.Router();
const pollingUnit = require("../controllers/polling-units");

router.route("/").get(pollingUnit.getPollingUnits).post(pollingUnit.getPollingUnitResult);

router
  .route("/new")
  .get(pollingUnit.getNewPollingUnitForm)
  .post(pollingUnit.createNewPollingUnit);

router.get("/:id/result", pollingUnit.showPollingUnitResult);

module.exports = router;
