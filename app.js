const express = require("express");
const jsonWebToken = require("jsonwebtoken");
const app = express();
app.use(express.json());
const {
  models: { User, Note },
} = require("./db");
const path = require("path");

const SECRET = process.env.SECRET || "SECRET";

app.get("/", (req, res) => res.sendFile(path.join(__dirname, "index.html")));

app.post("/api/auth", async (req, res, next) => {
  try {
    const { username, password } = req.body;

    const user = await User.authenticate(req.body);
    const jwtUser = await jsonWebToken.sign({ userId: user }, SECRET);
    res.send({ token: jwtUser });
  } catch (ex) {
    next(ex);
  }
});

app.get("/api/auth", async (req, res, next) => {
  try {
    const { userId } = await jsonWebToken.verify(
      req.headers.authorization,
      SECRET
    );
    const user = await User.byToken(userId);
    res.send(user);
  } catch (ex) {
    next(ex);
  }
});

app.get("/api/users/:id/notes", async (req, res, next) => {
  try {
    console.log(req.params);
    const { id } = req.params;
    res.send(
      await Note.findAll({
        where: {
          userId: id,
        },
      })
    );
  } catch (error) {
    next(error);
  }
});

app.use((err, req, res, next) => {
  console.log(err);
  res.status(err.status || 500).send({ error: err.message });
});

module.exports = app;
