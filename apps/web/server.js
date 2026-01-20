/* Custom Next server that also mounts a WebSocket server on the same HTTP port.

Run with: NODE_ENV=development node server.js

It starts Next in dev mode and attaches ws server at /ws using attachWSSToServer.
*/

const { createServer } = require('http');
const next = require('next');
const { parse } = require('url');

process.env.NEXT_DISABLE_TURBOPACK = process.env.NEXT_DISABLE_TURBOPACK || '1';

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const port = Number(process.env.PORT || 3000);

app.prepare().then(() => {
  const server = createServer((req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error handling request', err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  });

  server.listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${port}`);

    // attach WebSocket server to the same server
    try {
      const { attachWSSToServer } = require('./src/lib/wsServer');
      attachWSSToServer(server, '/ws');
      console.log('> WebSocket server attached at /ws');
    } catch (e) {
      console.warn('> Failed to attach WS server:', e?.message || e);
    }
  });
});
