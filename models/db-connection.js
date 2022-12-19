const { Sequelize, QueryTypes } = require("sequelize");

const DB_NAME = process.env.DB_NAME;
const DB_USER = process.env.DB_USER;
const DB_PASSWORD = process.env.DB_PASSWORD;
const selectQueryConfig = { type: QueryTypes.SELECT };
const insertQueryConfig = { type: QueryTypes.INSERT };

const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
  host: process.env.DB_HOST,
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

module.exports.sequelize = sequelize;
module.exports.selectQueryConfig = selectQueryConfig;
module.exports.insertQueryConfig = insertQueryConfig;
