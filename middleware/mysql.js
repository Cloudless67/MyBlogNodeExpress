var mysql = require('mysql')

module.exports = function(host, user, password, database){
  var connection = mysql.createPool({
    host     : host,
    user     : user,
    password : password,
    database : database
  });
  return connection
}