var uuid = require('node-uuid').v4
var bodyParser = require('body-parser')
var db = require('./db')
var dbIssues = db.dbIssues
var dbComments = db.dbComments
var tss = require('./lib/tss')

module.exports = function (app) {

  app.use('/api', bodyParser.urlencoded({
    extended: true
  }))

  app.post('/api/issues/:key/comments', verify, function (req, res, next) {
    var issue = dbIssues.find({
      key: req.params.key
    }).value()
    if (!issue) {
      return next(new Error(
        'issue not found with key: ' + req.params.key
      ))
    }
    var followed = dbComments.filter({
      issue_id: issue.id
    }).last().value()
    var nextFloor = followed ? followed.floor + 1 : 1
    var comment = {
      id: getNextId(dbComments),
      floor: nextFloor,
      issue_id: issue.id,
      text: req.body.text,
      ip: req.ip,
      timestamp: tss()
    }
    dbComments.push(comment)
    db.save()
    res.send({ floor: comment.floor })
  })

  app.post('/api/issues', verify, function (req, res) {
    var issue = {
      id: getNextId(dbIssues),
      key: uuid(),
      title: req.body.title,
      ip: req.ip,
      timestamp: tss()
    }
    dbIssues.push(issue)
    var ret = { key: issue.key }
    
    if (req.body.comment) {
      var comment = {
        id: getNextId(dbComments),
        floor: 1,
        issue_id: issue.id,
        text: req.body.comment,
        ip: req.ip,
        timestamp: tss()
      }
      dbComments.push(comment)
      ret.comment_id = comment.id
    }
    db.save()
    res.send(ret)
  })

}


function verify(req, res, next) {
  next()
}
function getNextId(list) {
  var last = list.last().value()
  return last ? last.id + 1 : 1
}
