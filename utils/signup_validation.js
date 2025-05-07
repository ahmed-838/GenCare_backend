const signupValidation = (req, res, next) => {
    const { name, phone, email, password } = req.body;
    if (!name ) {
        return res.status(401).json({ error: 'Name is required' });
    }
    if (!phone) {
        return res.status(401).json({ error: 'Phone is required' });
    }
    if (!email) {
        return res.status(401).json({ error: 'Email is required' });
    }
    if (!password) {
        return res.status(401).json({ error: 'Password is required' });
    }
    if (phone.length !== 11) {
        return res.status(401).json({ error: 'Phone number must be 11 digits' });
    }
    if (email.length < 10) {
        return res.status(401).json({ error: 'Email must be at least 10 characters' });
    }
    if (password.length < 6) {
        return res.status(401).json({ error: 'Password must be at least 6 characters' });
    }
    if (name.length < 3) {
        return res.status(401).json({ error: 'Name must be at least 3 characters' });
    }
    next();
};

module.exports = signupValidation;
