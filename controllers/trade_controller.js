const { options } = require("@cubitrix/models");
const main_helper = require("../helpers/index");

const edit_trade_settings = async (req, res) => {
  try {
    let { name, key } = req.body;
    let referral_uni_data = await options.findOne({ key });
    if (referral_uni_data) {
      await options.findOneAndUpdate({ key }, { object_value: req.body });
    } else {
      await options.create({
        key,
        object_value: req.body,
      });
    }
    let return_data = await options.findOne({ key });

    return main_helper.success_response(res, return_data);
  } catch (e) {
    console.log(e.message);
    return main_helper.error_response(res, "error");
  }
};

const get_trade_setting = async (req, res) => {
  let { key } = req.body;
  let return_data = await options.findOne({ key });
  return main_helper.success_response(res, return_data);
};

const delete_trade_settings = async (req, res) => {
  try {
    return main_helper.success_response(res, req.body);
  } catch (e) {
    console.log(e.message);
    return main_helper.error_response(res, "error");
  }
};

module.exports = {
  delete_trade_settings,
  edit_trade_settings,
  get_trade_setting,
};
