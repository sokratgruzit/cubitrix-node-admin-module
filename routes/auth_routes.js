const { Router } = require("express");
const router = Router();

const auth_controller = require("../controllers/auth_controller");
const {
  register_validator,
  login_validator,
} = require("../middlewares/validators/auth_validator");

//  /api/auth
router.post("/register", register_validator, auth_controller.register);

router.post("/login", login_validator, auth_controller.login);

router.post("/get_users", auth_controller.get_users);

module.exports = router;
