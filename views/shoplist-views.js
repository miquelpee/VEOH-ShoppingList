const shoplist_model = require('../models/shoplist-model');

const shoplists_view = ((data) => {
    let html = `
        <html>
            <head>
                <meta charset="utf-8">
                <link rel="stylesheet" href="/css/style.css">
            </head>
        <body>
            <h2>Logged in as user: ${data.user_name}
            <form action="/logout" method="POST">
                <button type="submit" class="button">Log out</button>
            </form></h2>
            <form action="/add-new-shoplist" method="POST">
                <input type="text" name="shoplist_name">
                <button type="submit" class="button">Add new shoplist</button>
            </form>
        </body>
        </html>`;
    
        data.shoplists.forEach((shoplist) => {
        html += `
        <html>
            <head>
                <meta charset="utf-8">
                <link rel="stylesheet" href="/css/style.css">
            </head>
        <body>
            <table class="center">
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
                        <button type="submit" class="button">Edit shoplist</button>
                    </form>
                    </th>
                    <th>
                    <form action="/delete-shoplist" method="POST">
                        <input type="hidden" name="shoplist_id" value="${shoplist._id}">
                        <button type="submit" class="button">Delete shoplist</button>
                    </form>
                    </th>
                </tr>
            </table>
        </body>
        </html>`;
    }); 
    return html;    
});   

const edit_shoplist_view1 = ((data) => {
    let html = `
    <html>
    <head>
        <meta charset="utf-8">
        <link rel="stylesheet" href="/css/style.css">
    </head>
    <body>
        <h2><form action="/" method="GET">
            <button type="submit" class="button">Back to shoplists</button>
        </form></h2>
        <form action="/add-new-product" method="POST">
            <label for="new_product_name">Product name</label>
            <input type="text" name="new_product_name">
            <label for="new_product_quantity">Quantity</label>
            <input type="number" name="new_product_quantity">
            <label for="new_product_image_url">Image URL</label>
            <input type="url" name="new_product_image_url">
            <input type="hidden" name="shoplist_id" value="${data.shoplist_id}">
            <button type="submit" class="button">Add new product to shoplist</button>
        </form>
        </body>
        </html>`;
        return html;
    });  

 const edit_shoplist_view2 =((data) => {
     let html = '';
    data.shoplist.forEach((product) => {
       html += `
<html>
<head>
    <meta charset="utf-8">
    <link rel="stylesheet" href="/css/style.css">
</head>
<body>
<table class="center">
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
                <input type="hidden" name="product_id" value="${product._id}">
                <button type="submit" class="button">Delete product from shoplist</button>
            </form>
        </td>
    </tr>
</table>
</body>
</html>`;
});  
return html;
});  


module.exports.shoplists_view = shoplists_view;
module.exports.edit_shoplist_view1 = edit_shoplist_view1;
module.exports.edit_shoplist_view2 = edit_shoplist_view2;