const mysql = require('mysql2');

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'J9808039154t',
  database: 'futsal_booking'
});

db.connect((err) => {
  if (err) console.log(err);
  else console.log('MySQL Connected');
});

module.exports = db;
