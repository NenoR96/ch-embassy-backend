const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');

const passport = require('passport');
const config = require('../config/database');
let Article = require('../models/article');
const path = require('path');
const crypto = require('crypto');

//storage za sacuvavanje slika
var storage = multer.diskStorage({
  //folder za sacuvavanje
  destination: function(req, file, cb) {
    cb(null, './public/images/articles')
  },
  //naziv fajla
  filename: function(req, file, cb) {
    //generisanje imena i dodavanje ekestenzije
    crypto.pseudoRandomBytes(16, function(err, raw) {
      //uzimamo ekstenziju od uploadovanog fajla
      var ext = file.originalname.split('.').pop();
      //spajamo generisano ime s vremon kreiranja (radi sigurnosti) i ekstenzijom
      cb(null, raw.toString('hex') + Date.now() + '.' + ext);
    });
  }
});
var upload = multer({
  storage: storage
});

//dodeljivanje prethodno postavljenih podesavanja multeru
//==============================================================================

router.get('/image/:image', (req, res) => {
  if (fs.existsSync(path.join(__dirname, '../public/images/articles/', req.params.image)))
    res.status(200).sendFile(path.resolve(path.join(__dirname, '../public/images/articles/', req.params.image)));
  else res.status(200).sendFile(path.resolve(path.join(__dirname, '../public/images/', 'Flag-Pins-China-Bosnia-and-Herzegovina.jpg')));
});

router.get('/edit/:id', passport.authenticate('jwt', {
  session: false
}), (req, res, next) => {
  //trazimo artikl
  Article.getArticleById(req.params.id.toString(), (err, art) => {
    if (err)
      return res.status(500).send("Server error!");
    if (!art)
      return res.status(422).send("Property not found");
    else return res.status(200).json({
      art: art
    });
  });
});

router.patch('/edit/:id', upload.array('photo', 10), passport.authenticate('jwt', {
  session: false
}), (req, res, next) => {
  //trazimo apartman
  Article.getArticleById(req.params.id.toString(), (err, art) => {
    if (err)
      return res.status(500).send("Server error!");
    else if (!art)
      return res.status(422).send("Article not found");
    else {
      //ako je korisnik vlasnik apartmana


      //ucitavamo izmenjen apartman
      var itsMe = JSON.parse(req.body.thisArt);
      //brisemo stare slike
      if (itsMe.img[0] != art.img[0] && (itsMe.img[0] == "no" && art.img[0] != undefined)) deleteFile(art.img[0]);
      if (itsMe.img[2] != art.img[2] && (itsMe.img[2] == "no" && art.img[2] != undefined)) deleteFile(art.img[2]);
      if (itsMe.img[1] != art.img[1] && (itsMe.img[1] == "no" && art.img[1] != undefined)) deleteFile(art.img[1]);
      if (itsMe.img[3] != art.img[3] && (itsMe.img[3] == "no" && art.img[3] != undefined)) deleteFile(art.img[3]);
      if (itsMe.img[4] != art.img[4] && (itsMe.img[4] == "no" && art.img[4] != undefined)) deleteFile(art.img[4]);
      if (itsMe.img[5] != art.img[5] && (itsMe.img[5] == "no" && art.img[5] != undefined)) deleteFile(art.img[5]);
      if (itsMe.img[6] != art.img[6] && (itsMe.img[6] == "no" && art.img[6] != undefined)) deleteFile(art.img[6]);
      if (itsMe.img[7] != art.img[7] && (itsMe.img[7] == "no" && art.img[7] != undefined)) deleteFile(art.img[7]);
      if (itsMe.img[8] != art.img[8] && (itsMe.img[8] == "no" && art.img[8] != undefined)) deleteFile(art.img[8]);
      if (itsMe.img[9] != art.img[9] && (itsMe.img[9] == "no" && art.img[9] != undefined)) deleteFile(art.img[9]);

      //trazimo slobodno mesto da sacuvamo sliku

      for (i = 0; i < 10; i++) {
        if (req.files[i] != undefined)
        if (itsMe.img[0] == "no") {
            itsMe.img[0] = req.files[i].filename;
          }
        else if (itsMe.img[1] == "no") {
          itsMe.img[1] = req.files[i].filename;
        } else if (itsMe.img[2] == "no") {
          itsMe.img[2] = req.files[i].filename;
        } else if (itsMe.img[3] == "no") {
          itsMe.img[3] = req.files[i].filename;
        } else if (itsMe.img[4] == "no") {
          itsMe.img[4] = req.files[i].filename;
        } else if (itsMe.img[5] == "no") {
          itsMe.img[5] = req.files[i].filename;
        } else if (itsMe.img[6] == "no") {
          itsMe.img[6] = req.files[i].filename;
        } else if (itsMe.img[7] == "no") {
          itsMe.img[7] = req.files[i].filename;
        } else if (itsMe.img[8] == "no") {
          itsMe.img[8] = req.files[i].filename;
        } else if (itsMe.img[9] == "no") {
          itsMe.img[9] = req.files[i].filename;
        }

        //sacuvavamo nove postavke apartmana
        Article.saveModArticle(req.params.id.toString(), itsMe, (err) => {
          if (err)
            return res.status(500).send("Server error!");
        });
        //obavestavamo da je apartman sacuvan
      }
      return res.status(200).send("Article saved!");
    }
  });
});

