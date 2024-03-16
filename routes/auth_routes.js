const { Router } = require("express");
const router = Router();

const config = require("../config/default.json");
const auth_controller = require("../controllers/auth_controller");
const verify_roles = require("../middlewares/verify_roles");
const {
  register_validator,
  login_validator,
} = require("../middlewares/validators/auth_validator");

router.post("/register", register_validator, verify_roles(config.roles[0]), auth_controller.register);

router.post("/login", login_validator, auth_controller.login);

router.post("/get_users", auth_controller.get_users);

module.exports = router;
