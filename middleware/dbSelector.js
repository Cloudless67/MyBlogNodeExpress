module.exports = (db) =>
    function (req, res, next) {
        let subdomain = req.header('HOST').split('.')[0];
        if (subdomain == 'www' || subdomain == 'localhost:3000')
            subdomain = process.env.DB_DEFAULT;

        db.changeDb(subdomain);
        req.db = db;
        next();
    };
