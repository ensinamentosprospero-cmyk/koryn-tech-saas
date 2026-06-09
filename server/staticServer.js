import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { env } from './config/env.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST_DIR = path.resolve(__dirname, '..', 'dist');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

function getContentType(filePath) {
  return MIME_TYPES[path.extname(filePath).toLowerCase()] || 'application/octet-stream';
}

export function canServeStatic() {
  return env.serveStatic && fs.existsSync(DIST_DIR);
}

export function serveStatic(urlPathname, response, method = 'GET') {
  if (!canServeStatic()) return false;

  let pathname = decodeURIComponent(urlPathname.split('?')[0]);
  if (pathname === '/') pathname = '/index.html';

  const relativePath = pathname.replace(/^\/+/, '');
  const candidatePath = path.resolve(DIST_DIR, relativePath);

  if (!candidatePath.startsWith(DIST_DIR)) {
    response.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('Forbidden');
    return true;
  }

  if (fs.existsSync(candidatePath) && fs.statSync(candidatePath).isFile()) {
    if (method === 'HEAD') {
      response.writeHead(200, { 'Content-Type': getContentType(candidatePath) });
      response.end();
      return true;
    }

    const content = fs.readFileSync(candidatePath);
    response.writeHead(200, { 'Content-Type': getContentType(candidatePath) });
    response.end(content);
    return true;
  }

  const indexPath = path.join(DIST_DIR, 'index.html');
  if (!fs.existsSync(indexPath)) return false;

  if (method === 'HEAD') {
    response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    response.end();
    return true;
  }

  response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  response.end(fs.readFileSync(indexPath));
  return true;
}

export function getDistDir() {
  return DIST_DIR;
}
