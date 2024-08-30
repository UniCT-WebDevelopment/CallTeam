const router = require("express").Router();
const { body } = require("express-validator");
const { authValidator } = require("../middlewares/validate");
const { checkSession } = require("../middlewares/session");
const { registerUser, loginUser, logoutUser } = require("../controllers/auth");

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

router.post("/logout", checkSession, logoutUser);

module.exports = router;
