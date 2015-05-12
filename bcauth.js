const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const Browser = require('zombie');
const hash = require('./md5.js');

app.use(bodyParser.urlencoded({ extended : true }));
app.use(bodyParser.json());

const port = process.env.PORT || 3000;

var router = express.Router();

router.use(function(req, res, next) {
    try {
        console.log("Request received.");
        var body = JSON.parse(JSON.stringify(req.body));
        var username = body.username;
        var password = body.password;
        if (Object.keys(body).length > 2) {
            // Too many key/values!
            res.json({ 'status': 2 });
        } else if (!username || !password) {
            // Username or password is missing.
            res.json({ 'status': 3 });
        } else {
            next();
        }
    } catch (e) {
        // Invalid JSON.
        res.json({ 'status': 1 });
    }
});

router.route('/login').post(function(req, res) {
    var username = req.body.username;
    var password = req.body.password;
    const browser = new Browser();
    browser.visit('https://ps01.bergen.org/public', function(err) {
        if (err) {
            // Error connecting to PowerSchool.
            res.json({ 'status': 4 })
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
        // Invalid Username or Password.
        res.json({ 'status': 5 });
    } else if (browser.document.getElementById("btnLogout")) {
        // Success.
        res.json({ 'status': 0 });
    } else {
        // Connection timed out.
        res.json({ 'status': 6 });
    }
}

app.use('/api', router);

app.listen(port);
console.log("Server started on port " + port + ".");