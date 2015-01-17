$(function initPage() {
  var dbMyComments = db('my_comments[]')
  var $form_comment = $('#form_comment')
  var submitted = false

  var myComment = dbMyComments
    .findLast({ issue_key: issue.key }).value()
  if (myComment) {
    document.title = '我参与了 ##' + issue.title +
      '## ' + myComment.floor + '楼是我'
  }

  $form_comment.on('submit', function (e) {
    e.preventDefault()
    if (submitted) return alert('稍安勿躁')
    var form = $form_comment.serializeJSON()
    var url = '../api/issues/' + issue.key + '/comments'
    $.post(url, form, function (d) {
      if (typeof d !== 'object' || !d.floor) {
        return alert('评论失败，为毛？')
      }
      alert('评论成功，楼层: ' + d.floor)
      dbMyComments.push({
        floor: d.floor,
        issue_key: issue.key
      }).save()
      submitted = true
      location.reload()
    })
  })
})
