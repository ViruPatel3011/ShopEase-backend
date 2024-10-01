const passport = require('passport');

exports.isAuth = (req, res, done) => {
    return passport.authenticate('jwt');
}

exports.sanitizedUser = (user) => {
    return { id: user.id, role: user.role }
}

exports.cookieExtractor = function (req) {
    let token = null;
    if (req && req.cookies) {
        token = req.cookies['jwt'];
    }
    // // TODO: temporary token for test
    token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY2ZTgyMTY5ZTUwZWJiODcxMjJjNjhlYSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTcyNjU0OTQxNH0.DLyqafNW8-g1HYHY0TFDE-EezJHXMWj5CirafEq29_Y'
    return token;
};