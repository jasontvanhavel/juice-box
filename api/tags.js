const express = require('express');
const { getAllTags } = require('../db');
const tagsRouter = express.Router();

tagsRouter.get('/', async (req, res) => {
    const tags = await getAllTags();

    res.send({tags});
});

module.exports = tagsRouter;