if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const path = require("path");
const morgan = require("morgan");
const ejsMate = require("ejs-mate");

const pollingUnitRoutes = require("./routes/polling-units")
const lgaRoutes = require("./routes/lga")

const app = express();

app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use(express.static(path.join(__dirname, "static")));

app.use("/polling-units", pollingUnitRoutes)
app.use("/lga", lgaRoutes)

app.get("/", async (req, res) => {
  res.render("index");
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Listening on port ${port}...`);
});
