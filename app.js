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
  res.render('subirLista', { error: null,resultado : null,contenido:null});
})
/*

Esto es para subir un excel y direcamente mandarlo mediante el api de teleco

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


*/


app.post('/subirLista', function (req, res) {
  let resultado = "salio bien";
  //res.render('subirLista', { error: null , resultado : resultado });
  //console.log(req);
  try {
    
      
      //var oldpath = files.archivo.path;
      //console.log(files.nombre);
      let lista = req.body.nombre;
      var contenido = '<div class="input-group"><span class="input-group-btn"><span class="btn btn-primary btn-file">Buscar&hellip;<input id="file_url" type="file" name="archivo" multiple></span></span><input type="text" class="form-control" readonly></div>';
      res.render('subirArchivo', { error: null , resultado : lista ,contenido : contenido});
      /*
      var newpath = __dirname + files.archivo.name;

      fs.rename(oldpath, newpath, function (err) {
        if (err) throw err;
        var hoja = XLSX.readFile(newpath);
        var nombres = hoja.SheetNames;
        var resultado = "";
        var datos = XLSX.utils.sheet_to_json(hoja.Sheets[nombres[0]]);
        for (var i = 0; i < datos.length; i++) {
          let numero = datos[i].numeros;
          let mensaje = datos[i].mensaje;          
        }
        
      });
      */
  
  } catch (e) {
    // mandar correo de que fallo
   /* transporter.sendMail(mailOptions, function(error, info){
      if (error) {
        console.log(error);
      } else {
        console.log('Email sent: ' + info.response);
      }
    });*/
    console.log(e);
  }

})



app.post('/subirArchivo', function (req, res) {
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
          /*
          soap.createClient(url, function(err, client) {
              var data = { clientid : 'christian' , clientpassword : 'chri2017', ani:'56821736345' ,dnis  :numero , message :mensaje}
              client.submitMsg(data,function(err,r){
                resultado = r;
                if (err ) {
                  res.render('index', { error: err , resultado : null });
                }

              });
          });
          */
        }
        res.render('index', { error: null , resultado : datos });


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

