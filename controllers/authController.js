const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const generateRefreshToken = require('../utils/generateRefreshToken');
const jwt = require('jsonwebtoken');


const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');

const registerUser = async (req, res) => {
    const { fullName, email, password, role } = req.body;

    if (!fullName || !email || !password) {
        return res.status(400).json({ message: 'Please fill all fields' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
        return res.status(400).json({ message: 'Email already registered' });
    }

    const user = await User.create({
        fullName,
        email,
        password,
        role: role || 'patient',
    });

    const accessToken = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    user.refreshToken = refreshToken;

    const verificationToken = crypto.randomBytes(32).toString('hex');
    user.verificationToken = verificationToken;

    await user.save();

    const verifyUrl = `http://localhost:5000/api/auth/verify-email/${verificationToken}`;
    const message = `<p>Hello ${user.fullName},</p>
                     <p>Click <a href="${verifyUrl}">here</a> to verify your email.</p>`;

    try {
        await sendEmail(user.email, 'Verify your email', message);
    } catch (error) {
        console.error('Error sending email:', error.message);
    }

    res.status(201).json({
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        token: accessToken,
        refreshToken,
        message: 'Verification email sent!',
    });
};

// @desc   Resend verification email
// @route  POST /api/auth/resend-verification
// @access Public
const resendVerification = async (req, res) => {
    const { email } = req.body;

    if (!email) return res.status(400).json({ message: 'Please provide your email' });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user.isVerified) {
        return res.status(400).json({ message: 'User is already verified' });
    }

    // Generate a new verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    user.verificationToken = verificationToken;
    await user.save();

    // Send verification email
    const verifyUrl = `http://localhost:5000/api/auth/verify-email/${verificationToken}`;
    const message = `<p>Hello ${user.fullName},</p>
                     <p>Click <a href="${verifyUrl}">here</a> to verify your email.</p>`;

    await sendEmail(user.email, 'Verify your email', message);

    res.json({ message: 'Verification email resent!' });
};


const authUser = async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
        // ✅ Create tokens inside the if-block
        const accessToken = generateToken(user._id);
        const refreshToken = generateRefreshToken(user._id);

        // ✅ Store refresh token in DB
        user.refreshToken = refreshToken;
        await user.save();

        // ✅ Send response
        res.json({
            _id: user._id,
            fullName: user.fullName,
            email: user.email,
            role: user.role,
            token: accessToken,
            refreshToken,
        });
    } else {
        res.status(401).json({ message: 'Invalid email or password' });
    }
};




const getMe = async (req, res) => {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
};

const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        await user.deleteOne();
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateMe = async (req, res) => {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const { fullName, email, password } = req.body;
    if (fullName) user.fullName = fullName;
    if (email) user.email = email;
    if (password) user.password = password;

    const updatedUser = await user.save();
    res.json({
        _id: updatedUser._id,
        fullName: updatedUser.fullName,
        email: updatedUser.email,
        role: updatedUser.role,
        token: generateToken(updatedUser._id),
    });
};

const updateUserRole = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const { role } = req.body;
        if (!['patient', 'admin'].includes(role)) {
            return res.status(400).json({ message: 'Invalid role' });
        }

        user.role = role;
        const updatedUser = await user.save();
        res.json({
            _id: updatedUser._id,
            fullName: updatedUser.fullName,
            email: updatedUser.email,
            role: updatedUser.role,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const logoutUser = async (req, res) => {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.refreshToken = null;
    await user.save();

    res.json({ message: 'Logged out successfully' });
};


const refreshAccessToken = async (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        return res.status(401).json({ message: 'No refresh token' });
    }

    try {
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
        const user = await User.findById(decoded.id);

        if (!user || user.refreshToken !== refreshToken) {
            return res.status(403).json({ message: 'Invalid refresh token' });
        }

        const newAccessToken = generateToken(user._id);

        res.json({ token: newAccessToken });
    } catch (error) {
        res.status(403).json({ message: 'Invalid or expired refresh token' });
    }
};

// @desc   Verify user email
// @route  GET /api/auth/verify-email/:token
// @access Public
const verifyEmail = async (req, res) => {
    const { token } = req.params;

    const user = await User.findOne({ verificationToken: token });
    if (!user) {
        return res.status(400).json({ message: 'Invalid or expired verification token' });
    }

    user.isVerified = true;
    user.verificationToken = null; // clear the token
    await user.save();

    res.json({ message: 'Email verified successfully!' });
};



// -------------------------
// Export all functions
// -------------------------
module.exports = {
    registerUser,
    authUser,
    getMe,
    getAllUsers,
    deleteUser,
    updateMe,
    updateUserRole,
    logoutUser,
    refreshAccessToken,
    verifyEmail,
    resendVerification,
};

