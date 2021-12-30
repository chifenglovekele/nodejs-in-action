var fs = require('fs');
var path = require('path');
var args = process.argv.splice(2);
var command = args.shift();
var taskDescription = args.join(' ');
var file = path.join(process.cwd(), '/.tasks');

switch (command) {
  case 'list':
    listTasks(file);
    break;

  case 'add':
    addTask(file, taskDescription);
    break;
  
  default:
    console.log('Usage: ' + process.argv[0] + ' list|add [taskDescription]');
}

// 从文本中加载json编码的数据
function loadOrInitializeTaskArray(file, cb) {
  fs.exists(file, function(exists) {
    var task = [];
    if (exists) {
      fs.readFile(file, 'utf8', function(err, data) {
        if (err) throw err;
        var data = data.toString();
        var tasks = JSON.parse(data || '[]');
        cb(tasks);
      })
    } else {
      cb([]);
    }
  })
}

// 列出任务的函数
function listTasks(file) {
  loadOrInitializeTaskArray(file, function(tasks) {
    for (var i = 0; i < tasks.length; i++) {
      console.log(tasks[i]);
    }
  })
}

// 把任务数据保存到磁盘
function storeTasks(file, tasks) {
  fs.writeFile(file, JSON.stringify(tasks), 'utf8', function (err){
    if (err) throw err;
    console.log('Saved.')
  })
}

// 添加一条任务
function addTask(file, taskDescription) {
  loadOrInitializeTaskArray(file, function(tasks) {
    tasks.push(taskDescription);
    storeTasks(file, tasks);
  })
}
