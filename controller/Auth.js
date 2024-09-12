const { User } = require("../model/User");
const apiResponse = require("../utils/ApiResponse");

exports.createUser = async (req, res) => {
    try {
        // We have to get this category from API body
        const user = new User(req.body);
        const doc = await user.save();
        res.status(201).json(doc);
    } catch (err) {
        console.log(err);
        res.status(400).json(err);
    }
};

exports.loginUser = async (req, res) => {
    try {
        // We have to get this category from API body
        const user = await User.findOne({ email: req.body.email });
        if (!user) {
            res.status(401).json(apiResponse(false, "No such user email found"));
        }
        else if (user.password == req.body.password) {
            res.status(201).json(apiResponse(true, "Logged In successfully", user));
        }
        else {
            res.status(401).json(apiResponse(false, "Invalid Credentials"));

        }
    } catch (err) {
        console.log(err);
        res.status(400).json(apiResponse(false, err));
    }
};