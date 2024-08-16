const checkSession = (req, res, next) => {
    if (!req.session.userId) {
        return res.redirect("/signup");
    }
    next();
};

const checkUserAuthorized = (req, res, next) => {
    if (req.session.userId != req.params.userId) {
        return res.redirect("/unauthorized");
    }
    next();
};

module.exports = { checkSession, checkUserAuthorized };
