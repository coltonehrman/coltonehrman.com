import dotenv from "dotenv";
dotenv.config();

import fs from "fs";
import path from "path";
import http from "http";
import https from "https";
import express from "express";
import bodyParser from "body-parser";
import { createClient } from "redis";
import email from "./src/email.js";

const redis = createClient({
  url: `redis://${process.env.REDIS_CACHE_CLUSTER_ENDPOINT}`,
  socket: {
    tls: true,
  },
});

redis.connect();

const app = express();

const blocklist = new Set(["::ffff:176.111.174.153"]);

app.use(async (req, res, next) => {
  await redis.setEx(req.ip, 1, {
    EX: 60,
  });

  await redis.incr(req.ip);

  console.log(await redis.get(req.ip));

  if (blocklist.has(req.ip)) {
    console.log("! Blocking IP: ", req.ip);
    return res.end();
  }

  next();
});

if (process.env.NODE_ENV === "production") {
  app.use((req, res, next) => {
    req.secure ? next() : res.redirect("https://" + req.headers.host + req.url);
  });
}

app.use(bodyParser.urlencoded({ extended: false }));

app.use((req, res, next) => {
  console.log("* ip: ", req.ip);
  console.log("* url: ", req.originalUrl);
  console.log(req.protocol, req.hostname, req.baseUrl, req.headers);
  next();
});

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
  app.use("/", express.static(process.env.PERSONAL_PORTFOLIO_DIR));
}

if (process.env.BUDGET_APP_DIR) {
  app.use(
    "/budget-app",
    express.static(path.join(process.env.BUDGET_APP_DIR, "dist"))
  );
}

if (process.env.BUDGET_APP_DIR) {
  app.use(
    "/budget-app",
    express.static(path.join(process.env.BUDGET_APP_DIR, "build"))
  );
}

let httpsServer;

if (process.env.HTTPS_PRIVATE_KEY && process.env.HTTPS_CERT) {
  const key = fs.readFileSync(process.env.HTTPS_PRIVATE_KEY, "utf8");
  const cert = fs.readFileSync(process.env.HTTPS_CERT, "utf8");

  httpsServer = https.createServer({ key, cert }, app);
}

const httpServer = http.createServer(app);

httpServer.listen(80);

if (httpsServer) {
  httpsServer.listen(443);
}
