const { checkSession, checkUserAuthorized } = require("../middlewares/session");

const router = require("express").Router();

router.get("/signup", (req, res) => {
    console.log(req.session);
    if (req.session.userId) res.redirect("/dashboard");
    else res.render("signup");
});

router.get("/register", (req, res) => {
    res.render("registration");
});

router.get("/loginok", (req, res) => {
    res.render("login-feedback");
});

router.get("/unauthorized", (req, res) => {
    res.send("<h1>Unauthorized to access this page</h1>");
});

router.get(
    "/dashboard/:userId",
    checkSession,
    checkUserAuthorized,
    (req, res) => {
        res.render("dashboard", { userId: req.params.userId });
    }
);

module.exports = router;
