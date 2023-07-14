const { options, transactions } = require("@cubitrix/models");
const main_helper = require("../helpers/index");

const change_transaction_status = async (req, res) => {
  try {
    let { _id, tx_status } = req.body;
    let updateTx = await transactions.findOneAndUpdate({ _id }, { tx_status });
    if (updateTx) {
      return main_helper.success_response(res, "error");
    } else {
      return main_helper.error_response(res, "error");
    }
  } catch (e) {
    console.log(e.message);
    return main_helper.error_response(res, "error");
  }
};

module.exports = {
  change_transaction_status,
};
