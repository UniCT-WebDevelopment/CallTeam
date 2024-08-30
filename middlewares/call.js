const Call = require("../models/call");
const CallParticipants = require("../models/callParticipants");

const checkIsAdminCall = async (req, res, next) => {
    const call = await Call.findOne({
        where: {
            admin: req.session.userId,
        },
    });

    if (!call) {
        req.isAdmin = false;
    } else {
        req.isAdmin = true;
    }
    console.log(req.isAdmin);

    next();
};

const checkUserAlreadyInCall = async (req, res, next) => {
    const userInCall = await CallParticipants.findOne({
        where: { userId: req.user.id },
    });

    if (userInCall && userInCall.isInCall) {
        return res.render("already-in-call", { userId: req.user.id });
    }

    next();
};

const checkCallExists = async (req, res, next) => {
    const call = await Call.findOne({ where: { id: req.params.callId } });

    if (!call) {
        return res.status(400).json({ error: "Invalid Call ID" });
    }
    next();
};

module.exports = { checkIsAdminCall, checkUserAlreadyInCall, checkCallExists };
