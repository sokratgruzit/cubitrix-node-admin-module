const { Router } = require("express");
const router = Router();

const config = require("../config/default.json");
const auth_middleware = require("../middlewares/auth_middlware");
const verify_roles = require("../middlewares/verify_roles");
const content_controller = require("../controllers/content_controller");

router.get("/test", auth_middleware, verify_roles(config.roles[1]), (req, res) => {
  res.send("if you get this message , you are autorized");
});

router.post(
  "/accept_deposit_request",
  auth_middleware,
  verify_roles(config.roles[0]),
  content_controller.accept_deposit_request,
);

module.exports = router;
