const {
  accounts,
  transactions,
  account_meta,
  user,
  treasuries,
} = require("@cubitrix/models");
const main_helper = require("../helpers/index");
const account_helper = require("../helpers/accounts");
const axios = require("axios");
const _ = require("lodash");

async function dashboard_accounts(req, res) {
  try {
    // let responseData = await axios
    //   .get("https://api.coinbase.com/v2/accounts", {
    //       'Authorization': `Bearer ${process.env.COINBASE_API_KEY}`
    //   });
    //   console.log(responseData?.data);
    let withdrawals = await transactions.aggregate([
      {
        $match: {
          tx_type: "withdraw",
          tx_status: "approved",
        },
      },
      {
        $group: {
          _id: "$tx_options.currency",
          totalAmount: { $sum: "$amount" },
        },
      },
    ]);
    let pendings = await accounts.aggregate([
      {
        $match: {
          account_category: { $in: ["main"] },
        },
      },
      {
        $group: {
          _id: null,
          atrSum: { $sum: "$balance" },
          btcSum: { $sum: "$assets.btc" },
          ethSum: { $sum: "$assets.eth" },
          usdcSum: { $sum: "$assets.usdc" },
          goldSum: { $sum: "$assets.gold" },
          platinumSum: { $sum: "$assets.platinum" },
        },
      },
    ]);
    let atarTotalSupply = 100000000;
    let incomings = null;
    let resultData = {
      atar: {
        incoming: atarTotalSupply,
        withdrawals: _.find(withdrawals, { _id: "ATR" })
          ? _.find(withdrawals, { _id: "ATR" })?.totalAmount
          : 0,
        pendings: pendings[0]?.atrSum,
      },
      btc: {
        incoming: _.find(incomings, { asset: "BTC" })
          ? _.find(incomings, { asset: "BTC" })?.balance
          : 0,
        withdrawals: _.find(withdrawals, { _id: "BTC" })
          ? _.find(withdrawals, { _id: "BTC" })?.totalAmount
          : 0,
        pendings: pendings[0]?.btcSum,
      },
      eth: {
        incoming: _.find(incomings, { asset: "ETH" })
          ? _.find(incomings, { asset: "ETH" })?.balance
          : 0,
        withdrawals: _.find(withdrawals, { _id: "ETH" })
          ? _.find(withdrawals, { _id: "ETH" })?.totalAmount
          : 0,
        pendings: pendings[0]?.ethSum,
      },
      usdc: {
        incoming: _.find(incomings, { asset: "USDT" })
          ? _.find(incomings, { asset: "USDT" })?.balance
          : 0,
        withdrawals: _.find(withdrawals, { _id: "USDT" })
          ? _.find(withdrawals, { _id: "USDT" })?.totalAmount
          : 0,
        pendings: pendings[0]?.usdcSum,
      },
      gold: {
        incoming: _.find(incomings, { asset: "GOLD" })
          ? _.find(incomings, { asset: "GOLD" })?.balance
          : 0,
        withdrawals: _.find(withdrawals, { _id: "GOLD" })
          ? _.find(withdrawals, { _id: "GOLD" })?.totalAmount
          : 0,
        pendings: pendings[0]?.goldSum,
      },
      platinum: {
        incoming: _.find(incomings, { asset: "PLATINIUM" })
          ? _.find(incomings, { asset: "PLATINIUM" })?.balance
          : 0,
        withdrawals: _.find(withdrawals, { _id: "PLATINUM" })
          ? _.find(withdrawals, { _id: "PLATINUM" })?.totalAmount
          : 0,
        pendings: pendings[0]?.platinumSum,
      },
    };
    return res.status(200).send({ success: true, resultData });
  } catch (e) {
    console.log(e.message);
    return main_helper.error_response(res, "error");
  }
}

async function rewards_data() {
  try {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    let rewards = await transactions.aggregate([
      {
        $match: {
          tx_type: "bonus",
        },
      },
      {
        $group: {
          _id: null,
          todaySum: {
            $sum: {
              $cond: [{ $gte: ["$createdAt", today] }, "$amount", 0],
            },
          },
          thisMonthSum: {
            $sum: {
              $cond: [
                {
                  $and: [
                    {
                      $gte: [
                        "$createdAt",
                        new Date(today.getFullYear(), today.getMonth(), 1),
                      ],
                    },
                    {
                      $lt: [
                        "$createdAt",
                        new Date(today.getFullYear(), today.getMonth() + 1, 1),
                      ],
                    },
                  ],
                },
                "$amount",
                0,
              ],
            },
          },
          thisYearSum: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $gte: ["$createdAt", new Date(today.getFullYear(), 0, 1)] },
                    { $lt: ["$createdAt", new Date(today.getFullYear() + 1, 0, 1)] },
                  ],
                },
                "$amount",
                0,
              ],
            },
          },
        },
      },
    ]);
    return main_helper.success_message(rewards);
  } catch (e) {
    console.log(e.message);
    return main_helper.error_message("error");
  }
}

