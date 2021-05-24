const express = require("express");
const jsonWebToken = require("jsonwebtoken");
const app = express();
app.use(express.json());
const {
  models: { User },
} = require("./db");
const path = require("path");

const SECRET = process.env.SECRET || "SECRET";

app.get("/", (req, res) => res.sendFile(path.join(__dirname, "index.html")));

app.post("/api/auth", async (req, res, next) => {
  try {
    const user = await User.authenticate(req.body);
    console.log("user!!!!!!!!!!!!!!!!!!", user);
    const jwtUser = await jsonWebToken.sign({ userId: user }, SECRET);
    console.log("jwt", jwtUser);
    res.send({ token: jwtUser });
  } catch (ex) {
    next(ex);
  }
});

app.get("/api/auth", async (req, res, next) => {
  try {
    const verified = await jsonWebToken.verify(
      req.headers.authorization,
      SECRET
    );
    console.log("headers", req.headers.authorization);
    res.send(await User.byToken(verified));
  } catch (ex) {
    next(ex);
  }
});

app.use((err, req, res, next) => {
  console.log(err);
  res.status(err.status || 500).send({ error: err.message });
});

module.exports = app;
