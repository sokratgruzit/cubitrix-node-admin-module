const { options } = require("@cubitrix/models");
const main_helper = require("../helpers/index");

const edit_referral_setting = async (req, res) => {
  try {
    let { name } = req.body;
    let key;
    if (name == "Uni") {
      key = "referral_uni_options";
    } else if (name == "Binary Bv") {
      key = "referral_binary_bv_options";
    }
    let referral_uni_data = await options.findOne({ key });
    if (referral_uni_data) {
      await options.findOneAndUpdate({ key }, { object_value: req.body });
    } else {
      await options.create({
        key,
        object_value: req.body,
      });
    }
    let return_data = await options.findOne({ key: "referral_uni_options" });

    return main_helper.success_response(res, return_data);
  } catch (e) {
    console.log(e.message);
    return main_helper.error_response(res, "error");
  }
};

const get_referral_setting = async (req, res) => {
  let { name } = req.body;
  let key;
  if (name == "Uni") {
    key = "referral_uni_options";
  } else if (name == "Binary Bv") {
    key = "referral_binary_bv_options";
  }
  let return_data = await options.findOne({ key });
  return main_helper.success_response(res, return_data);
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
  edit_referral_setting,
};
