import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, extname } from 'node:path';
const root = resolve('.');
createServer(async (request, response) => {
  const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
  const path = resolve(root, `.${pathname.endsWith('/') ? `${pathname}index.html` : pathname}`);
  if (!path.startsWith(root + '/')) { response.writeHead(403).end(); return; }
  try {
    const data = await readFile(path);
    response.setHeader('Content-Type', ({'.js':'application/javascript','.mjs':'application/javascript','.html':'text/html','.css':'text/css','.json':'application/json'})[extname(path)] || 'application/octet-stream');
    response.end(data);
  } catch { response.writeHead(404).end(); }
}).listen(4173, '127.0.0.1');
