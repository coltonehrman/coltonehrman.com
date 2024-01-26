import dotenv from "dotenv";
dotenv.config();

import path from "path";
import http from "http";
import express from "express";
import bodyParser from "body-parser";
import email from "./src/email.js";

const app = express();

const blocklist = new Set(["176.111.174.153", "185.234.216.114"]);

app.set("trust proxy", true);

app.use((req, res, next) => {
  console.log("* ip: ", req.ip);
  console.log("* url: ", req.originalUrl);
  console.log(req.protocol, req.hostname, req.baseUrl, req.headers);
  next();
});

app.use(async (req, res, next) => {
  if (blocklist.has(req.ip)) {
    console.log("! Blocking IP: ", req.ip);
    return res.end();
  }

  next();
});

app.use(bodyParser.urlencoded({ extended: false }));

app.post("/mail", async (req, res) => {
  // const { name, phone, email, subject, message } = req.body;
  console.log("getting mail");
  console.log(req.body);

  try {
    const [toMe, toThem] = await email(req.body);
    console.log("Email was sent: ");
    console.log("To me: ", toMe);
    console.log("To them: ", toThem);
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
