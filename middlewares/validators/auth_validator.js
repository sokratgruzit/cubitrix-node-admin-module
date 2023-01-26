const { check, validationResult } = require("express-validator");

exports.register_validator = [
  check("email", "Invalid email adress").isEmail(),
  check("password", "Min length of password is 6 symbol").isLength({
    min: 6,
  }),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(422).json({ errors: errors.array() });
    next();
  },
];

exports.login_validator = [
  check("email", "Enter correct email").normalizeEmail().isEmail(),
  check("password", "Min length of password is 6 symbol").isLength({
    min: 6,
  }),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(422).json({ errors: errors.array() });
    next();
  },
];
