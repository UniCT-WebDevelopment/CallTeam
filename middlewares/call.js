const Call = require("../models/call");

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

module.exports = { checkIsAdminCall };
