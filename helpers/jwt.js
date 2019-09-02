const jwt = require('jsonwebtoken');

exports.createToken = user => {
    return jwt.sign({ id: user.id }, process.env.TOKEN_SECRET, { expiresIn: '1h' });
};
