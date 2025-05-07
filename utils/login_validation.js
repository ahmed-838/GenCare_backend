const loginValidation = (req, res, next) => {
    const { identifier, password } = req.body;
    
    if (!identifier) {
        return res.status(400).json({ error: 'Email or Phone is required' });
    }
    
    if (!password) {
        return res.status(400).json({ error: 'Password is required' });
    }
    
    if (password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }
    
    next();
};

module.exports = loginValidation;