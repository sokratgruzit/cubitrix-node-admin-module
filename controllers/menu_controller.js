let menu = require("../models/menu");
let main_helper = require("../helpers/main");

async function get_menu(req, res) {
  try {
    let menu_data = await menu.find().sort({ created_at: -1 });
    return main_helper.return_response(res, true, menu_data);
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "Something get wront, try again" });
  }
}

async function update_menu(req, res) {
  try {
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "Something get wront, try again" });
  }
}

async function change_menu_status(req, res) {
  try {
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "Something get wront, try again" });
  }
}

module.exports = {
  get_menu,
  update_menu,
  change_menu_status,
};
