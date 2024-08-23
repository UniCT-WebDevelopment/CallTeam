const User = require("../models/user");

const getUserById = async (req, res, next) => {
    const user = await User.findOne({
        where: {
            id: req.session.userId,
        },
    });

    if (!user) {
        return res.status(400).json({ error: "User not found" });
    }

    req.user = user;
    next();
};

module.exports = getUserById;
