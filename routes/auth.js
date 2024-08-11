const router = require("express").Router();
const { body } = require("express-validator");
const { authValidator } = require("../middlewares/validate");
const { registerUser, loginUser } = require("../controllers/auth");

router.post(
  "/login",
  body("username")
    .notEmpty()
    .trim()
    .withMessage("Invalid username or password"),
  body("password")
    .notEmpty()
    .trim()
    .isLength({ min: 8 })
    .withMessage("Invalid username or password"),
  authValidator,
  loginUser
);

router.post(
  "/register",
  body("name").notEmpty().trim(),
  body("surname").notEmpty().trim(),
  body("username")
    .notEmpty()
    .trim()
    .withMessage("Invalid username or password"),
  body("password")
    .notEmpty()
    .trim()
    .isLength({ min: 8 })
    .withMessage("Invalid username or password"),
  authValidator,
  registerUser
);

module.exports = router;
