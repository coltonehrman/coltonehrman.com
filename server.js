import dotenv from "dotenv";
dotenv.config();

import path from "path";
import http from "http";
import express from "express";
import bodyParser from "body-parser";
import email from "./src/email.js";

const app = express();

app.set("trust proxy", true);

app.use((req, _res, next) => {
  console.log("* ip: ", req.ip);
  console.log("* url: ", req.originalUrl);
  console.log(req.protocol, req.hostname, req.baseUrl, req.headers);

  next();
});

app.use(bodyParser.urlencoded({ extended: false }));

app.post("/mail", async (req, res) => {
  console.log("getting email");
  console.log(req.body);

  try {
    const result = await email(req.body);
    console.log("Email was sent: ");
    console.log("Result: ", result);
  } catch (e) {
    console.error("Something went wrong with sending email: ", e);
  }

  res.redirect("/");
});

if (process.env.PERSONAL_PORTFOLIO_DIR) {
  app.use(
    "/",
    express.static(process.env.PERSONAL_PORTFOLIO_DIR, {
      cacheControl: true,
      maxAge: 1000 * 60 * 60 * 5, // 5 minutes
    })
  );
}

if (process.env.BUDGET_APP_DIR) {
  app.use(
    "/budget-app",
    express.static(path.join(process.env.BUDGET_APP_DIR, "dist"), {
      cacheControl: true,
      maxAge: 1000 * 60 * 60 * 5, // 5 minutes
    })
  );
}

if (process.env.BUDGET_APP_DIR) {
  app.use(
    "/budget-app",
    express.static(path.join(process.env.BUDGET_APP_DIR, "build"), {
      cacheControl: true,
      maxAge: 1000 * 60 * 60 * 5, // 5 minutes
    })
  );
}

const httpServer = http.createServer(app);

httpServer.listen(80);
