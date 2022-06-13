const express = require('express');
const router = express.Router();
const User = require('../models/user');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const secret = process.env.JWT_TOKEN;
const withAuth = require('../middlewares/auth')

router.get('/', async (req, res) => {
    try {
        let users = await User.find({});
        res.json(users);
    } catch (error) {
        res.status(404).json({ error });
    }
});

router.get('/:id', async (req, res) => {
    try {
        let userId = req.params.id;
        let user = await User.findById(userId);
        res.json(user);
    } catch (error) {
        res.status(422).json({ error });
    }
});

router.put('/', withAuth, async function (req, res) {
    try {
        const { name, email } = req.body;
        var user = await User.findOneAndUpdate(
            { _id: req.user._id },
            { $set: { name: name, email: email } },
            { upsert: true, 'new': true }
        )
        res.json(user);
    } catch (error) {
        res.status(401).json({ error: error });
    }
});

router.put('/password', withAuth, async function (req, res) {
    try {
        const { password } = req.body;
        var user = await User.findOne({ _id: req.user._id })
        user.password = password
        user.save()
        res.json(user);
    } catch (error) {
        res.status(401).json({ error: error });
    }
});

router.delete('/', withAuth, async function (req, res) {
    try {
        let user = await User.findOne({ _id: req.user._id });
        await user.delete();
        res.json({ message: 'OK' }).status(201);
    } catch (error) {
        res.status(500).json({ error: error });
    }
});

router.post('/register', async (req, res) => {
    try {
        let { name, email, password } = req.body;
        let user = new User({ name, email, password });
        await user.save();
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: 'Error registering new user' });
        console.log(error);
    }
});

router.post('/login', async (req, res) => {
    try {
        let { email, password } = req.body;
        let user = await User.findOne({ email });
        if (!user) {
            res.status(422).json({ error: 'Invalid email or password' });
        } else {
            user.isValidPassword(password, function (error, same) {
                if (error) {
                    res.status(500).json({ error: 'Internal error, try again' });
                } else if (!same) {
                    res.status(422).json({ error: 'Invalid email or password' });
                } else {
                    let token = jwt.sign({ email }, secret, { expiresIn: '15d' });
                    res.json({ user: user, token: token });
                }
            });
        }
    } catch (error) {
        res.status(500).json({ error: 'Internal error, try again' });
    }
});

module.exports = router;