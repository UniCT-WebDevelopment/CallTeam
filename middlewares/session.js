const checkSession = (req, res, next) => {
  if (!req.session.userId) {
    return res.redirect(400, "/signup");
  }
  next();
};

const checkUserAuthorized = (req, res, next) => {
  if (req.session.userId != req.params.userId) {
    return res.redirect(400, "/unauthorized");
  }
};

module.exports = { checkSession, checkUserAuthorized };