router.get('/titles', (req, res, next) => {
  //pronalazimo sve apartmane
  Article.findThreeTitles((err, art) => {
    if (err)
      return res.status(500).send("Server error!");
    //saljemo sve pronadjenje
    return res.status(200).json({
      obj: art
    });
  });
});

router.get('/posts', (req, res, next) => {
  Article.findAllPosts((err, art) => {
    if (err)
      return res.status(500).send("Server error!");
      return res.status(200).json({
        posts: art
  });
});
});

router.get('/tourism/:page', (req, res, next) => {
  var page = req.params.page;
  var ids = [ '5d3e9b021edb9a22f8ce9528','5d3e98d81edb9a22f8ce9519','5d3e9adc1edb9a22f8ce9526',
              '5d4bd91abe971100f0a9e26b','5d5079f1d2950fcbdc639c3b',
              '5d3e9a241edb9a22f8ce9521','5d4be2edbe971100f0a9e271'];
  Article.getTourism(ids,page, (err, art) => {
    if (err)
      return res.status(500).send("Server error!");
    Article.count({
      articleType: 2
    }, (err, count) => {
      if (err)
        return res.status(500).send("Server error!");
      if (page == 1) {
          art.sort((a, b) => ids.findIndex(id => a._id.equals(id)) -
                    ids.findIndex(id => b._id.equals(id)));
      }
      var pages = Math.ceil(count / 7);
      return res.status(200).json({
        count: pages,
        posts: art
      });
    });
  });
});



//ucitavanje svih artikala za home page
router.get('/all', (req, res, next) => {
  //pronalazimo sve apartmane
  Article.findAllArticles(req.query, (err, art) => {
    if (err)
      return res.status(500).send("Server error!");
    //saljemo sve pronadjenje
    return res.status(200).json({
      obj: art
    });
  });
});

router.get('/showposts', (req, res, next) => {
  //pronalazimo sve apartmane
  Article.findChosenPosts(req.query.type, req.query.place, (err, art) => {
    if (err)
      return res.status(500).send("Server error!");
    Article.count({
      articleType: req.query.type
    }, (err, count) => {
      if (err)
        return res.status(500).send("Server error!");
      var pages = Math.ceil(count / 6);
      return res.status(200).json({
        count: pages,
        posts: art
      });
    });
  });
});

router.get('/view/:id', (req, res, next) => {
  //trazimo dati artikl u bazi podataka
  Article.getArticleById(req.params.id.toString(), (err, art) => {
    if (err)
      return res.status(500).send("Server error!");
    if (!art)
      return res.status(422).send("Article not found");
    return res.status(200).json({
      obj: art
    });;
  });
});

router.get('/search', (req, res, next) => {
  //trazimo dati artikl u bazi podataka
  Article.getBySearch(req.query.text.toString(), req.query.posts, (err, art) => {
    if (err)
      return res.status(500).send("Server error!");
    var text = req.query.text;
    Article.count({
      $or: [{
        titleEN: text
      }, {
        titleBH: text
      }, {
        titleJP: text
      }, {
        bodyEN: text
      }, {
        bodyBH: text
      }, {
        bodyJP: text
      }, {
        tags: text
      }]
    }, (err, count) => {
      if (err)
        return res.status(500).send("Server error!");
      var pages = Math.ceil(count / 6);
      return res.status(200).json({
        count: pages,
        posts: art
      });
    });
  });
});

