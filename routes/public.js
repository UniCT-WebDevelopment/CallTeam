const router = require("express").Router();

router.get("/signup", (req, res) => {
    console.log(req.session);
    if (req.session.username)
        res.redirect("/dashboard");
    else
        res.render('signup');
})

router.get("/loginok", (req, res) => {
    res.render("login-feedback");
})

router.get("/dashboard", (req, res) => {
    res.send(`<h1>Dashboard ${req.session.username}</h1>`);
})

module.exports = router;