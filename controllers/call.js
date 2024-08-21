const crypto = require("crypto");
const Call = require("../models/call");
const User = require("../models/user");

const createNewCall = (req, res) => {
    const callId = crypto.randomBytes(20).toString("hex");
    const adminId = req.session.userId;
    const newCall = Call.create({
        id: callId,
        admin: adminId,
        participants: 1,
    });

    return res.redirect(`/call/${callId}`);
};

module.exports = { createNewCall };
