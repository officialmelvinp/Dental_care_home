const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    let token;

    // 1️⃣ Check if token exists
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        token = req.headers.authorization.split(' ')[1];
    }

    // 2️⃣ If no token, stop immediately
    if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token' });
    }

    try {
        // 3️⃣ Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // 4️⃣ Attach user to request
        req.user = await User.findById(decoded.id).select('-password');

        next(); // allow access
    } catch (error) {
        return res.status(401).json({ message: 'Not authorized, token failed' });
    }
};

// Admin role check
const admin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        return next();
    }

    return res.status(403).json({ message: 'Admin access only' });
};

module.exports = { protect, admin };
