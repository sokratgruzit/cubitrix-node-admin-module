const { Router } = require("express");
const router = Router();

const config = require("../config/default.json");
const auth_middleware = require("../middlewares/auth_middlware");
const verify_roles = require("../middlewares/verify_roles");
const content_controller = require("../controllers/content_controller");

router.post(
  "/accept_deposit_request",
  auth_middleware,
  verify_roles(config.roles[0]),
  content_controller.accept_deposit_request,
);

module.exports = router;
