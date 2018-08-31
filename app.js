const express = require('express')
const bodyParser = require('body-parser');
var formidable = require('formidable');
var fs = require('fs');
var XLSX = require('xlsx');
var soap = require('soap');
var url = "http://smpp2.telecochile.cl:4046/?wsdl";
var nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'marcelochris0@gmail.com',
    pass: '78912300aA'
  }
});

var mailOptions = {
  from: 'marcelochris0@gmail.com',
  to: 'corellanajara@hotmail.com,christianfuenzalidat@gmail.com',
  subject: 'Error en el servidor de sms',
  text: 'Probablemente el servidor de sms se cayó por una falla interna'
};

const app = express()
app.use(express.static('public'));
app.set('view engine', 'ejs')
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', function (req, res) {
  res.render('index', { error: null,resultado : null});
})

app.post('/', function (req, res) {
  try {
    var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
      var oldpath = files.archivo.path;
      console.log(oldpath);
      var newpath = __dirname + files.archivo.name;
      console.log(newpath);
      fs.rename(oldpath, newpath, function (err) {
        if (err) throw err;
        var hoja = XLSX.readFile(newpath);
        var nombres = hoja.SheetNames;
        var resultado = "";
        var datos = XLSX.utils.sheet_to_json(hoja.Sheets[nombres[0]]);
        for (var i = 0; i < datos.length; i++) {
          let numero = datos[i].numeros;
          let mensaje = datos[i].mensaje;
          soap.createClient(url, function(err, client) {
              var data = { clientid : 'christian' , clientpassword : 'chri2017', ani:'56821736345' ,dnis  :numero , message :mensaje}
              client.submitMsg(data,function(err,r){
                resultado = r;
                if (err ) {
                  res.render('index', { error: err , resultado : null });
                }

              });
          });
        }
        res.render('index', { error: null , resultado : resultado });


      });
    });
  } catch (e) {
    // mandar correo de que fallo
    transporter.sendMail(mailOptions, function(error, info){
      if (error) {
        console.log(error);
      } else {
        console.log('Email sent: ' + info.response);
      }
    });
  }

})
let puerto = 4000;
app.listen(puerto, function () {
  console.log('escuchando puerto '+puerto+'!')
})

/*
http.createServer(function (req, res) {
  if (req.url == '/fileupload') {
    var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
      var oldpath = files.filetoupload.path;
      console.log(oldpath);
      var newpath = __dirname + files.filetoupload.name;
      console.log(newpath);
      fs.rename(oldpath, newpath, function (err) {
        if (err) throw err;
        res.write('Archivo subido correctamente!');
        var hoja = XLSX.readFile(newpath);
        var nombres = hoja.SheetNames;
        var datos = XLSX.utils.sheet_to_json(hoja.Sheets[nombres[0]]);
        for (var i = 0; i < datos.length; i++) {
          let numero = datos[i].numeros;
          let mensaje = datos[i].mensaje;
          soap.createClient(url, function(err, client) {
                var data = { clientid : 'christian' , clientpassword : 'chri2017', ani:'56932841111' ,dnis  :numero , message :mensaje}
                client.submitMsg(data,function(err,resultado){
                  console.log(resultado)
                });
            });

        }
        /*
        excel2Json.parse(newpath, function(err, rows) {
          console.log(rows);
          let nombres = rows[0];
          let numeros = rows[1];
          res.write("Nombres!");
          for (var i = 0; i < nombres.length; i++) {
            res.write("<br>"+nombres[i]);
          }
          res.write("Numeros!");
          for (var i = 0; i < numeros.length; i++) {
            res.write("<br>"+numeros[i]);
          }
        });

        var sheets = [1];
        excel2Json.parse('./archivo.xlsx', sheets, function(err, data) {
            console.log(data);
            excel2Json.toJson(data, function(err, json) {
                console.log(json);
            });
        });

        res.end();
      });
 });
  } else {

  }
}).listen(8081);
  */
