const { User } = require("../model/User");
const apiResponse = require("../utils/ApiResponse");
const CustomError = require('../utils/customError');


exports.fetchUserById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id, 'name email id addresses role orders').exec();
        if (user) {
            res.status(200).json(apiResponse(true, "User fetched succesfully", user));
        }
        else {
            res.status(404).json(apiResponse(false, "User does not exist"));
        }
    } catch (error) {
        return next(new CustomError(error.message, 400));
    }
}

exports.updateUser = async (req, res) => {
    const { id } = req.params;
    try {
        const user = await User.findByIdAndUpdate(id, req.body, { new: true })
        res.status(200).json(apiResponse(true, "User Updated succesfully", user));
    } catch (err) {
        console.log(err);
        res.status(400).json(apiResponse(false, "User not fetched"));
    }
}

