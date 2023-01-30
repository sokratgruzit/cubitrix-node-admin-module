const { Router } = require("express");
const router = Router();

const config = require("../config/default.json");
const auth_middleware = require("../middlewares/auth_middlware");
const verify_roles = require('../middlewares/verify_roles');

router.get("/test", auth_middleware, verify_roles(config.roles[1]), (req, res) => {
  res.send("if you get this message , you are autorized");
});

module.exports = router;
