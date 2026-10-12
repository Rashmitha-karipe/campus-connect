const { DatabaseSync } = require('node:sqlite');
const bcrypt = require('bcryptjs');

const db = new DatabaseSync('campus.db');
db.exec('PRAGMA foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('student','organizer','admin'))
  );
  CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    venue TEXT,
    event_date TEXT NOT NULL,
    organizer_id INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
    FOREIGN KEY (organizer_id) REFERENCES users(id)
  );
  CREATE TABLE IF NOT EXISTS registrations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_id INTEGER NOT NULL,
    student_id INTEGER NOT NULL,
    UNIQUE (event_id, student_id),
    FOREIGN KEY (event_id) REFERENCES events(id),
    FOREIGN KEY (student_id) REFERENCES users(id)
  );
`);

const cols = db.prepare("PRAGMA table_info(events)").all();
if (!cols.some(c => c.name === 'image')) {
  db.exec('ALTER TABLE events ADD COLUMN image TEXT');
}

const admin = db.prepare("SELECT id FROM users WHERE role = 'admin'").get();
if (!admin) {
  const hash = bcrypt.hashSync(process.env.ADMIN_PASSWORD || 'admin123', 10);
  db.prepare("INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, 'admin')")
    .run('Admin', 'admin@campus.com', hash);
  console.log('Default admin created: admin@campus.com / admin123');
}

module.exports = db;
