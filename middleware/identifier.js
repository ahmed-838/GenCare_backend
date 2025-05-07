const User = require('../models/User');

const identifier = async (req, res, next) => {
    
    const { phone, email } = req.body;
    const user_phone = await User.findOne({ phone });
    const user_email = await User.findOne({ email });

    if (user_phone) {
        return res.status(401).json({ message: 'phone_already_exists' });
    }
    if (user_email) {
        return res.status(401).json({ message: 'email_already_exists' });
    }
    next();
}

module.exports = identifier;