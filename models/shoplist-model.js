const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const shoplist_schema = new Schema({
    name: {
        type: String,
        required: true,
    },
    products: [{    
            type: mongoose.Schema.Types.ObjectId,
            ref: 'product', 
            required: true        
    }]
});

const shoplist_model = new mongoose.model('shoplist', shoplist_schema);

module.exports = shoplist_model;