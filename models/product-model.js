const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const product_schema = new Schema({
    item: {
        type: String,
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    image: {
        type: String,
        require: true
    }
});

const product_model = new mongoose.model('product', product_schema);

module.exports = product_model;