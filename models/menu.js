const mongoose = require("mongoose");

const menu = new mongoose.Schema(
  {
    menu: String,
    module: String,
    active: Boolean,
  },
  {
    timestamps: true,
  }
);
module.exports = mongoose.model("menu", menu);