async function delete_user(req, res) {
  try {
    const { email } = req.body;
    const user_exists = await user.find({ email });

    if (!user_exists) res.status(404).json({ message: "User not found!" });

    if (user_exists) {
      await user.find({ email }).remove().exec();

      res.status(200).json({ message: "User deleted!" });
    }
  } catch (e) {
    return main_helper.error_response(res, e.message);
  }
}

async function edit_user(req, res) {
  try {
    const { id, email, password } = req.body;

    const user_exists = await user.findOne({ _id: id });

    if (!user_exists) res.status(404).json({ message: "User not found!" });

    if (user_exists) {
      let updateData = {
        email,
        password,
        name,
      };

      if (password === "") {
        updateData = {
          email,
          name,
        };
      }

      const updated = await user_exists.updateOne(updateData);

      if (updated.acknowledged) {
        return main_helper.success_response(res, "success");
      }

      return main_helper.error_response(res, "could not update");
    }
  } catch (e) {
    return main_helper.error_response(res, e.message);
  }
}

async function edit_user_meta(req, res) {
  try {
    const { address, email, name, newAddress } = req.body;
    const user_exists = await account_meta.findOne({ address: address });

    if (!user_exists) res.status(404).json({ message: "User not found!" });

    if (user_exists) {
      let updateData = {
        email,
        name,
        address,
      };

      const updated = await account_meta.findOneAndUpdate({ address }, updateData, {
        new: true,
      });

      if (updated) {
        return main_helper.success_response(res, updated);
      }

      return main_helper.error_response(res, "could not update");
    }
  } catch (e) {
    return main_helper.error_response(res, e.message);
  }
}

