const { executeIfAuthorized, trySaveDoc } = require('../controllers/common');

module.exports = async function (req, res, next) {
    const name = req.params.name;
    const url = encodeURI(req.params.name);
    executeIfAuthorized(req, res, async (req, res) => {
        const category = new req.db.Category({ name });
        if (await trySaveDoc(category)) {
            res.status(200).json({ name, url });
        } else {
            res.status(409).json({ name, url });
        }
    });
};
