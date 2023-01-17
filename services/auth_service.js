const user = require("../models/user");
const role = require("../models/role");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("config");

async function register(email, password) {
  const candidate = await user.findOne({ email });
  const user_role = await role.findOne({ value: "user" });

  if (candidate) {
    return {
      status: 400,
      message: "user exists",
    };
  }

  const hashed_password = await bcrypt.hash(password, 12);
  const user = new user({
    email,
    password: hashed_password,
    roles: user_role.value,
  });
  await user.save();

  return {
    status: 200,
    message: "user created",
  };
}

async function login(email, password) {
  const user = await user.findOne({ email });

  if (!user) {
    return {
      status: 400,
      message: "user not found",
    };
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    return {
      status: 400,
      message: "Wrong password, please try again",
    };
  }

  if (user.roles != "ADMIN") {
    return {
      status: 400,
      message: "You have not perrmision",
    };
  }

  const token = jwt.sign(
    {
      userId: user.id,
      roles: user.roles,
    },
    config.get("jwtSecret"),
    { expiresIn: "1h" }
  );

  return {
    status: 200,
    token,
    userId: user.id,
  };
}

async function get_users() {
  // const userole =  new role();
  // const adminrole = new role({value: 'ADMIN'})

  // await userole.save();
  // await adminrole.save();
  return { message: "succesfully created" };
}

module.exports = {
  register,
  login,
  get_users,
};
