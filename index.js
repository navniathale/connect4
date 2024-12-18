/*
Navni Athale
CPI 310
Todo list app
*/

const express = require('express');
const path = require('path');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const { engine } = require('express-handlebars');  // Correct import

// Initialize the Express app
const app = express();
const port = 3000;

// Middleware for parsing URL-encoded form data
app.use(express.urlencoded({ extended: true }));

// Serve static files from the public directory (optional)
app.use(express.static(path.join(__dirname, 'public')));

// Set up the view engine to use Handlebars
app.engine('handlebars', engine());  // Use the engine method correctly
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

// Open a connection to the SQLite database
const dbPromise = open({
  filename: './database.db',
  driver: sqlite3.Database
});

// Create the tasks table if it doesn't already exist
dbPromise.then(db => {
  db.run(`
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT
    )
  `);
});

// Define the routes
app.get('/', async (req, res) => {
  const db = await dbPromise;
  const tasks = await db.all('SELECT * FROM tasks');
  res.render('home', { tasks });
});

app.post('/addTask', async (req, res) => {
  const { title, description } = req.body;
  const db = await dbPromise;
  
  // Insert new task into the database
  await db.run('INSERT INTO tasks (title, description) VALUES (?, ?)', [title, description]);
  
  // Redirect to the home page to display updated tasks
  res.redirect('/');
});

// Start the server
app.listen(3000, () => {
  console.log(`Server running on http://localhost:${3000}`);
});

