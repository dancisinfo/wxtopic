var path = require('path')
//var jade = require('jade')
var exphbs = require('express-handlebars')
var config = require('../../config')
var wx = require('./wx')
var db = require('./db')
var dbIssues = db.dbIssues
var dbComments = db.dbComments

module.exports = function (app) {
  //app.engine('jade', jade.__express)
  app.engine('handlebars', exphbs())
  app.set('view engine', 'handlebars')
  app.set('views', path.resolve(__dirname, '../web'))

  app.get('/', function (req, res) {
    res.redirect(prefixUrl('/issues'))
  })
  app.get('/issues', function (req, res) {
    res.send('Top Issues')
  })

  app.get('/issues/open', function (req, res) {
    res.render('issue-open.hbs')
  })

  app.get('/issues/:key', dropPathSlash, function (req, res, next) {
    var issue = dbIssues.find({
      key: req.params.key
    }).value()
    if (!issue) {
      return next(new Error(
        'issue not found with key: ' + req.params.key
      ))
    }
    var comments = dbComments.filter({
      issue_id: issue.id
    }).value().reverse()
    res.render('issue-view.hbs', {
      comments: comments,
      issue: issue
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
    return res.redirect(_url)
  }
  next()
}
function prefixUrl(seg) {
  return config.urlPrefix + seg
}
