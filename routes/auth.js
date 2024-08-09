const router = require("express").Router();

router.post("/login", (req, res) => {
    console.log("body:", req.body);
    req.session.username = req.body.username;
    res.redirect("/loginok");
})

router.post("/register", (req, res) => {

})

module.exports = router;