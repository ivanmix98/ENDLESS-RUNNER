/*
 * Utilització de fitxers estàtics amb ExpressJS
 * @author sergi grau, sergi.grau@fje.edu
 * @version 1.0
 * date 14.01.2016
 * format del document UTF-8
 *
 * CHANGELOG
 * 14.01.2016
 * - Utilització de fitxers estàtics
 *
 * NOTES
 * ORIGEN
 * Desenvolupament Aplicacions Web. Jesuïtes El Clot
 */
var express = require('express');
var app = express();
var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');

app.use(express.static(__dirname + '/public'));

app.get('/', function (req, res) {
  res.sendFile('menu/index.html');
});

app.get('/game', function (req, res) {
  res.sendFile(__dirname + '/public/game.html');
});

app.get('/registre', function (req, res) {

  var score = req.query.score;
  res.write(`
  <!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <link rel="stylesheet" href="menu/css/style.css">
    <embed src="menu/ranking.mp3" autostart="true" loop="true" hidden="true"></embed>
</head>

<body body background="menu/menu.PNG">
    <div id="main" style="height: 20%;">
        <div id="menus">
            <h1 style="text-align:center" class="italic">INTRODUEIX NOM</h1>
            <form action="/registrat">
                <input type="text" name="nom">
                <input type="text" name="score" value="`+ score + `" readonly="readonly" />
                <input type="submit" value="Submit">
                </form>
            <div class="normal">
                <a style="text-decoration: none; color:red;" href="/">MENÚ</a>
            </div>
        </div>
    </div>
</body>

</html>
  `);
});

app.get('/registrat', function (req, res) {
  var rutadb = 'mongodb://localhost:27017';
  var nom = req.query.nom;
  var score = parseInt(req.query.score);

  MongoClient.connect(rutadb, function (err, client) {
    assert.equal(null, err);
    console.log("Connexió correcta");
    var db = client.db('runner');
    db.collection('ranking').insertOne({
      "nom": nom,
      "score": score,
    });
    assert.equal(err, null);
    console.log("Afegit document a col·lecció ranking");

    res.write(`
    <!DOCTYPE html>
    <html>
    <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <link rel="stylesheet" href="menu/css/style.css">
    <embed src="menu/registrat.mp3" autostart="true" loop="true" hidden="true"></embed>
    </head>
    <body body background="menu/menu.PNG">
    <div id="main" style="    height: 20%;">
    <div id="menus">
    <h1 style="text-align:center" class="italic">PUNTUACIÓ GUARDADA</h1>
    <a href="/ranking" style="text-align:center; text-decoration:none" class="italic">VEURE RANKING</a>
    <div class="normal">
          <a style="text-decoration: none; color:red;" href="/">MENÚ</a>
          </div>
          </div>
    </div>
    </body>
    </html>
    `);
    res.end();
    client.close();
  });

});

app.get('/ranking', function (req, res) {
  var rutadb = 'mongodb://localhost:27017';
  MongoClient.connect(rutadb, function (err, client) {
    assert.equal(null, err);
    console.log("Connexió correcta");
    var db = client.db('runner');
    res.writeHead(200, {
      "Content-Type": "text/html; charset=utf-8"
    });
    console.log("consulta document a col·lecció ranking");
    var sort = { score: -1 };
    var cursor = db.collection('ranking').find({}).sort(sort);

    res.write(`
          <!DOCTYPE html>
          <html>
          <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
          <link rel="stylesheet" href="menu/css/style.css">
          <embed src="menu/victory.mp3" autostart="true" loop="true" hidden="true"></embed>
          </head>
          <body body background="menu/menu2.PNG">
          <div id="main" style="    height: 20%;">
          <div id="menus">
          <h1 style="text-align:center" class="italic">RANKING</h1>`);

    cursor.each(function (err, doc) {
      assert.equal(err, null);
      if (doc != null) {

        res.write('<p style="text-align: center; font-family: overwatch;src: url(https://us.battle.net/forums/static/fonts/f014015d/f014015d.woff);">' + doc.nom + ' ' + doc.score + '</p><br>');
      }
      else {
        res.end();
        client.close();
      }
    });
    res.write(`
          <div class="normal">
          <a style="text-decoration: none; color:red;" href="/">MENÚ</a>
          </div>
          </div>
    </div>
    </body>
    </html>
    `);
  });
});

app.listen(3000, function () {
  console.log('Servidor escoltant port 3000');
})

// qualsevol altre petició retorna 404 not found
//req i res són els mateixos objectes de NodeJS