const { Category } = require("../model/Category");
const apiResponse = require("../utils/ApiResponse");

exports.fetchAllCategory = async (req, res) => {
    try {
        const categories = await Category.find({}).exec();
        res.status(200).json(apiResponse(true, "fetched all Categories Successfully", categories));
    } catch (err) {
        res.status(400).json(apiResponse(false, "not able to fetched all Categories"));
    }
}

exports.createCategory = async (req, res) => {
    try {
        // We have to get this category from API body
        const category = new Category(req.body);
        const doc = await category.save();
        res.status(201).json(apiResponse(true, "created Category Successfully", doc));
    } catch (err) {
        console.log(err);
        res.status(400).json(apiResponse(false, "not able to created Category"));
    }
};