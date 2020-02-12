const express = require('express');             //Hakee moduulin, palauttaa funktion millä voi luoda serveri objektin
const PORT = process.env.PORT || 8080;          //Kysytään porttinumero ja ellei saada niin portti on 8080
const body_parser = require('body-parser');
const session = require('express-session');
const mongoose = require('mongoose');
const url = require('url');
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

const user_schema = new Schema({
    name: {
        type: String,
        required: true
    },
    shoplists: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'shoplist',                            //Viitataan aiemmin luotuun noteen
        required: true
    }]
});

const user_model = mongoose.model('user', user_schema);

let app = express();
let users = [];

app.use(body_parser.urlencoded({                //Tämä tuo post viestiin bodyn
    extended: true
}));

app.use(session({
    secret:'shoplistv10mpi',                        //Muodostetaan salausavain jolla autentikoidaan käyttäjä selaimen kanssa
    resave: true,                               //Istunnon aikakatkaisu
    saveUninitialized: true,
    cookie:{
        maxAge:1000000
    }
}));

app.use((req, res, next) => {                   //Käsittelijä funktio
    console.log(`path: ${req.path}`);           //Tulostetaan logia
    next();                                     //Jatkuu seuraavaan kuuntelijaan
});

const is_logged_handler = (req, res, next) => {
    if(!req.session.user){
        res.redirect('/login');                 //Jos ei aktiivista käyttäjää, ohjataan login sivulle
    }
    next();
};

app.use((req, res, next) => {                    //Haetaan tietokannasta käyttjän id
    if(!req.session.user){
        return next();
    }
    user_model.findById(req.session.user._id).then((user) => {
        req.user = user;
        next();
    }).catch((err) => {
        console.log(err);
        res.redirect('/login');
    });
}),

app.get('/login',  (req, res, next) => {
    res.write(`
        <html>
        <body>
            <h2>OHSU exercise 'Shopping list'. Created by Mika Pieniluoma.</h2>
            <form action="/login" method="POST">
                <input type="text" name="user_name">
                <button type="submit">Log in</button>
            </form>
            <form action="/register" method="POST">
                <input type="text" name="user_name">
                <button type="submit">Register</button>
            </form>
        </body>
        </html>
        `);
    res.end();
});

app.post('/register', (req, res, next) => {
    const user_name = req.body.user_name;

    user_model.findOne({
        name: user_name
    }).then((user) => {
        if(user)
        {            
            console.log('User name already registered!');
            return res.redirect('/');
        }
        let new_user = new user_model({
            name: user_name,
            notes: []                               //Alustetaan muistiinpanot
        });        
        new_user.save().then(() => {
            return res.redirect('/');
        });
    });
}); 

app.post('/login', (req, res, next) => {
    const user_name = req.body.user_name;

    user_model.findOne({
        name: user_name
    }).then((user) => {
        if(user)
        {
            req.session.user = user;
            return res.redirect('/');
        }
        res.redirect('/');
    });
});

app.post('/logout', (req, res, next) => {
    req.session.destroy();
    res.redirect('/login');
});

app.get('/', is_logged_handler, (req, res, next)=> {
    const user = req.user;
    user.populate('shoplists').execPopulate().then(() => { 
    console.log('user:', user);
        res.write(`
        <html>
        <body>
            Logged in as user: ${user.name}
            <form action="/logout" method="POST">
                <button type="submit">Log out</button>
            </form>
            <form action="/add-new-shoplist" method="POST">
                <input type="text" name="shoplist_name">
                <button type="submit">Add new shoplist</button>
            </form>
        </body>
        </html>`);
    
        user.shoplists.forEach((shoplist) => {        
        //res.write(shoplist.name);
        res.write(`
            <table>
                <tr>
                    <th>Shoplist name</th>
                    <th></th>
                    <th></th>
                </tr>
                <tr>
                    <th>${shoplist.name}</th>
                    <th>
                    <form action="/editshoplist/${shoplist._id}" method="GET">
                        <input type="hidden" name="shoplist_id" value="${shoplist._id}">
                        <button type="submit">Edit shoplist</button>
                    </form>
                    </th>
                    <th>
                    <form action="/delete-shoplist" method="POST">
                        <input type="hidden" name="shoplist_id" value="${shoplist._id}">
                        <button type="submit">Delete shoplist</button>
                    </form>
                    </th>
                </tr>
            </table>`);
            res.end();                
        });
    }); 
});

