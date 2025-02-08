const express = require('express');
const path = require('path');

const app = express();
const PORT = 3001;

app.use(express.static(path.join(__dirname, 'public')));

app.get('/home', (req, res) => {
  const userAgent = req.headers['user-agent'];
  const fullUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
  console.log(`[Web Server] Request from: ${userAgent}`);
  console.log(`[Web Server] Full Request URL: ${fullUrl}`);
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/img', (req, res) => {
  const userAgent = req.headers['user-agent'];
  const fullUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
  console.log(`[Web Server] Request from: ${userAgent}`);
  console.log(`[Web Server] Full Request URL: ${fullUrl}`);
  res.sendFile(path.join(__dirname, 'public', 'bear.jpg'));
});

app.listen(PORT, () => {
  console.log(`Web server is running at http://localhost:${PORT}`);
});