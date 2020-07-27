var mysql = require('mysql')

module.exports = function(host, user, password, database){
  console.log('host: ' + host)
  console.log('user: ' + user)
  console.log('password: ' + password)
  console.log('database: ' + database)
  var connection = mysql.createConnection({
    host     : host,
    user     : user,
    password : password,
    database : database
  });
  connection.connect(function(err) {
      if (err) throw err;
      console.log('Connected to database.')
  });
  return connection
}