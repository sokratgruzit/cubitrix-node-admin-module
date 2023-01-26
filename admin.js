//static path
const admin_auth = require("./routes/auth_routes");
const admin_content = require("./routes/content_routes");
const admin_data = require("./routes/data_routes");

module.exports = {
  admin_auth: admin_auth,
  admin_content: admin_content,
  admin_data: admin_data,
};
