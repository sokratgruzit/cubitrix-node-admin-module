const { Router } = require("express");
const config = require("../config/default.json");
const router = Router();
const auth_middleware = require("../middlewares/auth_middlware");
const main_controller = require("../controllers/main_controller");
const referral_settings = require("../controllers/referral_controller");
const transaction_controller = require("../controllers/transaction_controller");
const verify_roles = require("../middlewares/verify_roles");

router.post(
  "/delete-user",
  auth_middleware,
  verify_roles(config.roles[0]),
  main_controller.delete_user
);

router.post(
  "/edit-account",
  auth_middleware,
  verify_roles(config.roles[0]),
  main_controller.edit_account
);

router.post(
  "/edit-user-meta",
  auth_middleware,
  verify_roles(config.roles[0]),
  main_controller.edit_user_meta
);

router.post(
  "/edit-atar-price",
  auth_middleware,
  verify_roles(config.roles[0]),
  main_controller.edit_atar_price
);

router.post(
  "/edit-currency-stakes-apy",
  auth_middleware,
  verify_roles(config.roles[0]),
  main_controller.edit_currency_stakes_apy
);

router.post("/filter", auth_middleware, main_controller.handle_filter);

router.post(
  "/edit_referral_setting",
  auth_middleware,
  referral_settings.edit_referral_setting
);

router.post(
  "/delete_referral_settings",
  auth_middleware,
  referral_settings.delete_referral_settings
);

router.post(
  "/get_referral_setting",
  auth_middleware,
  referral_settings.get_referral_setting
);

router.post(
  "/get_global_data",
  auth_middleware,
  referral_settings.get_referral_global_data
);

router.post(
  "/testunicalc",
  auth_middleware,
  verify_roles(config.roles[0]),
  referral_settings.testunicalc
);

router.post(
  "/testbinarycalc",
  auth_middleware,
  verify_roles(config.roles[0]),
  referral_settings.testbinarycalc
);

router.post(
  "/change_transaction_status",
  auth_middleware,
  transaction_controller.change_transaction_status
);

router.post(
  "/edit_transaction",
  auth_middleware,
  transaction_controller.edit_transaction
);

router.post("/total_data", auth_middleware, main_controller.total_data);

router.post(
  "/dashboard_accounts",
  auth_middleware,
  main_controller.dashboard_accounts
);

router.post(
  "/edit_options_setting",
  auth_middleware,
  main_controller.edit_options_settings
);

router.post(
  "/delete_main_controller",
  auth_middleware,
  main_controller.delete_options_settings
);

router.post(
  "/get_options_setting",
  auth_middleware,
  main_controller.get_options_setting
);
router.post(
  "/add_transaction_fee",
  auth_middleware,
  transaction_controller.add_transaction_fee
);
router.post(
  "/edit_transaction_fee",
  auth_middleware,
  transaction_controller.edit_transaction_fee
);
router.post(
  "/delete_transaction_fee",
  auth_middleware,
  transaction_controller.delete_transaction_fee
);
router.post(
  "/get_all_transaction_fees",
  auth_middleware,
  transaction_controller.get_all_transaction_fees
);

module.exports = router;
