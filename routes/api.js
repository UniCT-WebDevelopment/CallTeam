const { createNewCall } = require("../controllers/call");
const { checkSession } = require("../middlewares/session");

const router = require("express").Router();

router.post("/newCall", checkSession, createNewCall);

module.exports = router;