async function handle_filter(req, res) {
  try {
    let result,
      total_pages,
      search_value,
      search_option,
      search_query,
      select_value,
      final_value,
      parent_account = [],
      parent_select_account = [],
      all_accounts_list,
      select_accounts = [],
      all_select_accounts_list,
      all_value = [],
      select_all_value = {};
    const req_body = await req.body;
    const req_type = req_body.type;
    const req_page = req_body.page ? req_body.page : 1;
    const req_filter = req_body.filter;
    const limit = 10;
    let { type, page, filter, ...data } = req_body;

    if (data.search) {
      data.search = data.search.toLowerCase();
    }

    if (data.address || (data.search && data.address)) {
      let { search, ...without_search } = data;
      data = without_search;
      data.address = data.address.toLowerCase();
    }
    if (req_type === "account") {
      if (req_filter && !isEmpty(req_filter)) {
        if (req_filter?.selects && req_filter?.selects?.account_type_id != "all") {
          select_value = req_filter?.selects?.account_type_id;
        }
        if (!req_filter?.search?.option || req_filter?.search?.option == "all") {
          search_option = "all";
        } else {
          search_option = req_filter?.search?.option;
        }
        search_value = req_filter?.search?.value;
        if (search_value) {
          if (search_option == "all") {
            all_accounts_list = await accounts.find({
              $or: [
                { address: { $regex: search_value, $options: "i" } },
                { account_owner: { $regex: search_value, $options: "i" } },
              ],
            });
            for (let i = 0; i < all_accounts_list.length; i++) {
              let one_account = all_accounts_list[i];
              if (one_account.account_owner == "") {
                parent_account.push(one_account.address);
              } else {
                parent_account.push(one_account.account_owner);
              }
            }
            all_value.push({ address: { $in: parent_account } });
          } else {
            all_value.push({
              [search_option]: { $regex: search_value, $options: "i" },
            });
          }
        }
        if (select_value && select_value != "all" && !search_value) {
          all_select_accounts_list = await accounts.find({
            account_category: select_value,
          });
          for (let i = 0; i < all_select_accounts_list.length; i++) {
            let one_account = all_select_accounts_list[i];
            if (one_account.account_owner != "") {
              parent_select_account.push(one_account.account_owner);
            } else {
              parent_select_account.push(one_account.address);
            }
          }
          if (all_value && !isEmpty(all_value)) {
            for (let k = 0; k < parent_select_account.length; k++) {
              select_accounts.push(parent_select_account[k]);
            }

            all_value = [{ address: { $in: select_accounts } }];
          } else {
            all_value.push({ address: { $in: parent_select_account } });
          }
        }
        if (all_value && all_value.length < 1) {
          search_query = { account_owner: "" };
        } else {
          search_query = { $or: all_value };
        }
        result = await accounts.aggregate([
          { $match: search_query },
          {
            $lookup: {
              from: "accounts",
              localField: "address",
              foreignField: "account_owner",
              as: "inner_accounts",
            },
          },
          {
            $limit: limit + limit * (req_page - 1),
          },
          {
            $skip: limit * (req_page - 1),
          },
          {
            $sort: { createdAt: -1 },
          },
        ]);
        total_pages = await accounts.count(search_query);
      } else {
        result = await accounts.aggregate([
          {
            $match: {
              account_owner: "",
            },
          },
          {
            $lookup: {
              from: "account_metas",
              localField: "address",
              foreignField: "address",
              as: "account_metas",
            },
          },
          { $unwind: "$account_metas" },
          {
            $lookup: {
              from: "accounts",
              localField: "address",
              foreignField: "account_owner",
              as: "inner_accounts",
            },
          },
          {
            $limit: limit + limit * (req_page - 1),
          },
          {
            $skip: limit * (req_page - 1),
          },
          {
            $sort: { createdAt: -1 },
          },
        ]);
        total_pages = await accounts.count({ account_owner: "" });
      }
    }
    if (req_type === "transactions") {
      if (req_filter && !isEmpty(req_filter)) {
        select_tx_status_value = req_filter?.selects?.tx_status;
        select_tx_type_value = req_filter?.selects?.tx_type;

        if (!req_filter?.search?.option || req_filter?.search?.option == "all") {
          search_option = "all";
        } else {
          search_option = req_filter?.search?.option;
        }
        search_value = req_filter?.search?.value;

        if (search_value) {
          if (search_option == "all") {
            all_value.push(
              { tx_hash: { $regex: search_value, $options: "i" } },
              { from: { $regex: search_value, $options: "i" } },
              { to: { $regex: search_value, $options: "i" } },
            );
          } else {
            all_value = [
              {
                [search_option]: { $regex: search_value, $options: "i" },
              },
            ];
          }
        }
        if (
          (!isEmpty(select_tx_status_value) && select_tx_status_value !== "all") ||
          (select_tx_type_value &&
            !isEmpty(select_tx_type_value) &&
            select_tx_type_value !== "all")
        ) {
          if (search_value) {
            final_value = [{ $or: all_value }];
          } else {
            final_value = [];
          }
          if (
            !isEmpty(select_tx_status_value) &&
            select_tx_status_value &&
            select_tx_status_value !== "all"
          ) {
            final_value.push({ tx_status: select_tx_status_value });
          }

          if (
            !isEmpty(select_tx_type_value) &&
            select_tx_type_value &&
            select_tx_type_value !== "all"
          ) {
            final_value.push({ tx_type: select_tx_type_value });
          }

          if (final_value.length > 1) {
            search_query = { $and: final_value };
          } else if (final_value.length == 1) {
            search_query = final_value[0];
          } else {
            search_query = {}; // Default to no specific filter
          }
        } else {
          if (all_value.length > 0) {
            search_query = { $or: all_value };
          } else {
            search_query = {};
          }
        }

        result = await transactions
          .find(search_query)
          .sort({ createdAt: "desc" })
          .limit(limit)
          .skip(limit * (req_page - 1));
        total_pages = await transactions.count(search_query);
      } else {
        result = await transactions
          .find()
          .sort({ createdAt: "desc" })
          .limit(limit)
          .skip(limit * (req_page - 1));
        total_pages = await transactions.count();
      }
    }
    if (req_type === "users") {
      if (req_filter && !isEmpty(req_filter)) {
        // select_value = req_filter?.selects?.nationality;
        select_value_account_type_id = req_filter?.selects?.account_type_id;

        if (!req_filter?.search?.option || req_filter?.search?.option == "all") {
          search_option = "all";
        } else {
          search_option = req_filter?.search?.option;
        }
        search_value = req_filter?.search?.value;

        if (search_option == "all") {
          if (search_value) {
            if (search_option == "all") {
              all_value.push({ address: { $regex: search_value, $options: "i" } });
            } else {
              all_value = [
                {
                  [search_option]: { $regex: search_value, $options: "i" },
                },
              ];
            }
          }
        } else {
          all_value = [
            {
              [search_option]: { $regex: search_value, $options: "i" },
            },
          ];
        }

        // if (select_value && select_value != "all") {
        //   if (all_value && all_value.length > 0) {
        //     search_query = {
        //       $and: [{ nationality: select_value }, { $or: all_value }],
        //     };
        //   } else {
        //     search_query = {
        //       $and: [{ nationality: select_value }],
        //     };
        //   }
        // }
        if (select_value_account_type_id && select_value_account_type_id != "all") {
          all_select_accounts_list = await accounts.find({
            account_category: select_value_account_type_id,
          });
          for (let i = 0; i < all_select_accounts_list.length; i++) {
            let one_account = all_select_accounts_list[i];
            if (one_account.account_owner != "") {
              parent_select_account.push(one_account.account_owner);
            }
          }
          if (all_value && !isEmpty(all_value)) {
            for (let k = 0; k < parent_select_account.length; k++) {
              select_accounts.push(parent_select_account[k]);
            }
            select_all_value = { address: { $in: select_accounts } };
          } else {
            select_all_value = { address: { $in: parent_select_account } };
          }
        }
        if (all_value.length > 0) {
          search_query = { $or: all_value };
          if (select_all_value && !isEmpty(select_all_value)) {
            search_query = { $and: [select_all_value, { $or: all_value }] };
          }
        } else {
          search_query = {};
        }

        result = await account_meta.aggregate([
          { $match: search_query },
          {
            $lookup: {
              from: "accounts",
              localField: "address",
              foreignField: "account_owner",
              as: "inner_accounts",
            },
          },
          {
            $lookup: {
              from: "accounts",
              localField: "address",
              foreignField: "address",
              as: "main_account",
            },
          },
          { $unwind: "$main_account" },
          {
            $limit: limit + limit * (req_page - 1),
          },
          {
            $skip: limit * (req_page - 1),
          },
          {
            $sort: { createdAt: -1 },
          },
        ]);
        // result = await account_meta
        //   .find(search_query)
        //   .sort({ createdAt: "desc" })
        //   .limit(limit)
        //   .skip(limit * (req_page - 1));
        total_pages = await account_meta.count(search_query);
      } else {
        result = await account_meta.aggregate([
          {
            $lookup: {
              from: "accounts",
              localField: "address",
              foreignField: "account_owner",
              as: "inner_accounts",
            },
          },
          {
            $lookup: {
              from: "accounts",
              localField: "address",
              foreignField: "address",
              as: "main_account",
            },
          },
          { $unwind: "$main_account" },
          {
            $limit: limit + limit * (req_page - 1),
          },
          {
            $skip: limit * (req_page - 1),
          },
          {
            $sort: { createdAt: -1 },
          },
        ]);
        total_pages = await account_meta.count(data);
      }
    }
    if (req_type === "admins") {
      result = await user
        .find()
        .sort({ createdAt: "desc" })
        .limit(limit)
        .skip(limit * (req_page - 1));
      total_pages = await user.count();
    }

    return res.status(200).json(
      main_helper.return_data({
        status: true,
        data: result,
        pages: Math.ceil(total_pages / limit),
      }),
    );
  } catch (e) {
    return main_helper.error_response(res, e.message);
  }
}

