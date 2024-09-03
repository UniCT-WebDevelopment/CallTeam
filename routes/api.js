const {
    createNewCall,
    getCallParticipants,
    getCall,
} = require("../controllers/call");
const { getRequests } = require("../controllers/request");
const { checkSession } = require("../middlewares/session");

const router = require("express").Router();

router.post("/newCall", checkSession, createNewCall);
router.get("/getParticipants", checkSession, getCallParticipants);
router.get("/getCall", checkSession, getCall);
router.get("/getRequests", checkSession, getRequests);

module.exports = router;
