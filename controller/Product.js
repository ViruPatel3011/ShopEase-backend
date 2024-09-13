const { Product } = require("../model/Product");
const apiResponse = require("../utils/ApiResponse");

exports.createProduct = async (req, res) => {
    try {
        // We have to get this products from API body
        const product = new Product(req.body);
        console.log('product' , product);
        const doc = await product.save();
        res.status(201).json(apiResponse(true, "created product successfully",doc));
    } catch (err) {
        console.log(err);
        res.status(400).json(apiResponse(false, "not able to created product"));
    }
};

exports.fetchAllProducts = async (req, res) => {

    // filter = {"category":["smartphone","laptops"]}
    // sort = {_sort:"price",_order="desc"}
    // pagination = {_page:1,_limit=10}

    let query = Product.find({});
    let totalProductsQuery = Product.find({});

    if (req.query.category) {
        query = query.find({ category: req.query.category })
        totalProductsQuery = totalProductsQuery.find({ category: req.query.category })
    }

    if (req.query.brand) {
        query = query.find({ brand: req.query.brand })
        totalProductsQuery = totalProductsQuery.find({ brand: req.query.brand })
    }


    if (req.query._sort && req.query._order) {
        query = query.sort({ [req.query._sort]: req.query._order })
        totalProductsQuery = totalProductsQuery.sort({ [req.query._sort]: req.query._order })
    }

    const totalDocs = await totalProductsQuery.countDocuments().exec();
    console.log({ totalDocs });

    if (req.query._page && req.query._limit) {
        const pageSize = req.query._limit;
        const page = req.query._page;
        query = query.skip(pageSize * (page - 1)).limit(pageSize);
    }

    try {
        const doc = await query.exec();
        console.log('doc' , doc);
        res.set('X-Total-Count', totalDocs)
        res.status(200).json(doc);
    } catch (err) {
        console.log(err);
        res.status(400).json(apiResponse(false, "not able to fetched all products "));
    }
};

exports.fetchProductById = async (req, res) => {
    const { id } = req.params;
    try {
        const product = await Product.findById(id)
        res.status(200).json(apiResponse(true, "fetched product for user successfully", product));
    } catch (err) {
        console.log(err);
        res.status(400).json(apiResponse(false, "not able to fetched product for user"));
    }
}

exports.updateProduct = async (req, res) => {
    const { id } = req.params;
    try {
        const product = await Product.findByIdAndUpdate(id, req.body, { new: true })
        res.status(200).json(apiResponse(true, "update product for user successfully", product));
    } catch (err) {
        console.log(err);
        res.status(400).json(apiResponse(false, "not able to update product for user"));
    }
}