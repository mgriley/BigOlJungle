const express = require('express');
const path = require('path');
const app = express();
const port = 3000;

/*
API routes.
Place before the static site middleware.
*/

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello API' });
});

// Serve static files from ../site/dist (built by vite)
let staticPath = path.join(__dirname, '../site/dist');
app.use(express.static(staticPath));

// SPA fallback for everything else
/*
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(staticPath, 'index.html'));
  }
});
*/

app.listen(port, () => {
  console.log(`Listening on http://localhost:${port}`);
});