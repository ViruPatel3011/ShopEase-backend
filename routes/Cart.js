const express = require('express');
const { addToCart, fetchCartByUser } = require('../controller/Cart');

const router = express.Router();
router
    .post('/', addToCart)
    .get('/', fetchCartByUser);

exports.router = router;