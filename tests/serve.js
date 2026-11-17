/**
 * ChronoTools Local Verification Server
 * 
 * Zero-dependency static HTTP server for local testing and verification.
 * Serves clean URLs, correct MIME types, and 404 handling.
 * 
 * Usage:
 *   node tests/serve.js
 *   node tests/serve.js --port 8080
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const ROOT_DIR = path.resolve(__dirname, '..');
const PORT = parseInt(process.env.PORT || process.argv[2]?.replace('--port=', '') || '3000', 10);

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8'
};

const server = http.createServer((req, res) => {
  const urlPath = decodeURI(req.url.split('?')[0]);
  let cleanPath = urlPath;

  // Resolve directory or file path
  let filePath = path.join(ROOT_DIR, cleanPath);

  // If path is a directory or ends with slash, look for index.html
  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, 'index.html');
  } else if (!fs.existsSync(filePath)) {
    // Try appending .html or /index.html
    if (fs.existsSync(filePath + '.html')) {
      filePath = filePath + '.html';
    } else if (fs.existsSync(path.join(filePath, 'index.html'))) {
      filePath = path.join(filePath, 'index.html');
    }
  }

  // If still not found, serve 404.html
  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    const errorPage = path.join(ROOT_DIR, '404.html');
    res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
    if (fs.existsSync(errorPage)) {
      fs.createReadStream(errorPage).pipe(res);
    } else {
      res.end('<h1>404 Not Found</h1>');
    }
    return;
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';
  const acceptEncoding = req.headers['accept-encoding'] || '';

  const headers = {
    'Content-Type': contentType,
    'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=31536000, immutable',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin'
  };

  const rawStream = fs.createReadStream(filePath);

  if (/\bdeflate\b/.test(acceptEncoding) && (contentType.startsWith('text/') || contentType.includes('javascript') || contentType.includes('json') || contentType.includes('xml'))) {
    headers['Content-Encoding'] = 'deflate';
    res.writeHead(200, headers);
    rawStream.pipe(zlib.createDeflate()).pipe(res);
  } else if (/\bgzip\b/.test(acceptEncoding) && (contentType.startsWith('text/') || contentType.includes('javascript') || contentType.includes('json') || contentType.includes('xml'))) {
    headers['Content-Encoding'] = 'gzip';
    res.writeHead(200, headers);
    rawStream.pipe(zlib.createGzip()).pipe(res);
  } else {
    res.writeHead(200, headers);
    rawStream.pipe(res);
  }
});

server.listen(PORT, () => {
  console.log(`\n\x1b[1m\x1b[32m🚀 ChronoTools Local Verification Server Running!\x1b[0m`);
  console.log(`\x1b[36mLocal URL: http://localhost:${PORT}\x1b[0m\n`);
  console.log('Test Links:');
  console.log(`  • Main Converter:  http://localhost:${PORT}/`);
  console.log(`  • Weeks Tool:      http://localhost:${PORT}/weeks/`);
  console.log(`  • Market Hours:    http://localhost:${PORT}/market-hours/`);
  console.log(`  • Time Difference: http://localhost:${PORT}/difference/`);
  console.log(`  • Unix Timestamp:  http://localhost:${PORT}/unix/`);
  console.log(`  • Remote Teams:    http://localhost:${PORT}/teams/`);
  console.log(`  • Jet Lag Planner: http://localhost:${PORT}/jetlag/`);
  console.log(`  • 404 Error Check: http://localhost:${PORT}/non-existent-test\n`);
  console.log('Press Ctrl+C to stop server.\n');
});
