const express = require("express");
const nunjucks = require("nunjucks");
const path = require("path");
const download = require("download-file");

const app = express();

// DEFINE A PASTA PAGES COMO VIEWS
nunjucks.configure("pages", {
  autoescape: true,
  express: app,
  watch: true
});

// ENCODA URL PARA METODOS POST
app.use(express.urlencoded({ extended: false }));
// DEFINE ARQUIVOS .NJK COMO VIEWS
app.set("view engine", "njk");

var qrcodesLength;
var foldername = "";
var err;

// GERA UMA STRING ALEATORIA PARA PASTA DOWNLOAD
const makeFolderName = length => {
  var text = "";
  var possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < length; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
};

const downloadQr = (qr, folder) => {
  var url =
    "http://api.qrserver.com/v1/create-qr-code/?data=" +
    qr +
    "&size=150x150&format=eps";

  var options = {
    directory: "./qrcode/" + folder + "/",
    filename: qr + ".eps"
  };

  download(url, options, function(err) {
    if (err) throw err;
    console.log("meow");
  });
};

// TRANSFORMA A STRING EM ARRAY
const separaQrCodes = (req, res) => {
  var qrcodes = [];
  qrcodesLength = 0;

  resultados = req.body.qrcodes.split(/\n/);

  foldername = makeFolderName(6);

  for (var resultado in resultados) {
    if (resultados[resultado] != "\n" || resultados[resultado] != "\r") {
      qrcodes[resultado] = resultados[resultado]
        .toString()
        .replace(/\r|\n/, "");
      downloadQr(qrcodes[resultado], foldername);
    }
  }

  qrcodesLength = qrcodes.length;

  return res.redirect("/");
};

app.get("/", (req, res) => {
  return res.render("new", {
    qrcodesLength,
    foldername,
    dirname: path.resolve(__dirname, "qrcode", foldername)
  });
});

// ROTA CREATE, JOGA PARA MIDDLEWARE
app.post("/create", separaQrCodes);
app.get("/create", (req, res) => {
  return res.redirect("/");
});

// PORTA EM QUE VAI RODAR O WEBSERVER (http://localhost:3000)
app.listen(3000);
