const {
  accounts,
  transactions,
  account_meta,
  user,
} = require("@cubitrix/models");
const main_helper = require("../helpers/index");
const account_helper = require("../helpers/accounts");

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
    const { id, email, password, } = req.body;

    const user_exists = await user.findOne({ _id: id });

    if (!user_exists) res.status(404).json({ message: "User not found!" });

    if (user_exists) {
      let updateData = {
        email,
        password,
        name
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

      const updated = await account_meta.findOneAndUpdate(
        { address },
        updateData,
        {
          new: true,
        }
      );

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
        if (
          req_filter?.selects &&
          req_filter?.selects?.account_type_id != "all"
        ) {
          select_value = req_filter?.selects?.account_type_id;
        }
        if (
          !req_filter?.search?.option ||
          req_filter?.search?.option == "all"
        ) {
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
        if (
          !req_filter?.search?.option ||
          req_filter?.search?.option == "all"
        ) {
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
              { to: { $regex: search_value, $options: "i" } }
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
          (!isEmpty(select_tx_status_value) &&
            select_tx_status_value != "all") ||
          (select_tx_type_value &&
            !isEmpty(select_tx_type_value) &&
            select_tx_type_value != "all")
        ) {
          if (search_value) {
            final_value = [{ $or: all_value }];
          } else {
            final_value = [];
          }
          if (
            !isEmpty(select_tx_status_value) &&
            select_tx_status_value &&
            select_tx_status_value != "all"
          ) {
            final_value.push({ tx_status: select_tx_status_value });
          }

          if (!isEmpty(select_tx_type_value) && select_tx_type_value) {
            final_value.push({ tx_type: select_tx_type_value });
          }

          search_query = {
            $and: final_value,
          };
        } else {
          search_query = { $or: all_value };
        }
        result = await transactions
          .find(search_query)
          .sort({ createdAt: "desc" })
          .limit(limit)
          .skip(limit * (req_page - 1));
        total_pages = await transactions.count(search_query);
      } else {
        result = await transactions
          .find(data)
          .sort({ createdAt: "desc" })
          .limit(limit)
          .skip(limit * (req_page - 1));
        total_pages = await transactions.count(data);
      }
    }
    if (req_type === "users") {
      if (req_filter && !isEmpty(req_filter)) {
        // select_value = req_filter?.selects?.nationality;
        select_value_account_type_id = req_filter?.selects?.account_type_id;

        if (
          !req_filter?.search?.option ||
          req_filter?.search?.option == "all"
        ) {
          search_option = "all";
        } else {
          search_option = req_filter?.search?.option;
        }
        search_value = req_filter?.search?.value;

        if (search_option == "all") {
          if (search_value) {
            all_value.push(
              { name: { $regex: search_value, $options: "i" } },
              { address: { $regex: search_value, $options: "i" } },
              { email: { $regex: search_value, $options: "i" } }
            );
            if (typeof search_option == "number") {
              all_value.push({
                mobile: { $regex: search_value, $options: "i" },
              });
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
        if (
          select_value_account_type_id &&
          select_value_account_type_id != "all"
        ) {
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
      })
    );
  } catch (e) {
    return main_helper.error_response(res, e.message);
  }
}

async function edit_account(req, res) {
  try {
    const { accountData } = req.body;

    console.log(accountData, 'address');
    const user_exists = await account_meta.findOne({ address: accountData.externalAddress });

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

      console.log(active, 'act?')
      const updatedAccountMeta = await account_meta.findOneAndUpdate(
        { address: accountData.externalAddress },
        email,
        { new: true }
      );

      const updatedAccounts = await accounts.findOneAndUpdate(
        { account_owner: accountData.externalAddress, account_category: 'main' },
        {
          active: active,
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
            notifyAdmin
          },
        },
        { new: true }
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
  edit_account
};
