const express = require("express");
const router = express.Router();
const pollingUnit = require("../controllers/polling-units");

router.get("/", pollingUnit.getPollingUnits);

router
  .route("/new")
  .get(pollingUnit.getNewPollingUnitForm)
  .post(pollingUnit.createNewPollingUnit);

router.get("/:id/result", pollingUnit.getPollingUnitResult);

module.exports = router;
