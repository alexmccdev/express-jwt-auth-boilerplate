const bcrypt = require('bcryptjs');

const User = require('../models/User');
const { createToken } = require('../helpers/jwt');
const { registerValidation, loginValidation } = require('../helpers/formValidation');

exports.register = async (req, res) => {
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
        return res.cookie('token', token, { httpOnly: true }).send({
            user: {
                id: savedUser.id,
                username: savedUser.username,
                email: savedUser.email
            }
        });
    } catch (err) {
        return res.status(400).send(err);
    }
};

exports.login = async (req, res) => {
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
    return res.cookie('token', token, { httpOnly: true }).send({
        user: {
            id: user.id,
            username: user.username,
            email: user.email
        }
    });
};

exports.logout = (req, res) => {
    return res.clearCookie('token').sendStatus(200);
};

exports.check = (req, res) => {
    try {
        User.findById(req.user.id)
            .select('-password')
            .then(user => {
                return res.send({
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
};
