const express = require('express');
const { createOrder, deleteOrder, fetchOrdersByUser, updateOrder } = require('../controller/Order');

const router = express.Router();
router
    .post('/', createOrder)
    .get('/', fetchOrdersByUser)
    .patch('/:id', updateOrder)
    .delete('/:id', deleteOrder);

exports.router = router;