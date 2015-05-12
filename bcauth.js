var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var Browser = require('zombie');
var hash = require('./md5.js');

app.use(bodyParser.urlencoded({ extended : true }));
app.use(bodyParser.json());

var port = process.env.PORT || 3000;

var router = express.Router();

router.post('/login', function(req, res) {
    if (verifyRequest(req, res)) {
        console.log('hi');
        var username = req.body.username;
        var password = req.body.password;
        var browser = new Browser();
        browser.visit('https://ps01.bergen.org/public', function(err) {
            if (err) {
                console.log("Request sent back with status: 4");
                // Error connecting to PowerSchool.
                res.json({ 'status': 4 })
            } else {
                login(browser, username, password, res);
            }
        });
    }
});

function verifyRequest(req, res) {
    try {
        console.log("Request received.");
        var body = JSON.parse(JSON.stringify(req.body));
        var username = body.username;
        var password = body.password;
        if (Object.keys(body).length > 2) {
            // Too many key/values!
            console.log("Request sent back with status: 2");
            res.json({ 'status': 2 });
            return false;
        } else if (!username || !password) {
            // Username or password is missing.
            console.log("Request sent back with status: 3");
            res.json({ 'status': 3 });
            return false;
        } else {
            return true;
        }
    } catch (e) {
        // Invalid JSON.
        console.log("Request sent back with status: 1");
        res.json({ 'status': 1 });
        return false;
    }
}

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
        console.log("Request sent back with status: 5");
        res.json({ 'status': 5 });
    } else if (browser.document.getElementById("btnLogout")) {
        // Success.
        console.log("Request sent back with status: 0");
        res.json({ 'status': 0 });
    } else {
        // Connection timed out.
        console.log("Request sent back with status: 6");
        res.json({ 'status': 6 });
    }
}

app.use('/', router);

app.listen(port);
console.log("Server started on port " + port + ".");
