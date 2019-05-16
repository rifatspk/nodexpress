const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');

let User = require('../models/users');


// Register Form
router.get('/register', function (req, res) {
    res.render('register');
});


router.post('/register', function (req, res) {
    const name = req.body.name;
    const email = req.body.email;
    const username = req.body.username;
    const password = req.body.password;
    const password2 = req.body.password2;

    req.checkBody('name', 'Name is Required').notEmpty();
    req.checkBody('email', 'Email is Required').notEmpty();
    req.checkBody('email', 'Email is valid').isEmail();
    req.checkBody('username', 'Username is Required').notEmpty();
    req.checkBody('password', 'Password is Required').notEmpty();
    req.checkBody('password2', 'Password did not match').equals(req.body.password);
    let errors = req.validationErrors();

    if (errors) {
        res.render('register', {
            errors: errors
        });
    } else {

        let newUser = new User({
            name: name,
            email: email,
            username: username,
            password: password
        });

        bcrypt.genSalt(10, function (err, salt) {
            bcrypt.hash(newUser.password, salt, function (err, hash) {
                if (err) {
                    console.log(err);
                }
                newUser.password = hash;
                newUser.save(function (err) {
                    if (err) {
                        console.log(err);
                        return;
                    } else {
                        req.flash('success', 'You are now Registered and log in');
                        res.redirect('/users/login');
                    }
                });
            });
        });
    }

});

// Login Form
router.get('/login', function (req, res) {
    res.render('login');
});


// Login Process

router.post('/login', function (req, res, next) {
    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/users/login',
        failureFlash: true
    })(req, res, next);
});

// Logout
router.get('/logout', function (req, res) {
    req.logout();
    req.flash('success', 'You are successfully loggedout');
    res.redirect('/');
});


module.exports = router;



