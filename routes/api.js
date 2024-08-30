const {
    createNewCall,
    getCallParticipants,
    getCall,
} = require("../controllers/call");
const { checkSession } = require("../middlewares/session");

const router = require("express").Router();

router.post("/newCall", checkSession, createNewCall);
router.get("/getParticipants", checkSession, getCallParticipants);
router.get("/getCall", checkSession, getCall);

module.exports = router;
