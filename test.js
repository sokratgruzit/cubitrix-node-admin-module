const express = require("express");
const mongoose = require("mongoose");
const auth = require("./routes/auth_routes");
const cors = require("cors");
const content = require("./routes/content_routes");
const data = require("./routes/data_routes");
const admin_data = require("./routes/data_routes");
const cors_options = require("./config/cors_options");
const credentials = require("./middlewares/credentials");
require("dotenv").config();
const app = express();
app.use(express.json({ extended: true }));
app.use(credentials);
app.use(cors(cors_options));

app.use("/api/auth", auth);
app.use("/api/content", content);
app.use("/api/data", data);
app.use("/admin_data", admin_data);

app.get("/api/test", (req, res) => {
  res.send("test");
});
// console.log(accounts.index("jinx1"));
// app.use('/accounts', router)

// const auth = require('./modules/auth/routes/index.routes');
// const staking = require('./modules/staking/routes/index.routes');

//load modules depend env file
// if(process.env.AUTH === 'true') app.use('/api/auth', auth);
// if(process.env.STAKING === 'true') app.use('/api/staking', staking);

// //test route
// app.get("/test", (req, res) => {
//    res.send("server is working");
// });

//static path
const root = require("path").join(__dirname, "front", "build");
app.use(express.static(root));

// app.get("*", function (req, res) {
//    res.sendFile(
//       'index.html', { root }
//    );
// });

async function start() {
  const PORT = process.env.PORT || 5000;
  try {
    mongoose.set("strictQuery", false);
    await mongoose.connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    app.listen(PORT, () =>
      console.log(`App has been started on port ${PORT}...`)
    );
  } catch (e) {
    console.log(`Server Error ${e.message}`);
    process.exit(1);
  }
}

start();
