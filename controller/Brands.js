const { Brand } = require("../model/Brands")

exports.fetchAllBrands = async (req, res) => {
    try {
        const brands = await Brand.find({}).exec();
        res.status(200).json(brands);
    } catch (err) {
        res.status(400).json(err);
    }
}

exports.createBrand = async (req, res) => {
    try {
        // We have to get this brand from API body
        const brand = new Brand(req.body);
        const doc = await brand.save();
        res.status(201).json(doc);
    } catch (err) {
        console.log(err);
        res.status(400).json(err);
    }
};
