const express = require("express")
const path = require('path')

const app = express();

app.use('/css', express.static(path.join(__dirname, './node_modules/bootstrap/dist/css')))
app.use('/js', express.static(path.join(__dirname, './node_modules/bootstrap/dist/js')))
app.use('/js', express.static(path.join(__dirname, './node_modules/jquery/dist')))
app.use('/js', express.static(path.join(__dirname, './node_modules/bootstrap/js/src')))
app.use('/js', express.static(path.join(__dirname, './node_modules/web3/dist')))
app.use('/js', express.static(path.join(__dirname, './node_modules/@truffle/contract/dist')))
app.use('/json', express.static(path.join(__dirname, './build/contracts')))
app.use('/static', express.static(path.join(__dirname, './public')))

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, './public/views/index.html'))
});

app.get("/admin", (req, res) => {
    res.sendFile(path.join(__dirname, './public/views/Admin_dash.html'))
});
app.get("/logout", (req, res) => {
    res.redirect('/')
});

app.listen(8080, () => {
    console.log('Listening on port ' + 8080);
});