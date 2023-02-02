const { Router } = require("express");
const router = Router();
const main_controller = require("../controllers/main_controller");

router.get("/test", (req, res) => {
  res.send("get some data");
});
router.post("/filter", main_controller.handle_filter);
module.exports = router;
