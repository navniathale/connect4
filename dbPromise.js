const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./todolist.sqlite', sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE);

const dbPromise = (query, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(query, params, (err, rows) => {
      if (err) reject(err);
      resolve(rows);
    });
  });
};

module.exports = dbPromise;
