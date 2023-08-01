const { transactions, treasuries } = require("@cubitrix/models");
const main_helper = require("../helpers/index");
var mongoose = require("mongoose");

// const change_transaction_status = async (req, res) => {
//   try {
//     let { _id, tx_status } = req.body;
//     _id = mongoose.Types.ObjectId(_id);

//     let tx = await transactions.findOne({ _id });
//     if (!tx) {
//       return main_helper.error_response(res, "transaction not found");
//     }
//     if (tx.tx_type == "payment") {
//       return main_helper.error_response(
//         res,
//         "cannot change status to payment transaction",
//       );
//     }
//     const [updateTx, updateTreasury] = await Promise.all([
//       transactions.findOneAndUpdate({ _id }, { tx_status }),
//       treasuries.findOneAndUpdate(
//         {},
//         {
//           $inc: {
//             [`withdrawals.${tx?.tx_options?.currency?.toUpperCase()}`]: tx.amount,
//           },
//         },
//       ),
//     ]);
//     if (updateTx) {
//       return main_helper.success_response(res, updateTx);
//     } else {
//       return main_helper.error_response(res, "error");
//     }
//   } catch (e) {
//     console.log(e.message);
//     return main_helper.error_response(res, "error");
//   }
// };

const change_transaction_status = async (req, res) => {
  try {
    let { _id, tx_status } = req.body;
    _id = mongoose.Types.ObjectId(_id);

    let [tx, treasury] = await Promise.all([
      transactions.findOne({ _id }),
      treasuries.findOne(),
    ]);

    if (!tx) {
      return main_helper.error_response(res, "transaction not found");
    }
    if (tx.tx_type == "payment") {
      return main_helper.error_response(
        res,
        "cannot change status to payment transaction",
      );
    }

    let promises = [transactions.findOneAndUpdate({ _id }, { tx_status })];

    if (tx.tx_status == "pending" && tx_status == "approved") {
      const currency = tx?.tx_options?.currency?.toUpperCase();
      const pendingWithdrawalAmount = treasury.pendingWithdrawals[currency] || 0;
      const currentIncomingAmount = treasury.incoming[currency] || 0;
      if (pendingWithdrawalAmount + tx.amount > currentIncomingAmount) {
        return main_helper.error_response(
          res,
          "Insufficient funds for withdrawal in treasury",
        );
      }
      promises.push(
        treasuries.findOneAndUpdate(
          {},
          {
            $inc: {
              [`withdrawals.${currency}`]: Number(tx.amount),
              [`pendingWithdrawals.${currency}`]: 0 - tx.amount,
              [`incoming.${currency}`]: 0 - tx.amount,
            },
          },
        ),
      );
    }

    const [updateTx, updateTreasury] = await Promise.all(promises);
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

const edit_transaction = async (req, res) => {
  try {
    let { _id, amount, from, to, tx_currency, tx_hash, tx_status, tx_type } = req.body;
    let updateTx = await transactions.findOneAndUpdate(
      { _id },
      { amount, from, to, tx_currency, tx_hash, tx_status, tx_type },
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
