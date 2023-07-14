const { options, transactions, accounts } = require("@cubitrix/models");
const main_helper = require("../helpers/index");
var mongoose = require("mongoose");

const change_transaction_status = async (req, res) => {
  try {
    let { _id, tx_status } = req.body;
    _id = mongoose.Types.ObjectId(_id);

    let tx = await transactions.findOne({ _id });
    if (!tx) {
      return main_helper.error_response(res, "transaction not found");
    }
    if (tx.tx_type == "payment") {
      return main_helper.error_response(
        res,
        "cannot change status to payment transaction"
      );
    }
    let updateTx = await transactions.findOneAndUpdate({ _id }, { tx_status });
    if (updateTx) {
      return main_helper.success_response(res, updateTx);
    } else {
      return main_helper.error_response(res, "error");
    }
    let from_account = await accounts.findOne({
      account_owner: tx.from,
      account_category: tx.tx_options.account_category_from,
    });
    let to_account = await accounts.findOne({
      account_owner: tx.to,
      account_category: tx.tx_options.account_category_to,
    });
    console.log(from_account, to_account);
    let tx_amount = tx.amount;
    let tx_prev_status = tx.tx_status;
    if (tx_prev_status == tx_status) {
      return main_helper.error_response(res, "transaction status is same");
    }

    // if (tx_prev_status == "pending") {
    //   if (tx_status == "cancelled") {
    //     if (tx_amount > to_account.balance) {
    //       return main_helper.error_response(res, "insufficient balance");
    //     }
    //     if (!from_account && !to_account) {
    //       return main_helper.error_response(res, "incorrect addresses");
    //     }
    //     let from_account_change = await accounts.findOneAndUpdate(
    //       {
    //         account_owner: tx.from,
    //         account_category: tx.tx_options.account_category_from,
    //       },
    //       { $inc: { balance: tx_amount } }
    //     );
    //     let to_account_change = await accounts.findOneAndUpdate(
    //       {
    //         account_owner: tx.to,
    //         account_category: tx.tx_options.account_category_to,
    //       },
    //       { $inc: { balance: -tx_amount } }
    //     );
    //     if (from_account_change && to_account_change) {
    //       let updateTx = await transactions.findOneAndUpdate(
    //         { _id },
    //         { tx_status }
    //       );
    //       if (updateTx) {
    //         return main_helper.success_response(res, updateTx);
    //       } else {
    //         return main_helper.error_response(res, "error");
    //       }
    //     }
    //   } else {
    //     let updateTx = await transactions.findOneAndUpdate(
    //       { _id },
    //       { tx_status }
    //     );
    //     if (updateTx) {
    //       return main_helper.success_response(res, updateTx);
    //     } else {
    //       return main_helper.error_response(res, "error");
    //     }
    //   }
    // } else {
    //   return main_helper.error_response(res, "error");
    // }
  } catch (e) {
    console.log(e.message);
    return main_helper.error_response(res, "error");
  }
};

const edit_transaction = async (req, res) => {
  try {
    let { _id, amount, from, to, tx_currency, tx_hash, tx_status, tx_type } =
      req.body;
    let updateTx = await transactions.findOneAndUpdate(
      { _id },
      { amount, from, to, tx_currency, tx_hash, tx_status, tx_type }
    );
    if (updateTx) {
      return main_helper.success_response(res, updateTx);
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
  edit_transaction,
};