router.post('/add', upload.array('photo', 10), passport.authenticate('jwt', {
  session: false
}), (req, res, next) => {
  //ucitavamo proslednjene podatke
  var stanje = false;
  var itsMe = JSON.parse(req.body.thisArt);
  //kreiramo novi apartman
  let art = new Article(itsMe);
  //dodeljujemo vlasnistvo korisniko
  art.author = req.user.name;
  art.date = getDate();
  art.time = getTime();
  //proveravamo slobodna mesta za slike
  if (req.files[0] != undefined) {
    art.img[0] = req.files[0].filename;
  }
  if (req.files[1] != undefined) {
    art.img[1] = req.files[1].filename;
  }
  if (req.files[2] != undefined) {
    art.img[2] = req.files[2].filename;
  }
  if (req.files[3] != undefined) {
    art.img[3] = req.files[3].filename;
  }
  if (req.files[4] != undefined) {
    art.img[4] = req.files[4].filename;
  }
  if (req.files[5] != undefined) {
    art.img[5] = req.files[5].filename;
  }
  if (req.files[6] != undefined) {
    art.img[6] = req.files[6].filename;
  }
  if (req.files[7] != undefined) {
    art.img[7] = req.files[7].filename;
  }
  if (req.files[8] != undefined) {
    art.img[8] = req.files[8].filename;
  }
  if (req.files[9] != undefined) {
    art.img[9] = req.files[9].filename;
  }
  //sacuvavamo apartman u bazu
  stanje = true;
  if (stanje)
    Article.addArticle(art, (err) => {
      if (err)
        return res.status(500).send("Server error!");
      //obavestavamo korisnika da je sacuvavanje uspesno
      return res.status(201).send("Apartment saved!");
    });
});

router.delete('/delete/:id', passport.authenticate('jwt', {
  session: false
}), (req, res, next) => {
  //pronalazimo dati apartman
  Article.getArticleById(req.params.id.toString(), (err, art) => {
    if (err)
      return res.status(500).send("Server error!");
    if (!art)
      return res.status(422).send("Article not found");
    //ako jeste brisemo apartman
    deleteFile(art.img[0]);
    deleteFile(art.img[1]);
    deleteFile(art.img[2]);
    deleteFile(art.img[3]);
    deleteFile(art.img[4]);
    deleteFile(art.img[5]);
    deleteFile(art.img[6]);
    deleteFile(art.img[7]);
    deleteFile(art.img[8]);
    deleteFile(art.img[9]);
    art.remove((err) => {
      if (err)
        return res.status(500).send("Server error!");
      return res.status(204).send("Article removed!");
    });
  });
});

//brisanje starih slika
deleteFile = (image) => {
  if (image != "no")
    //ako se slika nalazi na serveru
    if (fs.existsSync(path.join(__dirname, '../public/images/articles/', image)))
      fs.unlink('./public/images/articles/' + image, (err) => {
        if (err) throw err;
      });
};

/*


router.get('/image/:image', (req, res) => {
  if (fs.existsSync(path.join(__dirname, '../public/images/articles/', req.params.image)))
    res.status(200).sendFile(path.resolve(path.join(__dirname, '../public/images/articles/', req.params.image)));
  else res.status(200).sendFile(path.resolve(path.join(__dirname, '../public/images/', 'Flag-Pins-Bosnia-and-Herzegovina-Japan.jpg')));
});
'visaapplicationform.pdf'
*/

router.get('/showpdf/:filePDF', (req, res) => {
  res.status(200).sendFile(path.resolve(path.join(__dirname, '../public/pdfs/', req.params.filePDF)));

});


function getDate() {

  var date = new Date();

  var year = date.getFullYear();

  var month = date.getMonth() + 1;
  month = (month < 10 ? "0" : "") + month;

  var day = date.getDate();
  day = (day < 10 ? "0" : "") + day;

  return year + "/" + month + "/" + day;
}

function getTime() {
  var date = new Date();

  var hour = date.getHours();
  hour = (hour < 10 ? "0" : "") + hour;

  var min = date.getMinutes();
  min = (min < 10 ? "0" : "") + min;
  return hour + ":" + min;
}

module.exports = router;
