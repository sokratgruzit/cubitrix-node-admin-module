const { Router } = require("express");
const router = Router();

const auth_middleware = require("../middlewares/auth_middlware");

router.get("/test", auth_middleware, (req, res) => {
  res.send("if you get this message , you are autorized");
});

module.exports = router;
