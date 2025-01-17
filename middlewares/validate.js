const { validationResult } = require("express-validator");

const authValidator = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    console.log(errors.array());
    return res.status(400).json({ errors: errors.array() });
  }
  return next();
};

module.exports = { authValidator };
