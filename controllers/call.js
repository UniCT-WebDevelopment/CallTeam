const crypto = require("crypto");
const Call = require("../models/call");
const User = require("../models/user");
const CallParticipants = require("../models/callParticipants");

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

const getCallParticipants = async (req, res) => {
    const callId = req.query.callId;

    if (!callId) {
        return res.status(400).json({ error: "No reference to callId" });
    }

    const call = await Call.findOne({
        where: {
            id: callId,
        },
    });
    if (!call) {
        return res.status(400).json({ error: "Call not found" });
    }

    const usersInCall = await call.getUsers();
    return res.status(200).json({ users: usersInCall });
};

module.exports = { createNewCall, getCallParticipants };
