const express = require('express');
const mongoose = require('mongoose');
const server = express();
const cors = require('cors');
const session = require('express-session');
const cookieParser = require('cookie-parser');
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
const { isAuth, sanitizedUser, cookieExtractor } = require('./services/common');


const SECRET_KEY = 'SECRET_KEY';
// JWT options

var opts = {}
opts.jwtFromRequest = cookieExtractor;
opts.secretOrKey = SECRET_KEY;


// middelwares

server.use(express.static('build'));
server.use(session({
    secret: 'keyboard cat',
    resave: false, // don't save session if unmodified
    saveUninitialized: false, // don't create session until something stored
}));
server.use(cookieParser());
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
    async function (email, password, done) {
        // by default passport uses username - { username: username }
        try {
            const user = await User.findOne({ email: email }).exec();
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
                    done(null, { id: user.id, role: user.role }) // this line sends to serializer
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

        const user = await User.findById(jwt_payload.id)
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
    console.log("serialize:", { id: user.id, role: user.role });
    process.nextTick(function () {
        return cb(null, { id: user.id, role: user.role });
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

// Payments

// This is a public sample test API key.
// Don’t submit any personally identifiable information in requests made with this key.
// Sign in to see your own test API key embedded in code samples.
const stripe = require("stripe")('sk_test_tR3PYbcVNZZ796tH88S4VQ2u');

const calculateOrderAmount = (items) => {
    return 1500;
};

server.post("/create-payment-intent", async (req, res) => {
    const { items } = req.body;

    // Create a PaymentIntent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
        amount: calculateOrderAmount(items),
        currency: "usd",
        // In the latest version of the API, specifying the `automatic_payment_methods` parameter is optional because Stripe enables its functionality by default.
        automatic_payment_methods: {
            enabled: true,
        },
    });

    res.send({
        clientSecret: paymentIntent.client_secret,
        // [DEV]: For demo purposes only, you should avoid exposing the PaymentIntent ID in the client-side code.
        dpmCheckerLink: `https://dashboard.stripe.com/settings/payment_methods/review?transaction_id=${paymentIntent.id}`,
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