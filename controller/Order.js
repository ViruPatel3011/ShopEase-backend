const { Order } = require("../model/Order");
const apiResponse = require("../utils/ApiResponse");

exports.fetchOrdersByUser = async (req, res) => {
    try {
        const { user } = req.query;
        console.log('user', user);
        const orders = await Order.find({ user: user });
        res.status(200).json(apiResponse(true, "fetched all Orders Successfully", orders));
    } catch (err) {
        res.status(400).json(apiResponse(false, "getting error in Order fetching"));
    }
}

exports.createOrder = async (req, res) => {
    try {
        const order = new Order(req.body);
        console.log('order' , order);
        const doc = await order.save();
        res.status(201).json(apiResponse(true, "created Order Successfully", doc));
    } catch (err) {
        console.log(err);
        res.status(400).json(apiResponse(false, "getting error in Order creation"));
    }
};

exports.deleteOrder = async (req, res) => {
    const { id } = req.params;
    try {
        const order = await Order.findByIdAndDelete(id);
        res.status(200).json(apiResponse(true, "Order Deleted Successfully", order));
    } catch (err) {
        res.status(400).json(apiResponse(false, "Not able to delete Order"));
    }
};

exports.updateOrder = async (req, res) => {
    const { id } = req.params;
    try {
        const order = await Order.findByIdAndUpdate(id, req.body, {
            new: true,
        });
        res.status(200).json(order);
    } catch (err) {
        res.status(400).json(err);
    }
};