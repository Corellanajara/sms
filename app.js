const express = require('express')
const bodyParser = require('body-parser');
var formidable = require('formidable');
var fs = require('fs');
var XLSX = require('xlsx');
var soap = require('soap');
var url = "http://smpp2.telecochile.cl:4046/?wsdl";
var mysql = require('mysql');

var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database:'mydb'
});

try{con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
});
}catch(err){
  //mandar mnensaje con el error
}


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


function insertarDatos(datos,id){
  let sql = "INSERT INTO Contenido (Numero, Mensaje,idLista) VALUES ?";
  var values = [];
  for (var i = 0; i < datos.length; i++) {
    let numero = datos[i].numeros;
    let mensaje = datos[i].mensaje;
    data = [numero,mensaje,id];
    values.push(data);
  }
  con.query(sql, [values], function (err, result) {
    if (err) throw err;
    console.log("id " + result.insertId);
  });
}
function mandarError(e){
  transporter.sendMail(mailOptions, function(error, info){
      if (error) {
        console.log(error);
      } else {
        console.log('Email sent: ' + info.response);
      }
  });
}
function error(e){
  mandarError(e);
  res.render('home', { error: 'Hubo un error, Intenta mas tarde',nombre:'Cristian',resultado : result,estado:null,contenido:null});
}

var nombreLista = "";
// RUTAS
app.post('/subirLista', function (req, res) {
  let resultado = "salio bien";
  try {
      nombreLista = req.body.nombre;
      res.render('subirArchivo', { error: null ,nombre : nombreLista , resultado : "Salio bien" ,contenido :null});  
  } catch (e) {
    error(e);
  }
})

app.get('/', function (req, res) {
  try{
      let sql = "select idLista , Nombre from lista where idUsuario = 1";
      con.query(sql, function (err, result,fields) {
        if (err) throw err;
        res.render('home', { error: null,nombre:'Cristian',resultado : result,estado:null,contenido:null});
      });
  }catch(e){
    error(e);
  }
})

app.post('/subir', function (req, res) {
  try{ 
    res.render('subirLista', { error: null,resultado : null,contenido:null});
  }catch(e){
    error(e);
  }  
})

app.post('/enviarApi', function (req, res) {
  let resultado = "salio bien";
  try {
        let lista = req.body.idLista;
        let estado = " Ha sido mandado con exito";
        let sql = "select Numero , Mensaje from Contenido where idLista = (?)";
        con.query(sql,lista, function (err, result,fields) {
          if (err) throw err;
          for (var i = result.length - 1; i >= 0; i--) {
            let numero = result[i].Numero;
            let mensaje = result[i].Mensaje;
            soap.createClient(url, function(err, client) {
              var data = { clientid : 'christian' , clientpassword : 'chri2017', ani:'56821736345' ,dnis  :numero , message :mensaje}
              client.submitMsg(data,function(err,r){                                
                console.log(r);
                console.log(r[0]);
                console.log(r.submitMsgResult);
                console.log(r.submitMsgResult.code);
                data = [r.submitMsgResult.code,r.submitMsgResult.id,r.submitMsgResult.message]
                let insercion = "insert into Resultado (Codigo,idSms,respuesta) values (?)";
                con.query(insercion,[data], function (err, result,fields) {
                  if (err) throw err;
                });
                if (err ) {
                  res.render('home', { error: err , resultado : null ,estado : null,nombre:'Cristian'});
                }
                });
            });
          }
          console.log(estado);
          res.render('verLista', { error: null,nombre:'Cristian',id:lista,resultado : result,estado:estado,contenido:null});
        }); 
  }catch(e){
    error(e);
  }
})

app.post('/verLista', function (req, res) {
  let resultado = "salio bien";
  try {
        lista = req.body.idLista;
        let sql = "select Numero , Mensaje from Contenido where idLista = (?)";
        con.query(sql,lista, function (err, result,fields) {
          if (err) throw err;
          console.log(result);
          res.render('verLista', { error: null,nombre:'Cristian',estado : null ,id:lista,resultado : result,contenido:null});
        }); 
  }catch(e){
    error(e);
  }
})

app.post('/subirArchivo', function (req, res) {
  try {
    var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
      var oldpath = files.archivo.path;
      var newpath = __dirname + files.archivo.name;
      var sql = "";
      fs.rename(oldpath, newpath, function (err) {
        if (err) throw err;
        var hoja = XLSX.readFile(newpath);
        var nombres = hoja.SheetNames;
        var resultado = "";
        console.log(nombreLista);
        var datos = XLSX.utils.sheet_to_json(hoja.Sheets[nombres[0]]);
        sql = "insert into lista (Nombre) value (?) ";
        console.log(sql);
        let idLista = 0;
        con.query(sql,nombreLista, function (err, result) {
          if (err) throw err;
          console.log("id " + result.insertId);
          idLista = result.insertId;
          insertarDatos(datos,idLista);
        });
        res.render('index', { error: null , nombre : nombreLista, resultado : datos });
      });
    });
  }catch(e){
    error(e);
  }
})

let puerto = 4000;
app.listen(puerto, function () {
  console.log('escuchando puerto '+puerto+'!')
})
