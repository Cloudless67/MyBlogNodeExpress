const mysql = require('mysql')

module.exports = function(host, user, password, database){
  let connection = mysql.createPool({
    host     : host,
    user     : user,
    password : password,
    database : database
  });
  return connection
}