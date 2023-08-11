const { options } = require("@cubitrix/models");
const main_helper = require("../helpers/index");
const {
  referral,
  referral_controller,
} = require("@cubitrix/cubitrix-refferal-node-module");

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

async function testunicalc(req, res) {
  let { uni_days } = req.body;
  try {
    let daysBetween = getdaysBetween();

    const currentDate = new Date();
    const currentDay = currentDate.getDate();
    const currentDayOfWeek = currentDate.getDay();

    if (uni_days == "daily") {
      await referral_controller.uni_comission_count(1);
    } else if ((uni_days = "monthly")) {
      if (currentDay === 1) {
        await referral_controller.uni_comission_count(daysBetween);
      }
    } else if ((uni_days = "weekly")) {
      if (currentDayOfWeek === 1) {
        await referral_controller.uni_comission_count(7);
      }
    }
    return main_helper.success_response(res, "success");
  } catch (e) {
    return main_helper.error_response(res, e?.message || e.toString());
  }
}

async function testbinarycalc(req, res) {
  let { uni_days } = req.body;
  try {
    let daysBetween = getdaysBetween();

    const currentDate = new Date();
    const currentDay = currentDate.getDate();
    const currentDayOfWeek = currentDate.getDay();

    if (uni_days == "daily") {
      await referral_controller.binary_comission_count(1);
    } else if ((uni_days = "monthly")) {
      if (currentDay === 1) {
        await referral_controller.binary_comission_count(daysBetween);
      }
    } else if ((uni_days = "weekly")) {
      if (currentDayOfWeek === 1) {
        await referral_controller.binary_comission_count(7);
      }
    }
    return main_helper.success_response(res, "success");
  } catch (e) {
    return main_helper.error_response(res, e?.message || e.toString());
  }
}

async function getdaysBetween() {
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();

  const previousMonth = currentMonth === 1 ? 12 : currentMonth - 1;
  const previousYear = currentMonth === 1 ? currentYear - 1 : currentYear;

  const firstDayOfPreviousMonth = new Date(previousYear, previousMonth - 1, 1);
  const firstDayOfCurrentMonth = new Date(currentYear, currentMonth - 1, 1);

  const daysBetween = Math.round(
    (firstDayOfCurrentMonth - firstDayOfPreviousMonth) / (1000 * 60 * 60 * 24)
  );
  return daysBetween;
}

module.exports = {
  delete_referral_settings,
  edit_referral_setting,
  get_referral_setting,
  testunicalc,
  testbinarycalc,
};
