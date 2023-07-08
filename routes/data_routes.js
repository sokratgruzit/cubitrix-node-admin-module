const { Router } = require("express");
const config = require("../config/default.json");
const router = Router();
const main_controller = require("../controllers/main_controller");
const referral_settings = require("../controllers/referral_controller");
const verify_roles = require("../middlewares/verify_roles");

router.post(
  "/delete-user",
  verify_roles(config.roles[0]),
  main_controller.delete_user
);

router.post(
  "/edit-user",
  verify_roles(config.roles[0]),
  main_controller.edit_user
);

router.post("/filter", main_controller.handle_filter);
router.post(
  "/create_referral_settings",
  referral_settings.create_referral_settings
);
router.post(
  "/delete_referral_settings",
  referral_settings.delete_referral_settings
);

module.exports = router;
