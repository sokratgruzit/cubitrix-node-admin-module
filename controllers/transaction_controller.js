const {
  transactions,
  treasuries,
  accounts,
  transaction_fee,
} = require("@cubitrix/models");
const main_helper = require("../helpers/index");
var mongoose = require("mongoose");

const change_transaction_status = async (req, res) => {
  try {
    let { _id, tx_status } = req.body;
    _id = mongoose.Types.ObjectId(_id);

    let [tx, treasury] = await Promise.all([
      transactions.findOne({ _id }),
      treasuries.findOne(),
    ]);

    if (!tx) {
      return main_helper.error_response(res, "Transaction not found");
    }

    if (tx.tx_type == "payment") {
      return main_helper.error_response(
        res,
        "Cannot change status to payment transaction"
      );
    }

    let promises = [transactions.findOneAndUpdate({ _id }, { tx_status })];

    if (tx.tx_status == "pending" && tx_status == "approved") {
      const currency = tx?.tx_options?.currency?.toUpperCase();
      const pendingWithdrawalAmount =
        treasury.pendingWithdrawals[currency] || 0;
      const currentIncomingAmount = treasury.incoming[currency] || 0;

      if (pendingWithdrawalAmount + tx.amount > currentIncomingAmount) {
        return main_helper.error_response(
          res,
          "Insufficient funds for withdrawal in treasury"
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
          }
        )
      );
    } else if (tx.tx_status == "pending" && tx_status == "canceled") {
      const currency = tx?.tx_options?.currency?.toUpperCase();
      promises.push(
        treasuries.findOneAndUpdate(
          {},
          {
            $inc: {
              [`pendingWithdrawals.${currency}`]: 0 - tx.amount,
            },
          }
        )
      );
      if (tx.tx_options.currency === "ATR") {
        promises.push(
          accounts.findOneAndUpdate(
            { account_owner: tx.from, account_category: "main" },
            {
              $inc: {
                balance: Number(tx.amount),
              },
            }
          )
        );
      } else {
        promises.push(
          accounts.findOneAndUpdate(
            { account_owner: tx.from, account_category: "main" },
            {
              $inc: {
                [`assets.${currency?.toLowerCase()}`]: Number(tx.amount),
              },
            }
          )
        );
      }
      // promises.push(
      //   accounts.findOneAndUpdate(
      //     { account_owner: tx.from, account_category: "main" },
      //     {
      //       $inc: {
      //         [`balances.${currency}`]: tx.amount,
      //       },
      //     },
      //   ),
      // );
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

async function add_transaction_fee(req, res) {
  const {
    transaction_type,
    effective_from_date,
    effective_to_date,
    user_tier,
    description,
    fee_type,
    base_fee,
    fixed_fee,
    variable_fee_rate,
    fee_currency,
    base_fee_in_base_currency,
    base_currency,
    min_fee_in_base_currency,
    max_fee_in_base_currency,
    is_on_chain,
    network,
    gas_limit,
    last_updated,
  } = req.body.popUpData;

  console.log(req.body);

  try {
    const newTransactionFee = await transaction_fee.create({
      transaction_type,
      effective_from_date,
      effective_to_date,
      user_tier,
      description,
      fee_type,
      base_fee,
      fixed_fee,
      variable_fee_rate,
      fee_currency,
      base_fee_in_base_currency,
      base_currency,
      min_fee_in_base_currency,
      max_fee_in_base_currency,
      is_on_chain,
      network,
      gas_limit,
      last_updated,
    });
    console.log("Transaction Fee added successfully.");
    return main_helper.success_response(res, newTransactionFee);
  } catch (e) {
    return main_helper.error_response(res, "error Transaction Fee added");
  }
}

async function edit_transaction_fee(req, res) {
  const {
    _id,
    transaction_type,
    effective_from_date,
    effective_to_date,
    user_tier,
    description,
    fee_type,
    base_fee,
    fixed_fee,
    variable_fee_rate,
    fee_currency,
    base_fee_in_base_currency,
    base_currency,
    min_fee_in_base_currency,
    max_fee_in_base_currency,
    is_on_chain,
    network,
    gas_limit,
    last_updated,
  } = req.body.popUpData;

  try {
    const updatedTransactionFee = await transaction_fee.findOneAndUpdate(
      { _id },
      {
        transaction_type,
        effective_from_date,
        effective_to_date,
        user_tier,
        description,
        fee_type,
        base_fee,
        fixed_fee,
        variable_fee_rate,
        fee_currency,
        base_fee_in_base_currency,
        base_currency,
        min_fee_in_base_currency,
        max_fee_in_base_currency,
        is_on_chain,
        network,
        gas_limit,
        last_updated,
      },
      { new: true }
    );

    console.log("Transaction Fee updated successfully.");
    return main_helper.success_response(res, updatedTransactionFee);
  } catch (e) {
    return main_helper.error_response(res, "Error updating Transaction Fee");
  }
}

async function delete_transaction_fee(req, res) {
  const { _id } = req.body;

  try {
    const result = await transaction_fee.findByIdAndDelete(_id);

    console.log("Transaction Fee deleted successfully.");
    return main_helper.success_response(res, result);
  } catch (e) {
    console.error("Error deleting transaction fee:", res);
    return main_helper.error_response(res, "Error deleting transaction fee");
  }
}

async function get_all_transaction_fees(req, res) {
  try {
    const allTransactionFees = await transaction_fee.find({});

    console.log("All Transaction Fees retrieved successfully.");
    return main_helper.success_response(res, allTransactionFees);
  } catch (e) {
    console.error("Error retrieving transaction fees:", res);
    return main_helper.error_response(res, "Error retrieving transaction fees");
  }
}

module.exports = {
  get_all_transaction_fees,
  delete_transaction_fee,
  edit_transaction_fee,
  add_transaction_fee,
  change_transaction_status,
  edit_transaction,
};
