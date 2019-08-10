const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const token = req.header('auth-token');
    if (!token) return res.status(401).send('Access Denied');

    try {
        const verified = jwt.verify(token, process.env.TOKEN_SECRET);
        req.user = verified;
        next();
    } catch (err) {
        return res.status(401).send('Access Denied');
    }
};

const createToken = user => {
    return jwt.sign({ id: user.id }, process.env.TOKEN_SECRET, { expiresIn: '1h' });
};

module.exports.verifyToken = verifyToken;
module.exports.createToken = createToken;
