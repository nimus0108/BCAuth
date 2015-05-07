const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const Browser = require('zombie');
const hash = require('./md5.js');

app.use(bodyParser.urlencoded({ extended : true }));
app.use(bodyParser.json());

const port = process.env.PORT || 8080;

var router = express.Router();

router.use(function(req, res, next) {
    try {
        JSON.parse(str);
        console.log("Request received.");
        var username = req.body.username;
        var password = req.body.password;
        if (Object.keys(req.body).length > 2) {
            res.json({ 'code': 2, 'message': 'Too many arguments!' });
        } else if (!username || !password) {
            res.json({ 'code': 3, 'message': 'Username or password is missing.' });
        } else {
            next();
        }
    } catch (e) {
        res.json({ 'code': 1, 'message': 'Invalid JSON.' });
    }
});

router.route('/login').post(function(req, res) {
    var username = req.body.username;
    var password = req.body.password;
    const browser = new Browser();
    browser.visit('https://ps01.bergen.org/public', function(err) {
        if (err) {
            res.json({ 'code': 4, 'message': 'Error connecting to PowerSchool.' })
        } else {
            login(browser, username, password, res);
        }
    });
});

function login(browser, username, password, res) {
    var hashes = hashPassword(browser, password)
    browser
        .fill('input[name=account]', username)
        .fill('input[name=pw]', hashes[0])
        .fill('input[name=dbpw]', hashes[1])
        .fill('input[name=ldappassword]', password)
        .pressButton('Sign In', function() {
            verifySuccess(browser, res);
        });
}

function hashPassword(browser, plainPassword) {
    var pskey = browser.document.getElementById("contextData").value;
    var tempPw = hash.b64_md5(plainPassword);
    var hashedPw = hash.hex_hmac_md5(pskey, tempPw);
    var dbPw = hash.hex_hmac_md5(pskey, plainPassword.toLowerCase());
    return [ hashedPw, dbPw ];
}

function verifySuccess(browser, res) {
    if (browser.document.getElementById("btn-enter")) {
        res.json({ 'code': 5, 'message': 'Invalid Username or Password.' });
    } else if (browser.document.getElementById("btnLogout")) {
        res.json({ 'code': 0, 'message': 'Success.' });
    } else {
        res.json({ 'code': 6, 'message': 'Connection timed out.' });
    }
}

app.use('/bcauth/api', router);

app.listen(port);
console.log("Server started on port " + port + ".");