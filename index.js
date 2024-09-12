const express = require('express');
const mongoose = require('mongoose');
const { createProduct } = require('./controller/Product');
const server = express();
const productsRouter = require('./routes/Product');
const brandsRouter = require('./routes/Brands')
const categoriesRouter = require('./routes/Category');
const cors = require('cors');

// middelwares
server.use(cors({
    exposedHeaders:['X-Total-Count']
}));
server.use(express.json()); // to parse req.body
server.use('/products', productsRouter.router);
server.use('/brands', brandsRouter.router);
server.use('/categories', categoriesRouter.router);

main().catch(err => console.log(err));

async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/shopEase');
    console.log("Database connected")
}


server.get('/', (req, res) => {
    res.json({ status: 'sucess' })
})

server.listen(8080, () => {
    console.log("Server started")
})