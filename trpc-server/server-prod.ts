#!/usr/bin/env node

import { createRequestHandler } from "@expo/server/adapter/express";
import path from "path";

import express from "express";
import compression from "compression";
import morgan from "morgan";

const CLIENT_BUILD_DIR = path.join(process.cwd(), "dist/client");
const SERVER_BUILD_DIR = path.join(process.cwd(), "dist/server");

const app = express();

app.use(compression());

// http://expressjs.com/en/advanced/best-practice-security.html#at-a-minimum-disable-x-powered-by-header
app.disable("x-powered-by");

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
