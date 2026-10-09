"""Serve demo/ for local development with caching disabled, so edits show on reload."""
import functools
import http.server
import sys
from pathlib import Path

DEMO = Path(__file__).resolve().parent.parent / 'demo'
PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8080


class NoCacheHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store')
        super().end_headers()


handler = functools.partial(NoCacheHandler, directory=str(DEMO))
with http.server.ThreadingHTTPServer(('127.0.0.1', PORT), handler) as server:
    print(f'Serving {DEMO} at http://localhost:{PORT}')
    server.serve_forever()
