$(function initPage() {
  var $form_open = $('#form_open')
  var submitted = false

  $form_open.on('submit', function (e) {
    e.preventDefault()
    if (submitted) return alert('稍安勿躁')
    var form = $form_open.serializeJSON()
    $.post('../api/issues', form, function (d) {
      if (typeof d !== 'object' || !d.key) {
        return alert('创建失败，为毛？')
      }
      alert('创建成功，key: ' + d.key)
      submitted = true
      location.href = d.key
    })
  })
})
