const login_view = () => {
    let html = `
        <html>
        <head>
            <meta charset="utf-8">
            <link rel="stylesheet" href="css/style.css">
        </head>
    <body>
        <h2>OHSU19 exercise 'Shopping list'. Created by Mika Pieniluoma.</h2>
        <form action="/login" method="POST">
            <input type="text" name="user_name" >
            <button type="submit" class="button">Log in</button>
        </form>
        <form action="/register" method="POST">
            <input type="text" name="user_name">
            <button type="submit" class="button">Register</button>
        </form>
    </body>
    </html> `;
    return html;
}

module.exports.login_view = login_view;