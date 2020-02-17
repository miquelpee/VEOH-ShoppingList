const shoplist_model = require('../models/shoplist-model');
const product_model = require('../models/product-model');
const shoplist_views = require('../views/shoplist-views');
const url = require('url');

const get_shoplists = (req, res, next)=> {
    const user = req.user;
    user.populate('shoplists').execPopulate().then(() => { 
    console.log('user:', user);
    let data = {
        user_name: user.name,
        shoplists: user.shoplists
    };

    let html = shoplist_views.shoplists_view(data);
    res.send(html); 
    }); 
};

const get_edit_shoplist = (req, res, next)=> {
    console.log('shoplist edit');
    const user = req.user;

    //Otetaan requestin URL:sta talteen shoplist id....
    const q = url.parse(req.url, true);
    const qdata = q.query;
    const shoplist_id = qdata.shoplist_id;

    let html,html1,html2;

    user.populate('shoplists').execPopulate().then(() => { 
        let data1 = {
            shoplist_id: shoplist_id,
            shoplists: user.shoplists
        };
        html1 = shoplist_views.edit_shoplist_view1(data1);

        shoplist_model.findOne({
            _id: shoplist_id
        }).then((shoplist) => {
            shoplist.populate('products').execPopulate().then(() => { 
                let data2 = {
                    shoplist: shoplist.products
                };
            html2 = shoplist_views.edit_shoplist_view2(data2);
            html = html1.concat(html2);     
            console.log(html);       
            res.send(html); 
            }); 
        });
    });
};

const get_shoplistid = (req, res, next) => {
    console.log('shoplist id get');
    const shoplist_id = req.params.id;
    shoplist_model.findOne({
        _id: shoplist_id
    }).then((shoplist)=> {
        res.send(shoplist.name);
    });
};

const get_editshoplistid = (req, res, next) => {
    console.log('shoplist id get');
    const shoplist_id = req.params.id;
    shoplist_model.findOne({
        _id: shoplist_id
    }).then(()=> {
        res.send(shoplist._id);
    });
};

const post_add_new_product = (req, res, next) => {
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
    };

const post_add_new_shoplist = (req, res, next) => {
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
};

const post_delete_shoplist = (req, res, next) => {
    console.log('delete shoplist...');
    const user = req.user;
    const shoplist_id_to_delete = req.body.shoplist_id;
    
    //Poistetaan shoplist -> user.shoplists
    const updated_shoplists = user.shoplists.filter((shoplist_id) => {
        return shoplist_id != shoplist_id_to_delete;
    });
    
    user.shoplists = updated_shoplists;
    
    //Remove shoplist object from database
    user.save().then(() => {
        shoplist_model.findByIdAndRemove(shoplist_id_to_delete).then(() => {
            res.redirect('/');
         });       
    });
};

const post_delete_product = (req, res, next) => {
    console.log('delete product...');
    const user = req.user;
    const product_id_to_delete = req.body.product_id;

    //Otetaan requestista talteen shoplist id....
    const q = url.parse(req.headers.referer, true);
    const qdata = q.query;
    const shoplist_id = qdata.shoplist_id;

    console.log(user);
    console.log(user.shoplists);

    let current_products;

    
    shoplist_model.findOne({
        _id: shoplist_id
    }).then((shoplist) => {
        console.log(shoplist);
        console.log(shoplist_model);
        //shoplist_model.findByIdAndRemove({products: ObjectIdproduct_id_to_delete});
        });

        //console.log(shoplist);
        //console.log(shoplist.products);
        //shoplist.collection("products").remove(product_id_to_delete,function(err, obj){});
        //shoplist.update({'products': product_id_to_delete},{$pull: {'products': product_id_to_delete}});

        //shoplists.findByIdAndUpdate(user,
        //  {$pull: {products:  product_id_to_delete}},
        // {safe: true, upsert: true});
    
    const backtoshoplist = '/editshoplist/' + shoplist_id + '?shoplist_id=' + shoplist_id

    product_model.findOne({
        _id: product_id_to_delete
    }).then((product) => {
        product_model.findByIdAndRemove(product_id_to_delete).then(() => {
            res.redirect(backtoshoplist);
    });            
    });
};

module.exports.get_shoplists = get_shoplists;
module.exports.get_edit_shoplist = get_edit_shoplist;
module.exports.get_shoplistid = get_shoplistid;
module.exports.get_editshoplistid = get_editshoplistid;
module.exports.post_add_new_product = post_add_new_product;
module.exports.post_add_new_shoplist = post_add_new_shoplist;
module.exports.post_delete_shoplist = post_delete_shoplist;
module.exports.post_delete_product = post_delete_product;