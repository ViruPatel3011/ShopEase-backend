const express = require('express');
const mongoose = require('mongoose');
const server = express();
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const crypto = require('crypto');
const LocalStrategy = require('passport-local').Strategy;
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const jwt = require('jsonwebtoken');

const productsRouter = require('./routes/Product');
const brandsRouter = require('./routes/Brands')
const categoriesRouter = require('./routes/Category');
const userRouter = require('./routes/User');
const authRouter = require('./routes/Auth');
const cartRouter = require('./routes/Cart');
const ordersRouter = require('./routes/Order');
const errorMiddleware = require('./middlewares/error.middleware');
const { User } = require('./model/User');
const { isAuth, sanitizedUser } = require('./services/common');


const SECRET_KEY = 'SECRET_KEY';
// JWT options

var opts = {}
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = SECRET_KEY;


// middelwares
server.use(session({
    secret: 'keyboard cat',
    resave: false, // don't save session if unmodified
    saveUninitialized: false, // don't create session until something stored
}));
server.use(passport.authenticate('session'));

server.use(cors({
    exposedHeaders: ['X-Total-Count']
}));
server.use(express.json()); // to parse req.body
server.use('/products', isAuth(), productsRouter.router);
// We can use JWT token for client-only auth
server.use('/brands', isAuth(), brandsRouter.router);
server.use('/categories', isAuth(), categoriesRouter.router);
server.use('/users', isAuth(), userRouter.router);
server.use('/auth', authRouter.router);
server.use('/cart', isAuth(), cartRouter.router);
server.use('/orders', isAuth(), ordersRouter.router);

// Passport strategies
passport.use('local', new LocalStrategy(
    { usernameField: 'email' },
    async function (username, password, done) {
        // by default passport uses username - { username: username }
        try {
            const user = await User.findOne({ email: username }).exec();
            if (!user) {
                done(null, false, { message: "Invalid Credentials" })
            }
            crypto.pbkdf2(
                password,
                user.salt,
                310000,
                32,
                'sha256',
                async function (err, hashedPassword) {
                    if (!crypto.timingSafeEqual(user.password, hashedPassword)) {
                        return done(null, false, { message: "Invalid Credentials" })
                    }
                    const token = jwt.sign(sanitizedUser(user), SECRET_KEY);
                    done(null, token) // this line sends to serializer
                }
            )

        } catch (err) {
            done(err);
        }
    }
));

passport.use('jwt', new JwtStrategy(opts, async function (jwt_payload, done) {
    console.log({ jwt_payload })
    try {

        const user = await User.findOne({ id: jwt_payload.sub })
        if (user) {
            return done(null, sanitizedUser(user)); // this calls serializer
        } else {
            return done(null, false);
        }
    }
    catch (err) {
        return done(err, false);
    }
}));

// this creates session variable req.user on being called from callbacks
passport.serializeUser(function (user, cb) {
    console.log("serialize:", user);
    process.nextTick(function () {
        return cb(null, user);
    });
});

// this creates session variable req.user when called from authorised request 
passport.deserializeUser(function (user, cb) {
    console.log("de-serialize:", user);
    process.nextTick(function () {
        // return cb(null, user);
        return cb(null, { id: user.id, role: user.role });
    });
});

main().catch(err => console.log(err));

async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/shopEase');
    console.log("Database connected")
}

server.use(errorMiddleware);

server.listen(8080, () => {
    console.log("Server started")
})