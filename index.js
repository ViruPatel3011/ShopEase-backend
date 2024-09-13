const express = require('express');
const mongoose = require('mongoose');
const server = express();
const productsRouter = require('./routes/Product');
const brandsRouter = require('./routes/Brands')
const categoriesRouter = require('./routes/Category');
const userRouter = require('./routes/User');
const authRouter = require('./routes/Auth');
const cartRouter = require('./routes/Cart');
const ordersRouter = require('./routes/Order');
const errorMiddleware=require('./middlewares/error.middleware')
const cors = require('cors');

// middelwares
server.use(cors({
    exposedHeaders:['X-Total-Count']
}));
server.use(express.json()); // to parse req.body
server.use('/products', productsRouter.router);
server.use('/brands', brandsRouter.router);
server.use('/categories', categoriesRouter.router);
server.use('/users', userRouter.router);
server.use('/auth', authRouter.router);
server.use('/cart', cartRouter.router);
server.use('/orders', ordersRouter.router);

main().catch(err => console.log(err));

async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/shopEase');
    console.log("Database connected")
}


server.get('/', (req, res) => {
    res.json({ status: 'sucess' })
})

server.use(errorMiddleware);

server.listen(8080, () => {
    console.log("Server started")
})