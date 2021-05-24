const Sequelize = require("sequelize");
const { STRING } = Sequelize;
const config = {
  logging: false,
};
const bcrypt = require('bcrypt')

if (process.env.LOGGING) {
  delete config.logging;
}
const conn = new Sequelize(
  process.env.DATABASE_URL || "postgres://localhost/acme_db",
  config
);

const User = conn.define("user", {
  username: STRING,
  password: STRING,
});

const Note = conn.define("note", {
  text: STRING,
})

User.beforeCreate(async (user) => {
  const hashedPassword = await bcrypt.hash(user.password, 10)
  user.password = hashedPassword
});

User.byToken = async (token) => {
  try {
    const user = await User.findByPk(token);
    if (user) {
      return user;
    }
    const error = Error("bad credentials");
    error.status = 401;
    throw error;
  } catch (ex) {
    const error = Error("bad credentials");
    error.status = 401;
    throw error;
  }
};

User.authenticate = async ({ username, password }) => {

  const user = await User.findOne({
    where: {
      username,
    },
  });
   const verifiedUser =  await bcrypt.compare(password, user.password)

  if (verifiedUser) {
    return user.id;
  }
  const error = Error("bad credentials");
  error.status = 401;
  throw error;
};

User.hasMany(Note)
Note.belongsTo(User)

const syncAndSeed = async () => {
  await conn.sync({ force: true });
  const credentials = [
    { username: "lucy", password: 'lucy_pw' },
    { username: "moe", password: "moe_pw" },
    { username: "larry", password: "larry_pw" },
  ];

  const notes = [
    {text: "hello how are you"},
    {text: "space"},
    {text: "random note"},
    {text: "silly"},

  ]

  const [one, two, three, four] = await Promise.all(
    notes.map((note) => Note.create(note))
  )

  const [lucy, moe, larry] = await Promise.all(
    credentials.map((credential) => User.create(credential))
  );

  lucy.addNote(one)
  lucy.addNote(two)
  moe.addNote(three)
  larry.addNote(four)

  return {
    users: {
      lucy,
      moe,
      larry,
    },
  };
};

module.exports = {
  syncAndSeed,
  models: {
    User,
  },
};
