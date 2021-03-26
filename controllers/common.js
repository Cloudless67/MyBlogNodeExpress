const bcrypt = require('bcrypt');

module.exports = {
    isAuthorized(req) {
        return req.session.nickname !== undefined;
    },

    async executeIfAuthorized(req, res, func) {
        if (req.session.nickname !== undefined) {
            await func(req, res);
        } else {
            res.render('error', { message: '로그인이 필요합니다.' });
        }
    },

    async tryHash(password) {
        try {
            return await bcrypt.hash(password, 10);
        } catch (error) {
            console.error(error);
            return false;
        }
    },

    async tryComparePassword(password1, password2) {
        try {
            return await bcrypt.compare(password1, password2);
        } catch (error) {
            console.error(error);
            return false;
        }
    },

    async tryDeleteFromModel(model, query) {
        try {
            await model.deleteOne(query);
            return true;
        } catch (error) {
            console.error(error);
            return false;
        }
    },

    /**
     * @param {Model} model
     * @param {Object} filter
     * @param {Object} doc
     */
    async tryUpdateDocFromModel(model, filter, doc) {
        try {
            await model.updateOne(filter, doc);
            return true;
        } catch (error) {
            console.error(error);
            return false;
        }
    },

    async tryReadFromModel(model, query) {
        try {
            return await model.find(query);
        } catch (error) {
            console.error(error);
            return false;
        }
    },

    async trySaveDoc(doc) {
        try {
            await doc.save();
            return true;
        } catch (error) {
            console.error(error);
            return false;
        }
    },

    redirect(res, url) {
        res.status(200).redirect(url);
    },
};
