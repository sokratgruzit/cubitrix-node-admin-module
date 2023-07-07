const {
  accounts,
  transactions,
  account_meta,
  user,
} = require("@cubitrix/models");
const main_helper = require("../helpers/index");

const create_referral_settings = async (req, res) => {
  try {
    return main_helper.success_response(res, req.body);
  } catch (e) {
    console.log(e.message);
    return main_helper.error_response(res, "error");
  }
};

const delete_referral_settings = async (req, res) => {
  try {
    return main_helper.success_response(res, req.body);
  } catch (e) {
    console.log(e.message);
    return main_helper.error_response(res, "error");
  }
};

module.exports = {
  delete_referral_settings,
  create_referral_settings,
};
