require('dotenv').config();
const secret = process.env.JWT_TOKEN;

const jwt = require('jsonwebtoken');

const User = require('../models/user');

const WithAuth = (req, res, next) => {
    let token = req.headers['x-access-token'];
    if (!token) {
        res.status(401).json({ error: 'Unauthorized: no token provided' });
    } else {
        jwt.verify(token, secret, function (error, decoded) {
            if (error) {
                res.status(401).json({ error: 'Unauthorized: invalid token' });
            } else {
                req.email = decoded.email;
                User.findOne({ email: req.email }).then(user => {
                    req.user = user;
                    next();
                }).catch(err => {
                    res.status(401).json(error);
                });
            }
        });
    }
}

module.exports = WithAuth;