// service/create_jwt.js
const jwt = require('jsonwebtoken');

const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;

const generateToken = (res, userId, role) => {
    const token = jwt.sign({ userId, role }, JWT_SECRET_KEY, { expiresIn: '1d' } );

    // save the token in the cookie
    res.cookie('jwt', token, {
        httpOnly: true, // the token is not accessible to JavaScript
        secure: process.env.NODE_ENV === 'production', // Secure in production only
        sameSite: 'strict', // to prevent CSRF attacks
        maxAge: 24 * 60 * 60 * 1000, // cookie expiration time
    });

    return token; // return the token in case it is needed in another place
};

module.exports = { generateToken };