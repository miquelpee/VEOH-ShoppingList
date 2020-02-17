const express = require('express');             
const PORT = process.env.PORT || 8080;          //Kysytään porttinumero ja ellei saada niin portti on 8080
const body_parser = require('body-parser');
const session = require('express-session');
const mongoose = require('mongoose');

//const Schema = mongoose.Schema;

//Controllers
const auth_controller = require('./controllers/auth_controller');
const shoplist_controller = require('./controllers/shoplist_controller');

//Models
//const user_model = require('./models/user-model.js');
//const shoplist_model = require('./models/shoplist-model.js');
//const product_model = require('./models/product-model.js');

//Views
//const auth_views = require('./views/auth-views.js');
//const shoplist_views = require('./views/shoplist-views.js');

let app = express();

app.use(body_parser.urlencoded({                //Tuodaan post viestiin bodyn
    extended: true
}));

app.use(session({
    secret:'shoplistv10mpi',                    //Muodostetaan salausavain jolla autentikoidaan käyttäjä selaimen kanssa
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

//CSS
app.use('/css', express.static('css'));

//Auth
app.use(auth_controller.handle_user);
app.get('/login', auth_controller.get_login);
app.post('/login', auth_controller.post_login);
app.post('/register', auth_controller.post_register);
app.post('/logout', auth_controller.post_logout);

//Shoplists
app.get('/', is_logged_handler, shoplist_controller.get_shoplists);
app.get('/editshoplist/:id', is_logged_handler, shoplist_controller.get_edit_shoplist);
app.get('/shoplist/:id', is_logged_handler, shoplist_controller.get_shoplistid);
app.get('/editshoplist/:id', is_logged_handler, shoplist_controller.get_editshoplistid);
app.post('/add-new-product', is_logged_handler, shoplist_controller.post_add_new_product);
app.post('/add-new-shoplist', is_logged_handler, shoplist_controller.post_add_new_shoplist);
app.post('/delete-shoplist', is_logged_handler, shoplist_controller.post_delete_shoplist);
app.post('/delete-product', is_logged_handler, shoplist_controller.post_delete_product);

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