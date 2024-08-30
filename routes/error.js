const { checkSession } = require("../middlewares/session");

const router = require("express").Router();

router.get("/unauthorized", checkSession, (req, res) => {
    res.render("unauthorized", { userId: req.session.userId });
});

router.get("/alreadyInCall", checkSession, (req, res) => {
    res.render("already-in-call", { userId: req.session.userId });
});

router.get("/notAllowedSettings", checkSession, (req, res) => {
    res.render("change-settings", { userId: req.session.userId });
});

module.exports = router;
