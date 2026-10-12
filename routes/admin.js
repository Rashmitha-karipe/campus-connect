const express = require('express');
const db = require('../db');
const { verifyToken, requireRole } = require('../middleware/auth');
const router = express.Router();
router.use(verifyToken, requireRole('admin'));

// GET /api/admin/events?status=pending
router.get('/events', (req, res) => {
  const { status } = req.query;
  const base = `SELECT e.*, u.name AS organizer FROM events e JOIN users u ON u.id = e.organizer_id`;
  const rows = ['pending', 'approved', 'rejected'].includes(status)
    ? db.prepare(base + ' WHERE e.status = ? ORDER BY e.id DESC').all(status)
    : db.prepare(base + ' ORDER BY e.id DESC').all();
  res.json(rows);
});

// PATCH /api/admin/events/:id  { status: 'approved' | 'rejected' }
router.patch('/events/:id', (req, res) => {
  const { status } = req.body;
  if (!['approved', 'rejected'].includes(status)) return res.status(400).json({ message: 'Invalid status' });
  const result = db.prepare('UPDATE events SET status = ? WHERE id = ?').run(status, req.params.id);
  if (!result.changes) return res.status(404).json({ message: 'Event not found' });
  res.json({ message: `Event ${status}` });
});

module.exports = router;
