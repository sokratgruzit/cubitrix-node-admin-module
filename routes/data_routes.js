const { Router } = require("express");
const config = require("../config/default.json");
const router = Router();
const main_controller = require("../controllers/main_controller");
const verify_roles = require('../middlewares/verify_roles');

router.post("/delete-user", verify_roles(config.roles[0]), main_controller.delete_user);

router.post("/edit-user", verify_roles(config.roles[0]), main_controller.edit_user);

router.post("/filter", main_controller.handle_filter);

module.exports = router;
