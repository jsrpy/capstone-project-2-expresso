const express = require("express");
const app = express();

const sqlite3 = require("sqlite3");
const db = new sqlite3.Database(
  process.env.TEST_DATABASE || "./database.sqlite"
);

const PORT = process.env.PORT || 4000;

const bodyParser = require("body-parser");
const morgan = require("morgan");
const cors = require("cors");
const errorhandler = require("errorhandler");

app.use(morgan("dev"));
app.use(bodyParser.json());
app.use(errorhandler());
app.use(cors());

const apiRouter = require("./api/api");
app.use('/api', apiRouter);

app.listen(PORT, () => {
  console.log(`Start listening at port: ${PORT}`);
});

module.exports = app;
