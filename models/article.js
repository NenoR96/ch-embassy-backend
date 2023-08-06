let mongoose = require('mongoose');

const config = require('../config/database');


let articleSchema = mongoose.Schema({
  articleType: {
    type: Number,
    required: true
  },
  titleEN: {
    type: String,
    required: true
  },
  titleBH: {
    type: String,
    required: false
  },
  titleJP: {
    type: String,
    required: false
  },
  author: {
    type: String,
    required: true
  },
  bodyEN: {
    type: String,
    required: true
  },
  bodyBH: {
    type: String,
    required: true
  },
  bodyJP: {
    type: String,
    required: false
  },
  date: {
    type: String,
    required: true
  },
  time: {
    type: String,
    required: true
  },
  img: [{
    type: String,
    required: false
  }],
  tags: [{
    type: String,
    required: false
  }]
});

let Article = module.exports = mongoose.model('Article', articleSchema);

module.exports.getBySearch = function(text, posts, callback) {
  var skiping = (posts - 1) * 6;
  text = {
    '$regex': text,
    '$options': 'i'
  };
  Article.find({
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
  }).skip(skiping).limit(6).exec(callback);
}
module.exports.getTourism = function(ids, posts, callback) {

  if (posts == 1) {
    Article.find({
      _id: {
        $in: ids
      }
    }).select('_id titleEN titleBH titleJP img bodyEN bodyBH bodyJP').exec(callback);
  } else {
    var skiping = (posts - 2) * 7;
    Article.find({
      $and:[{  articleType: 2},{_id: {
        $nin: ids
      }}]
    }).sort({
      _id: -1
    }).skip(skiping).limit(7).select('_id titleEN titleBH titleJP img bodyEN bodyBH bodyJP').exec(callback);
  }
}

module.exports.getArticleById = function(id, callback) {
  Article.findById(id, callback);
}

module.exports.findThreeTitles = function(callback) {

  Article.find({
    articleType: 2
  }).populate().sort({
    _id: -1
  }).limit(6).select('_id titleEN titleBH titleJP').exec(callback);
}


module.exports.saveModArticle = function(id, property, callback) {
  var query = {
    _id: id
  };
  Article.findOneAndUpdate(query, property, callback);
}


module.exports.findAllPosts = function( callback) {
  Article.find({
    articleType: 1
  }).sort({
    _id: -1
  }).limit(3).select('_id titleEN titleBH titleJP img bodyEN bodyBH bodyJP').exec(callback);
}

module.exports.findChosenPosts = function(tipe, posts, callback) {
  var skiping = (posts - 1) * 6;
  Article.find({
    articleType: tipe
  }).sort({
    _id: -1
  }).skip(skiping).limit(6).select('_id titleEN titleBH titleJP img bodyEN bodyBH bodyJP').exec(callback);
}


module.exports.findAllArticles = function(query, callback) {
  if (query.title != undefined) //proveravamo dal i je vrsena pretraga
    //ako jeste dodajemo karaktere koji ce traziti svaki naslov koji je slican unesenom
    //query.title={ '$regex' : query.title, '$options' : 'i' }  ;
    Article.find().populate().exec(callback);
}


module.exports.addArticle = function(article, callback) {
  article.save(callback);
}
