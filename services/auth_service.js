const { user, role } = require("@cubitrix/models");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("../config/default.json");

async function register(email, password, cur_role) {
  const candidate = await user.findOne({ email });
  let user_role = null;
  
  if (cur_role) {
    user_role = await role.findOne({ value: cur_role });
  }

  if (!user_role) {
    return {
      status: 400,
      message: "There is no such role",
    };
  }

  if (candidate) {
    return {
      status: 400,
      message: "User exists",
    };
  }

  const hashed_password = await bcrypt.hash(password, 12);

  const result = new user({
    email,
    password: hashed_password,
    roles: user_role.value,
  });

  await result.save();

  return {
    status: 200,
    message: "User created",
  };
}

async function login(email, password) {
  const candidate = await user.findOne({ email });

  if (!candidate) {
    return {
      status: 400,
      message: "User not found",
    };
  }

  const isMatch = await bcrypt.compare(password, candidate.password);

  if (!isMatch) {
    return {
      status: 400,
      message: "Wrong password, please try again",
    };
  }

  const token = jwt.sign(
    {
      userId: candidate.id,
      roles: candidate.roles,
    },
    config.jwtSecret,
    { expiresIn: "1h" }
  );

  return {
    status: 200,
    token,
    userId: candidate.id,
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
