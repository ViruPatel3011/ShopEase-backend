const { Brand } = require("../model/Brands");
const apiResponse = require("../utils/ApiResponse");

exports.fetchAllBrands = async (req, res) => {
    try {
        const brands = await Brand.find({}).exec();
        res.status(200).json(apiResponse(true, "fetched all Brands Successfully", brands));
    } catch (err) {
        res.status(400).json(apiResponse(false, "not able to fetched Brands"));
    }
}

exports.createBrand = async (req, res) => {
    try {
        // We have to get this brand from API body
        const brand = new Brand(req.body);
        const doc = await brand.save();
        res.status(201).json(apiResponse(true, "Brand created Successfully", doc));
    } catch (err) {
        console.log(err);
        res.status(400).json(apiResponse(false, "Brand not created"));
    }
};
