const { User } = require("../model/User");
const crypto = require('crypto');
const apiResponse = require("../utils/ApiResponse");
const { sanitizedUser } = require("../services/common");
const SECRET_KEY = 'SECRET_KEY';
const jwt = require('jsonwebtoken');


exports.createUser = async (req, res) => {
    try {
        // We have to get this category from API body
        var salt = crypto.randomBytes(16);
        crypto.pbkdf2(req.body.password, salt, 310000, 32, 'sha256', async function (err, hashedPassword) {
            const user = new User({ ...req.body, password: hashedPassword, salt });
            const doc = await user.save();
            req.login(sanitizedUser(user), (err) => { // this also calles serializer and adds to session
                if (err) {
                    res.status(400).json(apiResponse(false, "something Wrong Creating User"));
                }
                else {
                    const token = jwt.sign(sanitizedUser(user), SECRET_KEY);
                    res.status(201).json(apiResponse(true, "User Created Successfully", token));
                }
            });
        }
        );
    } catch (err) {
        console.log(err);
        res.status(400).json(apiResponse(false, "something Wrong Creating User"));
    }
};

exports.loginUser = async (req, res) => {
    res.json(req.user);
};

exports.checkUser = async (req, res) => {
    res.json({ status: 'succes', user: req.user });
};