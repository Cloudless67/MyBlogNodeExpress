var mysql = require('mysql')

module.exports = function(host, user, password, database){
  var connection = mysql.createConnection({
    host     : host,
    user     : user,
    password : password,
    database : database
  });
  connection.connect(function(err) {
      if (err) throw err;
  });
  console.log('Connected to database.')
  return connection
}