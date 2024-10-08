const express = require('express');
require('dotenv').config();
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

const productsRouter = require('./src/routes/product.routes');
const brandsRouter = require('./src/routes/brands.routes')
const categoriesRouter = require('./src/routes/category.routes');
const userRouter = require('./src/routes/user.routes');
const authRouter = require('./src/routes/auth.routes');
const cartRouter = require('./src/routes/cart.routes');
const ordersRouter = require('./src/routes/order.routes');
const errorMiddleware = require('./src/middlewares/error.middleware');
const { User } = require('./src/model/user.model');
const { isAuth, sanitizedUser, cookieExtractor } = require('./src/services/common');
const { Order } = require('./src/model/order.model');
const connectDB = require('./src/db');


// Webhook

const endpointSecret = process.env.ENDPOINT_SECRET;

server.post(
    '/stripe-webhook',
    express.raw({ type: 'application/json' }),
    async (request, response) => {
        const sig = request.headers['stripe-signature'];

        let event;

        try {
            event = stripe.webhooks.constructEvent(request.body, sig, endpointSecret);
        } catch (err) {
            response.status(400).send(`Webhook Error: ${err.message}`);
            return;
        }

        // Handle the event
        switch (event.type) {
            case 'payment_intent.succeeded':
                const paymentIntentSucceeded = event.data.object;
                const order = await Order.findById(
                    paymentIntentSucceeded.metadata.orderId
                );
                order.paymentStatus = 'received';
                await order.save();
                break;
            // ... handle other event types
            default:
                console.log(`Unhandled event type ${event.type}`);
        }

        // Return a 200 response to acknowledge receipt of the event
        response.send();
    }
);

// JWT options

var opts = {}
opts.jwtFromRequest = cookieExtractor;
opts.secretOrKey = process.env.JWT_SECRET_KEY;


// middelwares

server.use(express.static('build'));
server.use(session({
    secret: process.env.SESSION_SECRET_KEY,
    resave: false, // don't save session if unmodified
    saveUninitialized: false, // don't create session until something stored
}));
server.use(cookieParser());
server.use(passport.authenticate('session'));

server.use(cors({
    exposedHeaders: ['X-Total-Count']
}));

// server.use(express.raw({ type: 'application/json' }));
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
                    const token = jwt.sign(sanitizedUser(user), process.env.JWT_SECRET_KEY);
                    done(null, { id: user.id, role: user.role }) // this line sends to serializer
                }
            )

        } catch (err) {
            done(err);
        }
    }
));

passport.use('jwt', new JwtStrategy(opts, async function (jwt_payload, done) {
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
    process.nextTick(function () {
        return cb(null, { id: user.id, role: user.role });
    });
});

// this creates session variable req.user when called from authorised request 
passport.deserializeUser(function (user, cb) {
    process.nextTick(function () {
        // return cb(null, user);
        return cb(null, { id: user.id, role: user.role });
    });
});

// Payments

// This is a public sample test API key.
// Don’t submit any personally identifiable information in requests made with this key.
// Sign in to see your own test API key embedded in code samples.
const stripe = require("stripe")(process.env.STRIPE_SERVER_KEY);

server.post("/create-payment-intent", async (req, res) => {
    const { orderId, productId } = req.body;
    const product = await stripe.products.retrieve(productId);

    // Retrieve product information from Stripe using the productId
    const productPrices = await stripe.prices.list({
        product: productId,
        active: true,
    });

    // Make sure the product has a price
    if (productPrices.data.length === 0) {
        return res.status(400).send({ error: "No active price found for this product." });
    }

    const price = productPrices.data[0].unit_amount / 100;

    // Create a PaymentIntent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
        amount: price * 100, // for decimal compensation,
        currency: "inr",
        automatic_payment_methods: {
            enabled: true,
        },
        metadata: {
            orderId,
        },
    });

    res.send({
        clientSecret: paymentIntent?.client_secret,
        // [DEV]: For demo purposes only, you should avoid exposing the PaymentIntent ID in the client-side code.
        dpmCheckerLink: `https://dashboard.stripe.com/settings/payment_methods/review?transaction_id=${paymentIntent.id}`,
    });
});

connectDB().then(() => {
    server.listen(process.env.PORT || 8000, () => {
        console.log(`⚙️ Server is running at port : ${process.env.PORT}`);
    })
})
    .catch((err) => {
        console.log("MONGO db connection failed !!! ", err);
    })

server.use(errorMiddleware);