async function edit_account(req, res) {
  try {
    const { accountData } = req.body;

    const user_exists = await account_meta.findOne({
      address: accountData.externalAddress,
    });

    if (!user_exists) {
      return res.status(404).json({ message: "User not found!" });
    }

    if (user_exists) {
      let email = accountData.email;
      let active = accountData.active;
      let staking = accountData.staking;
      let stakingAdmin = accountData.stakingAdmin;
      let trade = accountData.trade;
      let tradeAdmin = accountData.tradeAdmin;
      let loan = accountData.loan;
      let loanAdmin = accountData.loanAdmin;
      let referral = accountData.referral;
      let referralAdmin = accountData.referralAdmin;
      let notify = accountData.notify;
      let notifyAdmin = accountData.notifyAdmin;

      const updatedAccountMeta = await account_meta.findOneAndUpdate(
        { address: accountData.externalAddress },
        { email },
        { new: true },
      );

      const updatedAccounts = await accounts.findOneAndUpdate(
        { account_owner: accountData.externalAddress, account_category: "main" },
        {
          extensions: {
            staking,
            stakingAdmin,
            trade,
            tradeAdmin,
            loan,
            loanAdmin,
            referral,
            referralAdmin,
            notify,
            notifyAdmin,
          },
          active: active,
        },
        { new: true },
      );

      if (updatedAccountMeta && updatedAccounts) {
        return main_helper.success_response(res, { updatedAccountMeta, updatedAccounts });
      }

      return main_helper.error_response(res, "Could not update");
    }
  } catch (e) {
    return main_helper.error_response(res, e.message);
  }
}

