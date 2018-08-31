const express = require('express')
const bodyParser = require('body-parser');
const app = express()
app.use(express.static('public'));
app.set('view engine', 'ejs')
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', function (req, res) {
  res.render('index');
})

app.post('/', function (req, res) {
  res.render('index');
  console.log(req.body.archivo);
})
app.listen(3001, function () {
  console.log('escuchando puerto 3001!')
})
