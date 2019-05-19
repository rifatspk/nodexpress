const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');
const flash = require('connect-flash');
const session = require('express-session');
const config = require('./config/database');
const passport = require('passport');


// Database connection
mongoose.connect(config.database, { useNewUrlParser: true });


let db = mongoose.connection;
// Check Connection

db.once('open', function () {
    console.log("Connected To MongoDB");
});

// check for db error
db.on('error', function (err) {
    console.log(err);
})


//init app
const app = express();

app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())


app.use(express.static(path.join(__dirname, 'public')));

// Bring In Models
// Article Model
let Article = require('./models/articles');
// User Model
let User = require('./models/users');

// Load view Engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');



// Expression Session Middleware
app.use(session({
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized: true

}));
// Express Message Middleware
app.use(require('connect-flash')());
app.use(function (req, res, next) {
    res.locals.messages = require('express-messages')(req, res);
    next();
});

// ExpressValidator Middleware
app.use(expressValidator({
    errorFormatter: function (param, msg, value) {
        var namespace = param.split('.'),
            root = namespace.shift()
            , formParam = root;

        while (namespace.length) {
            formParam += '[' + namespace.shift() + ']';
        }
        return {
            param: formParam,
            msg: msg,
            value: value
        };
    }
}));

// Passport Config
require('./config/passport')(passport);
// Passport initialize 
app.use(passport.initialize());
app.use(passport.session());

app.get('*', function (req, res, next) {
    res.locals.users = req.user || null;
    next();
})


//Home route
app.get('/', function (req, res) {


    let articles = Article.find({}, function (err, articles) {
        if (err) {
            console.log(err);
        } else {
            res.render('index', {
                title: "All Articles",
                articles: articles

            });
        }

    });

});


let articles = require('./routes/articles');
let users = require('./routes/users');
app.use('/articles', articles);
app.use('/users', users);




//Start Server
const port = process.env.PORT || 5000;

app.listen(port, function () {
    console.log(`server started on port:${port}`);
});



