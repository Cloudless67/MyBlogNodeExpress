const { tryComparePassword } = require('./common');

module.exports = {
    getLogin(req, res, next) {
        res.render('login', {
            session: req.session,
        });
    },

    async postLogin(req, res, next) {
        if (!idExists(req)) {
            res.render('error', '존재하지 않는 ID입니다.');
            next();
        } else if (
            !(await tryComparePassword(req.body.password, process.env.PASSWORD))
        ) {
            res.render('error', 'password가 일치하지 않습니다.');
            next();
        } else {
            login(req, res);
        }
    },

    logout(req, res, next) {
        delete req.session.nickname;
        req.session.save((err) => {
            if (err) throw err;
            res.redirect('/');
        });
    },
};

function idExists(req) {
    return req.body.id === process.env.ID;
}

function login(req, res) {
    req.session.nickname = req.body.id;
    req.session.save((err) => {
        if (err) throw err;
        res.redirect('/');
    });
}

function renderErrorPage(res, message) {
    res.render('error', { message });
}
