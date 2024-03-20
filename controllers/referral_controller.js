const { 
  options,
  accounts,
  transactions,
  referral_uni_users,
  referral_binary_users,
  account_meta,
} = require("@cubitrix/models");
const main_helper = require("../helpers/index");
const {
  referral,
  referral_controller,
  rates,
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
    if (!uni_days) {
      uni_days = "daily";
    }
    let daysBetween = await getdaysBetween();

    const currentDate = new Date();
    const currentDay = currentDate.getDate();
    const currentDayOfWeek = currentDate.getDay();
    let result = null;

    if (uni_days == "daily") {
      result = await referral_controller.uni_comission_count(1);
    } else if (uni_days === "monthly") {
      result = await referral_controller.uni_comission_count(daysBetween);
    } else if (uni_days === "weekly") {
      result = await referral_controller.uni_comission_count(7);
    }
    console.log('uni-1', result)
    return main_helper.success_response(res, result);
  } catch (e) {
    return main_helper.error_response(res, e?.message || e.toString());
  }
}

async function testbinarycalc(req, res) {
  let { uni_days } = req.body;
  if (!uni_days) {
    uni_days = "daily";
  }
  try {
    let daysBetween = await getdaysBetween();

    const currentDate = new Date();
    const currentDay = currentDate.getDate();
    const currentDayOfWeek = currentDate.getDay();
    let result = null;
    
    if (uni_days == "daily") {
      result = await referral_controller.binary_comission_count(1);
    } else if (uni_days === "monthly") {
      result = await referral_controller.binary_comission_count(daysBetween);
    } else if (uni_days === "weekly") {
      result = await referral_controller.binary_comission_count(7);
    }
    
    return main_helper.success_response(res, result);
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
    (firstDayOfCurrentMonth - firstDayOfPreviousMonth) / (1000 * 60 * 60 * 24),
  );
  return daysBetween;
}

const get_referral_global_data = async (req, res) => {
  try {
    let { limit, page } = req.body;

    const skip = (page - 1) * limit;
    let days_between = await getdaysBetween();
    let global_data = [];

    let main_accounts = await accounts
    .find({ account_category: "main" })
    .skip(skip)
    .limit(limit);

    let total_pages = await accounts
    .find({ account_category: "main" })
    .count();

    for (let i = 0; i < main_accounts.length; i++) {
      let main_address = main_accounts[i].address;
      let owner = main_accounts[i].account_owner;
      let balance = main_accounts[i].balance;
      let total_staked = main_accounts[i].stakedTotal;
      let flush_out = main_accounts[i].flush_out;
      let binary_calc = await referral_controller.binary_comission_count_user(days_between, main_address);
      
      let meta = await account_meta.find({
        address: owner
      });
      
      let email = meta[0]?.email;
      
      let uni_users = await referral_uni_users.count({
        referral_address: main_address,
      });

      let binary_users = await referral_binary_users.count({
        referral_address: main_address,
      });

      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      let uni_comission_this_month = await transactions.aggregate([
        {
          $match: {
            to: main_address,
            tx_type: "bonus",
            "tx_options.type": "uni",
            createdAt: { $gte: startOfMonth },
          },
        },
        {
          $group: {
            _id: null,
            totalAmount: { $sum: "$amount" },
          },
        },
      ]);

      let uni_comission_total = await transactions.aggregate([
        {
          $match: {
            to: main_address,
            tx_type: "bonus",
            "tx_options.type": "uni",
          },
        },
        {
          $group: {
            _id: null,
            totalAmount: { $sum: "$amount" },
          },
        },
      ]);
      
      let binary_comission_this_month = await transactions.aggregate([
        {
          $match: {
            to: main_address,
            tx_type: "bonus",
            "tx_options.type": "binary bv",
            createdAt: { $gte: startOfMonth },
          },
        },
        {
          $group: {
            _id: null,
            totalAmount: { $sum: "$amount" },
          },
        },
      ]);

      let binary_comission_total = await transactions.aggregate([
        {
          $match: {
            to: main_address,
            tx_type: "bonus",
            "tx_options.type": "binary bv",
            createdAt: { $gte: startOfMonth },
          },
        },
        {
          $group: {
            _id: null,
            totalAmount: { $sum: "$amount" },
          },
        },
      ]);

      global_data.push({
        email: email ? email : "No email",
        parent_email: "Parent email not found",
        address: owner,
        uni_users,
        binary_users,
        uni_comission_this_month,
        uni_comission_total,
        binary_comission_this_month,
        binary_comission_total,
        balance,
        total_staked,
        flush_out: flush_out,
        binary_calc
      });
    }

    return main_helper.success_response(res, {
      referrals: global_data,
      pagination: {
        page,
        pages: Math.ceil(total_pages / limit),
        limit
      }
    });
  } catch (e) {
    console.log(e.message);
    return main_helper.error_response(res, "error");
  }
};

module.exports = {
  delete_referral_settings,
  edit_referral_setting,
  get_referral_setting,
  testunicalc,
  testbinarycalc,
  get_referral_global_data
};