async function total_data(req, res) {
  try {
    const accountsPipeline = [
      {
        $facet: {
          main: [
            {
              $match: {
                account_category: "main",
              },
            },
            {
              $group: {
                _id: "$account_category",
                totalBalance: { $sum: "$balance" },
                totalStaked: { $sum: "$stakedTotal" },
                totalBtc: { $sum: "$assets.btc" },
                totalEth: { $sum: "$assets.eth" },
                totalUsdc: { $sum: "$assets.usdc" },
                totalGold: { $sum: "$assets.gold" },
                totalPlatinum: { $sum: "$assets.platinum" },
              },
            },
          ],
          others: [
            {
              $match: {
                account_category: { $in: ["trade", "loan"] },
              },
            },
            {
              $group: {
                _id: "$account_category",
                totalBalance: { $sum: "$balance" },
              },
            },
          ],
        },
      },
      {
        $project: {
          data: { $concatArrays: ["$main", "$others"] },
        },
      },
      { $unwind: "$data" },
      {
        $replaceRoot: {
          newRoot: "$data",
        },
      },
    ];

    const transactionsPipelinePending = [
      {
        $match: {
          tx_status: "pending",
          tx_type: "withdraw",
          "tx_options.currency": {
            $in: ["ATR", "btc", "eth", "usdc", "gold", "platinum"],
          },
        },
      },
      {
        $group: {
          _id: "$tx_options.currency",
          totalAmount: { $sum: "$amount" },
        },
      },
    ];

    const transactionsPipelineApproved = [
      {
        $match: {
          tx_status: "approved",
          tx_type: "withdraw",
          "tx_options.currency": {
            $in: ["ATR", "btc", "eth", "usdc", "gold", "platinum"],
          },
        },
      },
      {
        $group: {
          _id: "$tx_options.currency",
          totalAmount: { $sum: "$amount" },
        },
      },
    ];

    const [
      accounts_data,
      transactions_data_approved,
      transactions_data_pending,
      rewards_data_result,
      treasuries_data,
    ] = await Promise.all([
      accounts.aggregate(accountsPipeline),
      transactions.aggregate(transactionsPipelineApproved),
      transactions.aggregate(transactionsPipelinePending),
      rewards_data(),
      treasuries.findOne({}),
    ]);

    let transformedAccounts = {};
    if (accounts_data.length > 0) {
      transformedAccounts = accounts_data.reduce((acc, curr) => {
        acc[curr._id] = curr;
        delete acc[curr._id]._id;
        return acc;
      }, {});
    } else {
      transformedAccounts = {
        main: {
          totalBalance: 0,
          totalStaked: 0,
          totalBtc: 0,
          totalEth: 0,
          totalUsdc: 0,
          totalGold: 0,
          totalPlatinum: 0,
        },
        trade: { totalBalance: 0 },
        loan: { totalBalance: 0 },
      };
    }
    let transformedTransactionsApproved = {};
    if (transactions_data_approved.length > 0) {
      transformedTransactionsApproved = transactions_data_approved.reduce((acc, curr) => {
        acc[curr._id] = curr.totalAmount;
        return acc;
      }, {});
    } else {
      transformedTransactionsApproved = {
        ATR: 0,
        btc: 0,
        eth: 0,
        usdc: 0,
        gold: 0,
        platinum: 0,
      };
    }

    let transformedTransactionsPending = {};
    if (transactions_data_pending.length > 0) {
      transformedTransactionsPending = transactions_data_pending.reduce((acc, curr) => {
        acc[curr._id] = curr.totalAmount;
        return acc;
      }, {});
    } else {
      transformedTransactionsPending = {
        ATR: 0,
        btc: 0,
        eth: 0,
        usdc: 0,
        gold: 0,
        platinum: 0,
      };
    }

    const result = {
      accounts: transformedAccounts,
      pendingWithdrawals: transformedTransactionsPending,
      withdrawals: transformedTransactionsApproved,
      rewards: rewards_data_result,
      incoming: treasuries_data,
    };

    res.status(200).send(result);
  } catch (e) {
    console.log(e);
    return main_helper.error_response(res, e.message);
  }
}

function isEmpty(obj) {
  for (var prop in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, prop)) {
      return false;
    }
  }

  return JSON.stringify(obj) === JSON.stringify({});
}

module.exports = {
  handle_filter,
  delete_user,
  edit_user,
  edit_user_meta,
  dashboard_accounts,
  edit_account,
  total_data,
};
