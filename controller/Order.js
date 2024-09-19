const { Order } = require("../model/Order");
const apiResponse = require("../utils/ApiResponse");

exports.fetchOrdersByUser = async (req, res) => {
    try {
        const { id } = req.user;
        const orders = await Order.find({ user: id });
        res.status(200).json(apiResponse(true, "fetched all Orders Successfully", orders));
    } catch (err) {
        res.status(400).json(apiResponse(false, "getting error in Order fetching"));
    }
}

exports.createOrder = async (req, res) => {
    try {
        const order = new Order(req.body);
        const doc = await order.save();
        res.status(201).json(apiResponse(true, "created Order Successfully", doc));
    } catch (err) {
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
        res.status(200).json(apiResponse(true, "Order updated Successfully", order));
    } catch (err) {
        res.status(400).json(apiResponse(false, "not able to update Order"));
    }
};

exports.fetchAllOrders = async (req, res) => {

    // sort = {_sort:"price",_order="desc"}
    // pagination = {_page:1,_limit=10}

    let query = Order.find({ deleted: { $ne: true } });
    let totalOrdersQuery = Order.find({ deleted: { $ne: true } });


    if (req.query._sort && req.query._order) {
        query = query.sort({ [req.query._sort]: req.query._order })
        totalOrdersQuery = totalOrdersQuery.sort({ [req.query._sort]: req.query._order })
    }

    const totalDocs = await totalOrdersQuery.countDocuments().exec();

    if (req.query._page && req.query._limit) {
        const pageSize = req.query._limit;
        const page = req.query._page;
        query = query.skip(pageSize * (page - 1)).limit(pageSize);
    }

    try {
        const doc = await query.exec();
        res.set('X-Total-Count', totalDocs)
        res.status(200).json(apiResponse(true, "Orders fetched succesfully", { doc, totalCount: totalDocs }));
    } catch (err) {
        console.log(err);
        res.status(400).json(apiResponse(false, "not able to fetched all Orders "));
    }
};