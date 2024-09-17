const express = require('express');
const { createOrder, deleteOrder, fetchOrdersByUser, updateOrder,fetchAllOrders } = require('../controller/Order');

const router = express.Router();
router
    .post('/', createOrder)
    .get('/own', fetchOrdersByUser)
    .patch('/:id', updateOrder)
    .delete('/:id', deleteOrder)
    .get('/', fetchAllOrders);

exports.router = router;