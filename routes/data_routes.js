const { Router } = require("express");
const config = require("../config/default.json");
const router = Router();
const main_controller = require("../controllers/main_controller");
const referral_settings = require("../controllers/referral_controller");
const transaction_controller = require("../controllers/transaction_controller");
const verify_roles = require("../middlewares/verify_roles");

router.post(
  "/delete-user",
  verify_roles(config.roles[0]),
  main_controller.delete_user
);

router.post(
  "/edit-account",
  verify_roles(config.roles[0]),
  main_controller.edit_account
);

router.post(
  "/edit-user-meta",
  verify_roles(config.roles[0]),
  main_controller.edit_user_meta
);

router.post("/filter", main_controller.handle_filter);
router.post("/edit_referral_setting", referral_settings.edit_referral_setting);
router.post(
  "/delete_referral_settings",
  referral_settings.delete_referral_settings
);
router.post("/get_referral_setting", referral_settings.get_referral_setting);

router.post(
  "/testunicalc",
  verify_roles(config.roles[0]),
  referral_settings.testunicalc
);
router.post(
  "/testbinarycalc",
  verify_roles(config.roles[0]),
  referral_settings.testbinarycalc
);

// transactions
router.post(
  "/change_transaction_status",
  transaction_controller.change_transaction_status
);
router.post("/edit_transaction", transaction_controller.edit_transaction);

router.post("/total_data", main_controller.total_data);
router.post("/dashboard_accounts", main_controller.dashboard_accounts);

router.post("/edit_options_setting", main_controller.edit_options_settings);
router.post("/delete_main_controller", main_controller.delete_options_settings);
router.post("/get_options_setting", main_controller.get_options_setting);

module.exports = router;
