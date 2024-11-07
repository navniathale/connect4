/*
Navni Athale
CPI 310
Todo list app
*/
const express = require('express');
const path = require('path');
const exphbs = require('express-handlebars');
const cookieParser = require('cookie-parser');
const sqlite3 = require('sqlite3');
const dbPromise = require('sqlite');  // or use db from dbPromise

const app = express();

// Set up Handlebars as the view engine
const hbs = exphbs.create(); 
app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Database setup (SQLite)
const db = new sqlite3.Database('./todolist.sqlite', (err) => {
  if (err) {
    console.error('Database error:', err.message);
  } else {
    console.log('Connected to the SQLite database.');
  }
});

// Home page (Login)
app.get('/', (req, res) => {
  res.render('home');  // Assuming home.handlebars exists in the views folder
});

// Register page (Create Account)
app.get('/register', (req, res) => {
  res.render('register');  // Assuming register.handlebars exists in the views folder
});

// Login route (POST request)
app.post('/login', (req, res) => {
  const { username } = req.body;
  
  // Check if the user exists in the database
  db.get('SELECT * FROM users WHERE username = ?', [username], (err, row) => {
    if (err) {
      console.error('Database error:', err.message);
      res.send('Error occurred');
    } else if (row) {
      // If user exists, create a cookie with the username
      res.cookie('username', username);
      res.redirect('/tasks');
    } else {
      res.send('No such user');
    }
  });
});

// Register route (POST request)
app.post('/register', (req, res) => {
  const { username } = req.body;
  
  // Check if the user already exists in the database
  db.get('SELECT * FROM users WHERE username = ?', [username], (err, row) => {
    if (err) {
      console.error('Database error:', err.message);
      res.send('Error occurred');
    } else if (row) {
      res.send('Username already exists');
    } else {
      // Insert the new user into the database
      db.run('INSERT INTO users (username) VALUES (?)', [username], function(err) {
        if (err) {
          console.error('Database error:', err.message);
          res.send('Error occurred');
        } else {
          // If user created successfully, store username in cookie and redirect
          res.cookie('username', username);
          res.redirect('/tasks');
        }
      });
    }
  });
});

// Tasks page (GET request)
app.get('/tasks', (req, res) => {
  const username = req.cookies.username;
  
  if (!username) {
    return res.redirect('/');
  }

  // Fetch the user_id using the username stored in the cookie
  db.get('SELECT user_id FROM users WHERE username = ?', [username], (err, row) => {
    if (err) {
      console.error('Database error:', err.message);
      res.send('Error occurred');
    } else if (row) {
      const userId = row.user_id;

      // Fetch tasks for the user
      db.all('SELECT * FROM tasks WHERE user_id = ?', [userId], (err, tasks) => {
        if (err) {
          console.error('Database error:', err.message);
          res.send('Error occurred');
        } else {
          // Render tasks with username and task data
          res.render('tasks', { username, tasks });
        }
      });
    } else {
      res.send('User not found');
    }
  });
});

// Add new task (POST request)
app.post('/add_task', (req, res) => {
  const { task_desc } = req.body;
  const username = req.cookies.username;
  
  if (!username) {
    return res.redirect('/');
  }

  // Fetch the user_id using the username stored in the cookie
  db.get('SELECT user_id FROM users WHERE username = ?', [username], (err, row) => {
    if (err) {
      console.error('Database error:', err.message);
      res.send('Error occurred');
    } else if (row) {
      const userId = row.user_id;

      // Insert new task into the database
      db.run('INSERT INTO tasks (user_id, task_desc, is_complete) VALUES (?, ?, ?)', 
      [userId, task_desc, 0], function(err) {
        if (err) {
          console.error('Database error:', err.message);
          res.send('Error occurred');
        } else {
          // Redirect to tasks page to see the updated list
          res.redirect('/tasks');
        }
      });
    } else {
      res.send('User not found');
    }
  });
});

// Start server
app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});
