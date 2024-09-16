const passport = require('passport');

exports.isAuth = (req, res, done) => {
    return passport.authenticate('jwt');
}

exports.sanitizedUser = (user) => {
    return { id: user.id, role: user.role }
}