app.get('/editshoplist/:id', is_logged_handler, (req, res, next)=> {
    console.log('shoplist edit');
    const user = req.user;

    //Otetaan requestin URL:sta talteen shoplist id....
    const q = url.parse(req.url, true);
    const qdata = q.query;
    const shoplist_id = qdata.shoplist_id;

    user.populate('shoplists').execPopulate().then(() => { 
    console.log(user.shoplists);
    res.write(`
    <html>
    <body>
        <form action="/" method="GET">
            <button type="submit">Back to shoplists</button>
        </form>
        <form action="/add-new-product" method="POST">
            <label for="new_product_name">Product name</label>
            <input type="text" name="new_product_name">
            <label for="new_product_quantity">Quantity</label>
            <input type="number" name="new_product_quantity">
            <label for="new_product_image_url">Image URL</label>
            <input type="url" name="new_product_image_url">
            <input type="hidden" name="shoplist_id" value="${shoplist_id}">
            <button type="submit">Add new product to shoplist</button>
        </form>
    </body>
    </html>`);
    shoplist_model.findOne({
            _id: shoplist_id
    }).then((shoplist) => {
        console.log('1...' + shoplist);
        shoplist.populate('products').execPopulate().then(() => { 
            console.log('2...' + shoplist.products);
        shoplist.products.forEach((product) => {
            res.write(`
            <table>
                <tr>
                    <th>Product</th>
                    <th>Quantity</th>
                    <th>Image</th>
                </tr>
                <tr>
                    <td>${product.item}</td>
                    <td>${product.quantity}</td>
                    <td><img src="${product.image}" style="width:100px;height:100px;"></td>
                    <td>        
                        <form action="/delete-product" method="POST">
                            <input type="hidden" name="shoplist_id" value="${product._id}">
                            <button type="submit">Delete product from shoplist</button>
                        </form>
                    </td>
                </tr>
            </table>`);res.end();   
        }); 
    });
});
    
});
});

app.get('/shoplist/:id', (req, res, next) => {
    console.log('shoplist id get');
    const shoplist_id = req.params.id;
    shoplist_model.findOne({
        _id: shoplist_id
    }).then((shoplist)=> {
        res.send(shoplist.name);
    });
});

app.get('/editshoplist/:id', (req, res, next) => {
    console.log('shoplist id get');
    const shoplist_id = req.params.id;
    shoplist_model.findOne({
        _id: shoplist_id
    }).then(()=> {
        res.send(shoplist._id);
    });
});

app.post('/add-new-product', (req, res, next) => {
    const user = req.user;
    const shoplist_id = req.body.shoplist_id;
    console.log('add new product...');
        let new_product = product_model({
            item: req.body.new_product_name,
            quantity: req.body.new_product_quantity,
            image: req.body.new_product_image_url
        });
        console.log(new_product);
        console.log(user.shoplists);
        console.log(req.body.shoplist_id);

        const shoplist_name = req.body.shoplist_id;

        const backtoshoplist = '/editshoplist/' + shoplist_name + '?shoplist_id=' + shoplist_name

        shoplist_model.findOne({
            _id: shoplist_name
        }).then((shoplist) => {
            new_product.save().then(() => {
                console.log('product saved');
                console.log(shoplist);
                shoplist.products.push(new_product);                      
                shoplist.save().then(() => {
                    return res.redirect(backtoshoplist);                
                });       
            });
        });
    });

app.post('/add-new-shoplist', (req, res, next) => {
    const user = req.user;

   let new_shoplist = shoplist_model({
        name: req.body.shoplist_name,
        products: []
    }); 
    new_shoplist.save().then(() => {
        console.log('note saved');
        user.shoplists.push(new_shoplist);                      //Viittaus käyttäjään
        user.save().then(() => {
                return res.redirect('/');                   //Takaisin pääsivulle
        });       
    });
});

app.post('/delete-shoplist', (req, res, next) => {
    console.log('delete shoplist...');
    const user = req.user;
    const shoplist_id_to_delete = req.body.shoplist_id;
    
    //Poistetaan note -> user.notes
    const updated_shoplists = user.shoplists.filter((shoplist_id) => {
        return shoplist_id != shoplist_id_to_delete;
    });
    
    user.shoplists = updated_shoplists;
    
    //Remove note object from database
    user.save().then(() => {
        shoplist_model.findByIdAndRemove(shoplist_id_to_delete).then(() => {
            res.redirect('/');
         });       
    });
});

app.post('/delete-product', (req, res, next) => {
    console.log('delete product...');
    const user = req.user;
    const product_id_to_delete = req.body.product_id;
    
    //Poistetaan note -> user.notes
    const updated_products = shoplist.products.filter((product_id) => {
        return product_id != product_id_to_delete;
    });
    
    shoplist.products = updated_products;
    
    //Remove note object from database
    shoplist.save().then(() => {
        products_model.findByIdAndRemove(product_id_to_delete).then(() => {
            res.redirect('/');
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