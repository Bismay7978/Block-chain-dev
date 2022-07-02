const express = require("express")
const path = require('path')
const Web3 = require('web3')
const app = express();
const sqlite = require('sqlite3').verbose();
const db = new sqlite.Database('./user_data.db');
const session = require('express-session')
const fetch = require('https')

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// app.use(bodyParser.urlencoded());
// app.use(bodyParser.json());
app.use('/css', express.static(path.join(__dirname, './node_modules/bootstrap/dist/css')))
app.use('/js', express.static(path.join(__dirname, './node_modules/bootstrap/dist/js')))
app.use('/js', express.static(path.join(__dirname, './node_modules/jquery/dist')))
app.use('/js', express.static(path.join(__dirname, './node_modules/bootstrap/js/src')))
app.use('/js', express.static(path.join(__dirname, './node_modules/web3/dist')))
app.use('/js', express.static(path.join(__dirname, './node_modules/@truffle/contract/dist')))
app.use('/json', express.static(path.join(__dirname, './build/contracts')))
app.use('/static', express.static(path.join(__dirname, './public')))
app.use(session({
    secret: 'keyboard cat 343545',
    resave: false,
    saveUninitialized: true,
    cookie: {}
}))

app.set("views", path.join(__dirname, './public/views'));
app.engine('.html', require('ejs').renderFile);
app.set('view engine', 'html');

const contractArtifact = require("./build/contracts/E_voting_system.json");
const truffle_contract = require('@truffle/contract');
const { render } = require("ejs");
var provider = new Web3.providers.HttpProvider('HTTP://127.0.0.1:7545');



app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, './public/views/index.html'))
});

app.post("/admin", async (req, res) => {
    const contract = truffle_contract(contractArtifact)
    contract.setProvider(provider)
    const e_vot = await contract.deployed()
    // contract.setNetwork('5777')
    console.log(req.body.Email, req.body.pass_word)
    success = await e_vot.chair_login(req.body.Email, req.body.pass_word)
    console.log(success)
    if (success) {
        req.session.adm_mail = req.body.Email
        console.log(req.session)
        res.redirect('/admin')
    }
    else {
        res.render("Admin_login", { er: true, msg: "wrong credentials" })
    }
});
app.get('/data', (req, res) => {
    if (req.session.id) {
        console.log(res)
        res.json({ email: req.session.Email, area: req.session.area, aadhar: req.session.usr_id })
        console.log(res)
    }
    else {
        res.redirect('/usr_login', { er: false })
    }
})
app.get("/admin", (req, res) => {
    if (req.session.adm_mail) {
        res.render("Admin_dash", { er: false })
    }
    else {
        res.redirect("/admin_login")
    }
})

app.post("/voter", async (req, res) => {
    const contract = truffle_contract(contractArtifact)
    contract.setProvider(provider)
    const e_vot = await contract.deployed()
    // contract.setNetwork('5777')
    console.log(req.body.Email, req.body.pass_word)
    success = await e_vot.voterLogin(req.body.Email, req.body.pass_word)
    console.log(success[0])
    if (success[0]) {
        req.session.usr_id = success[2].toNumber()
        req.session.Email = req.body.Email
        req.session.area = success[3]
        console.log(req.session)
        res.redirect("/voter")
    }
    else {
        res.render("usr_login", { er: true, msg: "wrong credentials" })
    }
});

app.get("/voter", (req, res) => {
    if (req.session.usr_id) {
        res.render("Voter_dash", { eml: req.session.Email })
    }
    else {
        res.redirect("/usr_login", { er: false })
    }
})

app.get("/admin_login", (req, res) => {
    console.log(req.session.adm_mail)
    if (req.session.adm_mail) {
        res.redirect('/admin')
    }
    else (
        res.render("Admin_login", { er: false })
    )
})

app.get("/usr_reg", (req, res) => {
    res.sendFile(path.join(__dirname, './public/views/user_reg.html'))
})
app.get("/usr_login", (req, res) => {
    console.log(req.session.usr_id)
    if (req.session.usr_id) {
        res.redirect('/voter')
    }
    else (
        res.render("usr_login", { er: false })
    )
})

app.get("/logout", (req, res) => {
    req.session.destroy((err) => {
        console.log(err)
    })
    res.redirect('/')
});

app.get("/admin_logout", (req, res) => {
    req.session.destroy((err) => {
        console.log(err)
    })
    res.redirect('/')
});

app.listen(8080, () => {
    console.log('Listening on port ' + 8080);
    cities = fetch.request('https://raw.githubusercontent.com/dr5hn/countries-states-cities-database/master/cities.json', data => { console.log(data) }) //4013
});