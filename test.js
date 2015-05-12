var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var Browser = require('zombie');
var hash = require('./md5.js');

app.use(bodyParser.urlencoded({ extended : true }));
app.use(bodyParser.json());

var port = process.env.PORT || 3000;

var router = express.Router();

router.route('/login').get(function(req, res) {
    res.json({"hi":"asdf"});
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
