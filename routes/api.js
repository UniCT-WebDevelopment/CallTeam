const { createNewCall, getCallParticipants } = require("../controllers/call");
const { checkSession } = require("../middlewares/session");

const router = require("express").Router();

router.post("/newCall", checkSession, createNewCall);
router.get("/getParticipants", checkSession, getCallParticipants);

module.exports = router;
