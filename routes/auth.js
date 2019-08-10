const router = require('express').Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const { verifyToken, createToken } = require('../helpers/jwt');
const { registerValidation, loginValidation } = require('../helpers/formValidation');

// Register user and sign them in
router.post('/register', async (req, res) => {
    // Validate before we create user
    const { error } = registerValidation(req.body);
    if (error) return res.status(400).send(error);

    // Check if user is new
    const emailExists = await User.findOne({ email: req.body.email });
    if (emailExists) return res.status(400).send('Email exists');

    // Hash that pass
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    // Create a new user
    const user = new User({
        username: req.body.username,
        email: req.body.email,
        password: hashedPassword
    });

    // Save that user
    try {
        const savedUser = await user.save();

        // Create and assign token
        const token = createToken(savedUser);
        return res.header('auth-token', token).send({
            token,
            user: {
                id: savedUser.id,
                username: savedUser.username,
                email: savedUser.email
            }
        });
    } catch (err) {
        return res.status(400).send(err);
    }
});

// Login User
router.post('/login', async (req, res) => {
    // Validate before we login user
    const { error } = loginValidation(req.body);
    if (error) return res.status(400).send(error);

    // Check if user email exists
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(400).send('Email or password is incorrect');

    // Password is correct?
    const validPassword = await bcrypt.compare(req.body.password, user.password);
    if (!validPassword) return res.status(400).send('Email or password is incorrect');

    // Create and assign token
    const token = createToken(user);
    return res.header('auth-token', token).send({
        token,
        user: {
            id: user.id,
            username: user.username,
            email: user.email
        }
    });
});

// Get user if signed in.
router.get('/user', verifyToken, (req, res) => {
    const token = req.header('auth-token');
    try {
        User.findById(req.user.id)
            .select('-password')
            .then(user => {
                return res.send({
                    token,
                    user: {
                        id: user.id,
                        username: user.username,
                        email: user.email
                    }
                });
            });
    } catch (err) {
        return res.status(400).send(err);
    }
});

module.exports = router;
