const { sequelize, selectQueryConfig, insertQueryConfig } = require("../models/db-connection");

module.exports.getPollingUnits = async (req, res) => {
  const results = await sequelize.query(
    "SELECT * FROM  polling_unit",
    selectQueryConfig
  );
  console.log(results);
  res.render("polling-units/units", { results });
};

module.exports.getNewPollingUnitForm = (req, res) => {
  const pollingUnits = [
    "PDP",
    "DPP",
    "ACN",
    "PPA",
    "CDC",
    "JP",
    "ANPP",
    "LABO",
    "CPP",
  ];
  res.render("polling-units/new", { pollingUnits });
};

module.exports.createNewPollingUnit = async (req, res) => {
  const user = req.body.username;
  const date = req.body.date;
  const parties = req.body.results.parties;
  const votes = req.body.results.votes;

  const pollingUnits = await sequelize.query(
    "SELECT * FROM announced_pu_results",
    selectQueryConfig
  );

  const lastPollingUnit = pollingUnits[pollingUnits.length - 1];

  let resultId = lastPollingUnit.result_id + 1;
  const pollingUnitUniqueId = parseInt(lastPollingUnit.polling_unit_uniqueid) + 1;

  for (let i = 0; i < parties.length; i++) {
    sqlQuery = `
      INSERT INTO announced_pu_results (result_id, polling_unit_uniqueid, party_abbreviation, party_score, entered_by_user, date_entered, user_ip_address)
      VALUES ("${resultId}", "${pollingUnitUniqueId}", "${parties[i]}", "${votes[i]}", "${user}", "${date}", "192.168.1.114")
      `;

    await sequelize.query(sqlQuery, insertQueryConfig);
    resultId++;
  }

  res.redirect(`/polling-units/${pollingUnitUniqueId}/result`);
};

module.exports.getPollingUnitResult = async (req, res) => {
  const { id } = req.params;
  const results = await sequelize.query(
    `SELECT * FROM  announced_pu_results WHERE polling_unit_uniqueid = ${id}`,
    selectQueryConfig
  );
  console.log(results);
  res.render("polling-units/results", { results });
};
