var qs = require('querystring');

// 发送html响应
exports.sendHtml = function(res, html) {
  res.setHeader('Content-Type', 'text/html');
  res.setHeader('Content-Length', Buffer.byteLength(html));
  res.end(html);
}

// 解析http post 数据
exports.parseReceivedData = function(req, cb) {
  var body = '';
  req.setEncoding('utf8');
  req.on('data', function(chunk) { body += chunk; });
  req.on('end', function() {
    var data = qs.parse(body);
    cb(data);
  })
}

// 添加mysql记录
exports.add = function(db, req, res) {
  exports.parseReceivedData(req, function(work) {
    db.query(
      "INSERT INTO work (hours, date, description) " +
      " VALUES (?, ?, ?)",
      [work.hours, work.date, work.description],
      function(err) {
        if (err) throw err;
        exports.show(db, res);
      }
    )
  })
}

// 删除mysql记录
exports.delete = function(db, req, res) {
  exports.parseReceivedData(req, function(work) {
    db.query(
      "DELETE FROM work WHERE id=?",
      [work.id],
      function(err) {
        if (err) throw err;
        exports.show(db, res);
      }
    )
  })
}

// 更新mysql记录
exports.archive = function(db, req, res) {
  exports.parseReceivedData(req, function(work) {
    db.query(
      "UPDATE work SET archived=1 WHERE id=?",
      [work.id],
      function(err) {
        if (err) throw err;
        exports.show(db, res);
      }
    )
  })
}

// 获取mysql工作记录
exports.show = function(db, res, showArchived) {
  var query = "SELECT * FROM work " +
    "WHERE archived=? " +
    "ORDER BY date DESC";
  var archiveValue = showArchived?1:0;
  db.query(query, [archiveValue], function(err, rows) {
    if (err) throw err;
    html = showArchived ? '': '<a href="/archived">Archived Work</a><br/>';
    html += exports.workHitListHtml(rows);
    html += exports.workFormHtml();
    exports.sendHtml(res, html);
  });
}

// 只显示归档的工作记录
exports.showArchived = function(db, res) {
  exports.show(db, res, true);
}

// 将每条工作记录渲染为html表格中的一行
exports.workHitListHtml = function(rows) {
  var html = '<table>';
  for(var i in rows) {
    html += '<tr>';
    html += '<td>' + rows[i].date + '</td>';
    html += '<td>' + rows[i].hours + '</td>';
    html += '<td>' + rows[i].description + '</td>';
    if (!rows[i].archived) {
      html += '<td>' + exports.workArchiveForm(rows[i].id) + '</td>';
    }
    html += '<td>' + exports.workDeleteForm(rows[i].id) + '</td>';
    html += '</tr>';
  }
  html += '</table>';
  return html;
}

// 渲染输入工作记录的空白表单
exports.workFormHtml = function() {
  var html = '<form method="POST" action="/">' +
    '<p>Date (YYYY-MM-DD):<br/><input name="date" type="text"><p/>' +
    '<p>Hours worked:<br/><input name="hours" type="text"><p/>' +
    '<p>Description:<br/>' +
    '<textarea name="description"></textarea></p>' +
    '<input type="submit" value="Add" />' +
    '</form>';
  return html;
}

// 渲染归档按钮表单
exports.workArchiveForm = function(id) {
  return exports.actionForm(id, '/archive', 'Archive');
}

// 渲染删除按钮表单
exports.workDeleteForm = function(id) {
  return exports.actionForm(id, '/delete', 'Delete');
}

// 渲染简单的表单
exports.actionForm = function(id, path, label) {
  var html = '<form method="POST" action="'+path+'">' +
    '<input type="hidden" name="id" value="'+id+'" />' +
    '<input type="submit" value="'+label+'" />' +
    '</form>';
  return html;
}