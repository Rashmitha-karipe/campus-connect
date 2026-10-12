require('dotenv').config();
const express = require('express');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/events', require('./routes/events'));
app.use('/api/admin', require('./routes/admin'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Running at http://localhost:${PORT}`));
