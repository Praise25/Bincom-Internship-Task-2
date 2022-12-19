const { sequelize, selectQueryConfig } = require("../models/db-connection");

module.exports.getLgaList = async (req, res) => {
  const results = await sequelize.query("SELECT * FROM lga", selectQueryConfig);
  res.render("lga/list", { results });
};

module.exports.getLgaResult = (req, res) => {
  const { lga_id } = req.body;
  res.redirect(`/lga/${lga_id}/show-result`);
};

module.exports.showLgaResult = async (req, res) => {
  const { id } = req.params;
  let totalScore = 0;

  const polling_units = await sequelize.query(
    `SELECT * FROM polling_unit WHERE lga_id = ${id}`,
    selectQueryConfig
  );

  const lga = await sequelize.query(
    `SELECT * FROM lga WHERE lga_id = ${id}`,
    selectQueryConfig
  );

  for (let unit of polling_units) {
    const results = await sequelize.query(
      `SELECT * FROM announced_pu_results WHERE polling_unit_uniqueid = ${unit.uniqueid}`,
      selectQueryConfig
    );

    for (let result of results) {
      totalScore += result.party_score;
    }
  }

  const result_data = { ...lga[0], score: totalScore };
  res.render("lga/results", { result_data });
};
