const { Category } = require("../model/Category");

exports.fetchAllCategory = async (req, res) => {
    try {
        const categories = await Category.find({}).exec();
        res.status(200).json(categories);
    } catch (err) {
        res.status(400).json(err);
    }
}

exports.createCategory = async (req, res) => {
    try {
        // We have to get this category from API body
        const category = new Category(req.body);
        const doc = await category.save();
        res.status(201).json(doc);
    } catch (err) {
        console.log(err);
        res.status(400).json(err);
    }
};