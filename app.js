var http = require('http');
var formidable = require('formidable');
var fs = require('fs');
var XLSX = require('xlsx');
var soap = require('soap');
var url = "http://smpp2.telecochile.cl:4046/?wsdl";

http.createServer(function (req, res) {
  if (req.url == '/fileupload') {
    var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
      var oldpath = files.filetoupload.path;
      console.log(oldpath);
      var newpath = '/Users/cristopherorellana/Desktop/wsdl/' + files.filetoupload.name;
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
          */
        res.end();
      });
 });
  } else {
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.write('<form action="fileupload" method="post" enctype="multipart/form-data">');
    res.write('<input type="file" name="filetoupload"><br>');
    res.write('<input type="submit">');
    res.write('</form>');
    return res.end();
  }
}).listen(8080);
