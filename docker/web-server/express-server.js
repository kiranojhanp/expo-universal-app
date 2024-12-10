#!/usr/bin/env bun

const path = require("path");
const { createRequestHandler } = require("@expo/server/build/vendor/express");

const express = require("express");
const cors = require("cors");
const compression = require("compression");
const morgan = require("morgan");

const CLIENT_BUILD_DIR = path.join(process.cwd(), "dist/client");
const SERVER_BUILD_DIR = path.join(process.cwd(), "dist/server");

const app = express();
app.use(compression());

// http://expressjs.com/en/advanced/best-practice-security.html#at-a-minimum-disable-x-powered-by-header
app.disable("x-powered-by");
app.use(cors());

app.use(
  express.static(CLIENT_BUILD_DIR, {
    maxAge: "1h",
    extensions: ["html"],
  })
);

app.use(morgan("tiny"));

app.all(
  "*",
  createRequestHandler({
    build: SERVER_BUILD_DIR,
  })
);

const port = process.env.PORT || 8081;
app.listen(port, () => {
  console.log(`Express server listening on port ${port}`);
});
