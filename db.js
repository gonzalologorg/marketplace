var Config = require('./config.js')

var mysql = require('mysql');
var connection;

function doConnect() {
  connection = mysql.createConnection({
    host: Config.db.ip,
    user: Config.db.user,
    password: Config.db.password,
    database: Config.db.default
  });
}

doConnect()

connection.connect(function (err) {
  if (err) {
    console.error('error connecting: ' + err.stack);
    return;
  }

  console.log('connected as id ' + connection.threadId);
});

connection.on("error", function (err) {
  console.log("Seems like we lost connection, let's start it again")
  ps.lookup({
    command: 'mysqld',
  }, function (err, resultList) {
    if (err) {
      throw new Error(err);
    }
    var found = false;
    resultList.forEach(function (process) {
      if (process) {
        found = true
        doConnect()
        console.log('PID: %s, COMMAND: %s, ARGUMENTS: %s', process.pid, process.command, process.arguments);
      }
    });

    if (!found) {
      exec("C:\\xampp\\mysql\\bin\\mysqld --defaults-file=mysql\\bin\\my.ini --standalone", function (err) {
        if (err) {
          console.log(err)
          return;
        }

        doConnect()
      })
    }
  });

});

module.exports = connection;