const express = require("express")
const path = require('path')
const Web3 = require('web3')
const app = express();


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

const contractArtifact = require("./build/contracts/E_voting_system.json");
const truffle_contract = require('@truffle/contract')
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
        res.sendFile(path.join(__dirname, './public/views/Admin_dash.html'))
    }
});

app.get("/admin_login", (req, res) => {
    res.sendFile(path.join(__dirname, './public/views/Admin_login.html'))
})

app.get("/usr_reg", (req, res) => {
    res.sendFile(path.join(__dirname, './public/views/user_reg.html'))
})
app.get("/usr_login", (req, res) => {
    res.sendFile(path.join(__dirname, './public/views/usr_login.html'))
})
app.post("/usr_login", (req, res) => {
    const e_vot = truffle_contract
    console.log(e_vot)
})
app.get("/logout", (req, res) => {
    res.redirect('/')
});

app.listen(8080, () => {
    console.log('Listening on port ' + 8080);
});