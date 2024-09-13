const { Cart } = require("../model/Cart");
const apiResponse = require("../utils/ApiResponse");

exports.fetchCartByUser = async (req, res) => {
    try {
        const { user } = req.query;
        console.log('user' , user);
        const carts = await Cart.find({user:user}).populate('user').populate('product');
        res.status(200).json(apiResponse(true, "fetched all Carts Successfully", carts));
    } catch (err) {
        res.status(400).json(apiResponse(false, "getting error in  cart fetching"));
    }
}

exports.addToCart = async (req, res) => {
    try {
        const cart = new Cart(req.body);
        const doc = await cart.save();
        res.status(201).json(apiResponse(true, "created Cart Successfully", doc));
    } catch (err) {
        console.log(err);
        res.status(400).json(apiResponse(false, "getting error in cart creation"));
    }
};