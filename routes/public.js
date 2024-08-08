const router = require("express").Router();

router.get("/signup", (req, res) => {
    console.log(req.session);
    res.render('signup');
})

module.exports = router;