const express = require('express');
const router = express.Router();


// Article Model

let Article = require('../models/articles');

// User Model
let User = require('../models/users');






//Add Route 

router.get('/add', ensureAuthenticated, function (req, res) {
    res.render('add_articles', {
        title: 'Add New Articles'
    })
});


//Add Articles

router.post('/add', function (req, res) {
    req.checkBody('title', 'Title is Required').notEmpty();
    req.checkBody('body', 'Body is Required').notEmpty();


    let errors = req.validationErrors();
    if (errors) {
        res.render('add_articles', {
            title: 'Add Article',
            errors: errors
        });
    }
    else {
        let article = new Article();
        article.title = req.body.title;
        article.author = req.user._id;
        article.body = req.body.body;
        article.save(function (err) {
            if (err) {
                console.log(err);
                return;
            }
            else {
                req.flash('success', 'Article Added');
                res.redirect('/');
            }
        });
    }
});



//Edit Article
router.get('/edit/:id', ensureAuthenticated, function (req, res) {
    Article.findById(req.params.id, function (err, article) {
        let userid = User.findById();
        if (article.author != userid) {
            req.flash('danger', 'You are not authorised to change to post');
            res.redirect('/');
        }
        else {
            res.render('edit_article', {
                title: "Edit Article",
                article: article
            })
        }
    });
});


// Update Article

router.post('/edit/:id', function (req, res) {
    let article = {};
    article.title = req.body.title;
    article.author = req.body.author;
    article.body = req.body.body;

    let query = { _id: req.params.id }
    Article.update(query, article, function (err) {
        if (err) {
            console.log(err);
            return;
        }
        else {

            res.redirect('/');
        }
    });
});


//Get Single Article by ID
router.get('/:id', function (req, res) {
    Article.findById(req.params.id, function (err, article) {
        User.findById(article.author, function (err, user) {
            res.render('article', {
                article: article,
                author: user.name
            });
        });
    });
});


// Delete Data
router.delete('/:id', function (req, res) {
    let query = { _id: req.params.id }

    Article.remove(query, function (err) {
        if (err) {
            console.log(err);
        }

        else {


            res.send('Success');
        }
    })
});

// Access Control

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    } else {
        req.flash('danger', 'Please Login first');
        res.redirect('/users/login');
    }
}




module.exports = router;