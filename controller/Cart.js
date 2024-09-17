const { Cart } = require("../model/Cart");
const apiResponse = require("../utils/ApiResponse");

exports.fetchCartByUser = async (req, res) => {
    try {
        const { id } = req.user;
        const carts = await Cart.find({ user: id }).populate('product');
        res.status(200).json(apiResponse(true, "fetched all Carts Successfully", carts));
    } catch (err) {
        res.status(400).json(apiResponse(false, "getting error in  cart fetching"));
    }
}

exports.addToCart = async (req, res) => {
    try {
        const { id } = req.user;
        const cart = new Cart({ ...req.body, user: id });
        const doc = await cart.save();
        const result = await doc.populate('product')
        res.status(201).json(apiResponse(true, "created Cart Successfully", result));
    } catch (err) {
        console.log(err);
        res.status(400).json(apiResponse(false, "getting error in cart creation"));
    }
};

exports.updateCart = async (req, res) => {
    const { id } = req.params;
    try {
        const cart = await Cart.findByIdAndUpdate(id, req.body, {
            new: true,
        });
        const result = await cart.populate('product');
        res.status(200).json(apiResponse(true, "Cart Updated Successfully", result));
    } catch (err) {
        res.status(400).json(apiResponse(false, "Not able to update Cart"));
    }
};

exports.deleteFromCart = async (req, res) => {
    const { id } = req.params;
    try {
        const cart = await Cart.findByIdAndDelete(id);
        res.status(200).json(apiResponse(true, "Cart Deleted Successfully", cart));
    } catch (err) {
        res.status(400).json(apiResponse(false, "Not able to delete Cart"));
    }
};