const mysql = require('mysql')
const fs = require('fs');

module.exports = function(host, user, password, database){
  let connection = mysql.createPool({
    host     : host,
    user     : user,
    password : password,
    database : database
  });
  fs.readFile('./middleware/SQL_init.sql', (err, data) => {
    if(err) throw err;
    connection.query(data.toString());
  })
  return connection;
}