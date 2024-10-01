const express = require('express');
const { fetchAllCategory, createCategory } = require('../controller/category.controller');

const router = express.Router();
router
    .get('/', fetchAllCategory)
    .post('/', createCategory);

exports.router = router;