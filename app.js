if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const path = require("path");
const morgan = require("morgan");
const ejsMate = require("ejs-mate");
const { Sequelize, QueryTypes } = require("sequelize");

const app = express();

const DB_NAME = "bincom_test";
const DB_USER = process.env.DB_USER;
const DB_PASSWORD = process.env.DB_PASSWORD;
const queryConfig = { type: QueryTypes.SELECT };

const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
  host: "localhost",
  dialect: "mysql",
});

const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log("Connection has been established successfully.");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
};

testConnection();

app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use(express.static(path.join(__dirname, "static")));

app.get("/", async (req, res) => {
  const results = await sequelize.query(
    "SELECT * FROM announced_pu_results",
    queryConfig
  );
  console.log(results);
  res.render("polling-units/index");
});

app.get("/polling-units", async (req, res) => {
  const [results, metadata] = await sequelize.query(
    "SELECT * FROM  polling_unit"
  );
  console.log(results);
  res.render("polling-units/units", { results });
});

app.get("/lga/result", async (req, res) => {
  const results = await sequelize.query("SELECT * FROM lga", queryConfig);
  res.render("lga/list", { results });
});

app.post("/lga/result", async (req, res) => {
  const { lga_id } = req.body;
  const polling_units = await sequelize.query(
    `SELECT * FROM polling_unit WHERE lga_id = ${lga_id}`,
    queryConfig
  );
  console.log(polling_units);
  res.redirect(`/lga/${lga_id}/show-result`);
});

app.get("/polling-units/new", (req, res) => {
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
});

app.post("/polling-units/new", async (req, res) => {
  const user = req.body.username;
  const date = req.body.date;
  const parties = req.body.results.parties;
  const votes = req.body.results.votes;

  const pollingUnits = await sequelize.query(
    "SELECT * FROM announced_pu_results",
    queryConfig
  );

  const lastPollingUnit = pollingUnits[pollingUnits.length - 1];

  let resultId = lastPollingUnit.result_id + 1;
  const pollingUnitUniqueId = parseInt(lastPollingUnit.polling_unit_uniqueid) + 1;

  for (let i = 0; i < parties.length; i++) {
    sqlQuery = `
      INSERT INTO announced_pu_results (result_id, polling_unit_uniqueid, party_abbreviation, party_score, entered_by_user, date_entered, user_ip_address)
      VALUES ("${resultId}", "${pollingUnitUniqueId}", "${parties[i]}", "${votes[i]}", "${user}", "${date}", "192.168.1.114")
      `;

    const results = await sequelize.query(sqlQuery, {
      type: QueryTypes.INSERT,
    });
    resultId++;
    // console.log(results);
  }

  res.redirect(`/polling-units/${pollingUnitUniqueId}/result`)
});

app.get("/polling-units/:id/result", async (req, res) => {
  const { id } = req.params;
  const results = await sequelize.query(
    `SELECT * FROM  announced_pu_results WHERE polling_unit_uniqueid = ${id}`,
    queryConfig
  );
  console.log(results);
  res.render("polling-units/results", { results });
});

app.get("/lga/:id/show-result", async (req, res) => {
  const { id } = req.params;
  let totalScore = 0;

  const polling_units = await sequelize.query(
    `SELECT * FROM polling_unit WHERE lga_id = ${id}`,
    queryConfig
  );

  const lga = await sequelize.query(
    `SELECT * FROM lga WHERE lga_id = ${id}`,
    queryConfig
  );

  for (let unit of polling_units) {
    const results = await sequelize.query(
      `SELECT * FROM announced_pu_results WHERE polling_unit_uniqueid = ${unit.uniqueid}`,
      queryConfig
    );
    for (let result of results) {
      totalScore += result.party_score;
    }
  }
  const result_data = { ...lga[0], score: totalScore };
  res.render("lga/results", { result_data });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Listening on port ${port}...`);
});
