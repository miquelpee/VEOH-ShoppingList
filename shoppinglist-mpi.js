const express = require('express');             //Hakee moduulin, palauttaa funktion millä voi luoda serveri objektin
const PORT = process.env.PORT || 8080;          //Kysytään porttinumero ja ellei saada niin portti on 8080
const body_parser = require('body-parser');
//const session = require('express-session');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const shoplist_schema = new Schema({
    item: {
        type: String,
        required: true
    },
    quantity: {
        type: Number,
        required: true
    }
});

const shoplist_model = mongoose.model('shoplist', shoplist_schema);

let app = express();

app.use(body_parser.urlencoded({                //Tämä tuo post viestiin bodyn
    extended: true
}));

app.use((req, res, next) => {                   //Käsittelijä funktio
    console.log(`path: ${req.path}`);           //Tulostetaan logia
    next();                                     //Jatkuu seuraavaan kuuntelijaan
});

app.get('/',(req, res, next) => {
    res.send(`ShoppingList App v1.0. Created by MPI.`);
})

app.get('/shoppinglist', (req, res, next)=> {
    res.write(`
    <html>
    <head><meta charset="utf-8"></head>
    <body>
        <form action="/addnew" method="POST">
            <div>
                <label for="item">Item</label>
                <input type="text" name="item" autofocus>
                <label for="qty">Quantity</label>
                <input type="number" name="qty" autofocus>           
                <button type="submit" class="add_button">Add to shopping list</button>
            </div>
        </form>`);
        //const test = shoplist.find();
        (`<div>
                <p>Content of your shopping list:</p> 
            </div>
        </div>
    </body>
    </html>
    `);
    res.end();
});

app.post('/addnew', (req, res, next) => {
    const item = req.body.item;
    const qty = req.body.qty;

    shoplist_model.findOne({
        item: item,
        quantity: qty
    }).then((shoplist) => {
        let new_item = new shoplist_model({
            item: item,
            quantity: qty
        });        
        new_item.save().then(() => {
            return res.redirect('/shoppinglist');
        });
    });
}); 

app.use((req,res,next) => {
    res.status(404);
    res.send(`Page not found!`);
});

const mongoose_url = 'mongodb+srv://db-user:3W9gF5v4lNrRRv4O@cluster0-2o1mk.azure.mongodb.net/test?retryWrites=true&w=majority';

mongoose.connect(mongoose_url, {
    useUnifiedTopology: true,
    useNewUrlParser: true
}).then(()=>{
    console.log('Mongoose connected');
    console.log('Start Express server');
    app.listen(PORT);
});