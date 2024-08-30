const addUserToReq = require("../controllers/user");
const {
    checkIsAdminCall,
    checkUserAlreadyInCall,
    checkCallExists,
} = require("../middlewares/call");
const { checkSession, checkUserAuthorized } = require("../middlewares/session");

const router = require("express").Router();

router.get("/signup", (req, res) => {
    console.log(req.session);
    if (req.session.userId) res.redirect(`/dashboard/${req.session.userId}`);
    else res.render("signup");
});

router.get("/register", (req, res) => {
    res.render("registration");
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

router.get(
    "/call/:callId",
    checkSession,
    checkIsAdminCall,
    addUserToReq,
    checkCallExists,
    checkUserAlreadyInCall,
    (req, res) => {
        return res.render("call-admin-view", {
            callId: req.params.callId,
            userId: req.user.id,
            username: req.user.username,
        });
        /* if (req.isAdmin) {
        return res.render("call-admin-view", { callId: req.params.callId });
    } else {
        return res.render("call-view");
    } */
    }
);

module.exports = router;
