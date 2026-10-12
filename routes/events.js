const express = require('express');
const db = require('../db');
const { verifyToken, requireRole } = require('../middleware/auth');
const router = express.Router();
router.use(verifyToken);

const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDir = path.join(__dirname, '..', 'public', 'uploads');
fs.mkdirSync(uploadDir, { recursive: true });

const upload = multer({
  storage: multer.diskStorage({
    destination: uploadDir,
    filename: (req, file, cb) =>
      cb(null, Date.now() + '-' + Math.round(Math.random() * 1e6) + path.extname(file.originalname).toLowerCase())
  }),
  limits: { fileSize: 2 * 1024 * 1024 }, // 2 MB
  fileFilter: (req, file, cb) => cb(null, ['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype))
});

function handleUpload(req, res, next) {
  upload.single('image')(req, res, (err) => {
    if (err) {
      const message = err.code === 'LIMIT_FILE_SIZE' ? 'Image must be under 2 MB' : 'Image upload failed';
      return res.status(400).json({ message });
    }
    next();
  });
}

// STUDENT: all approved events, with registration info
router.get('/', requireRole('student'), (req, res) => {
  const rows = db.prepare(`
    SELECT e.id, e.title, e.description, e.venue, e.event_date, e.image, u.name AS organizer,
      (SELECT COUNT(*) FROM registrations r WHERE r.event_id = e.id) AS registered_count,
      EXISTS (SELECT 1 FROM registrations r WHERE r.event_id = e.id AND r.student_id = ?) AS is_registered
    FROM events e JOIN users u ON u.id = e.organizer_id
    WHERE e.status = 'approved'
    ORDER BY e.event_date ASC
  `).all(req.user.id);
  res.json(rows);
});

// STUDENT: register for an event
router.post('/:id/register', requireRole('student'), (req, res) => {
  const event = db.prepare("SELECT id FROM events WHERE id = ? AND status = 'approved'").get(req.params.id);
  if (!event) return res.status(404).json({ message: 'Event not found' });
  try {
    db.prepare('INSERT INTO registrations (event_id, student_id) VALUES (?, ?)').run(event.id, req.user.id);
    res.status(201).json({ message: 'You are registered!' });
  } catch (e) {
    res.status(400).json({ message: 'You are already registered for this event' });
  }
});

// STUDENT: cancel registration
router.delete('/:id/register', requireRole('student'), (req, res) => {
  db.prepare('DELETE FROM registrations WHERE event_id = ? AND student_id = ?').run(req.params.id, req.user.id);
  res.json({ message: 'Registration cancelled' });
});

// ORGANIZER: create an event (starts as pending)
// ORGANIZER: create an event (starts as pending)
router.post('/', requireRole('organizer'), handleUpload, (req, res) => {
  const { title, description, venue, event_date } = req.body;
  if (!title || !event_date) return res.status(400).json({ message: 'Title and date are required' });
  const image = req.file ? '/uploads/' + req.file.filename : null;
  db.prepare('INSERT INTO events (title, description, venue, event_date, organizer_id, image) VALUES (?, ?, ?, ?, ?, ?)')
    .run(title, description || '', venue || '', event_date, req.user.id, image);
  res.status(201).json({ message: 'Event sent to admin for approval' });
});

// ORGANIZER: my events with status and registration count
router.get('/mine', requireRole('organizer'), (req, res) => {
  const rows = db.prepare(`
    SELECT e.*, (SELECT COUNT(*) FROM registrations r WHERE r.event_id = e.id) AS registered_count
    FROM events e WHERE e.organizer_id = ? ORDER BY e.id DESC
  `).all(req.user.id);
  res.json(rows);
});

module.exports = router;
