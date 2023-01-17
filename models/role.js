const { Schema, model, mongoose } = require("mongoose");

const schema = new Schema(
  {
    value: {
      type: String,
      unique: true,
      default: "user",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = model("role", schema);
