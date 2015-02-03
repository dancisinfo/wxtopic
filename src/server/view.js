var path = require('path')
//var jade = require('jade')
var exphbs = require('express-handlebars')
var config = require('../../config')
var wx = require('./wx')
var db = require('./db')
var dbTopics = db.dbTopics
var dbComments = db.dbComments

module.exports = function (app) {
  //app.engine('jade', jade.__express)
  app.engine('handlebars', exphbs())
  app.set('view engine', 'handlebars')
  app.set('views', path.resolve(__dirname, '../web'))

  app.get('/', function (req, res) {
    //res.redirect(prefixUrl('/topics'))
    res.redirect(prefixUrl('/open'))
  })
  //app.get('/topics', function (req, res) {
  //  res.send('Top Topics')
  //})

  app.get('/wxtest', dropPathSlash, function (req, res, next) {
    wx.getJsApiSign(req, function (e, d) {
      if (e) return next(e)
      res.render('wxtest.hbs', { wxSign: d })
    })
  })

  app.get('/open', dropPathSlash, function (req, res) {
    res.render('topic-open.hbs')
  })

  app.get('/topics/:key', dropPathSlash, function (req, res, next) {
    var topic = dbTopics.find({
      key: req.params.key
    }).value()
    if (!topic) {
      return next(new Error(
        'topic not found with key: ' + req.params.key
      ))
    }
    var comments = dbComments.filter({
      topic_id: topic.id
    }).value().reverse()
    res.render('topic-view.hbs', {
      comments: comments,
      topic: topic
    })
  })

  app.get('/wxtest', dropPathSlash, function (req, res, next) {
    wx.getJsApiSign(req, function (e, d) {
      if (e) return next(e)
      res.render('wxtest.hbs', { wxSign: d })
    })
  })
}


function dropPathSlash(req, res, next) {
  var pathname = req._parsedUrl.pathname
  var query = req._parsedUrl.query || ''
  if (/\/$/.test(pathname)) {
    var _url = pathname.replace(/\/$/, '') + query
    return res.redirect(prefixUrl(_url))
  }
  next()
}
function prefixUrl(seg) {
  return config.urlPrefix + seg
}
