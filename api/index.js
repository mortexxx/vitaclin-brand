// /api/index.js  (Vercel Serverless Function - Node.js)
export default async function handler(req, res) {
  // ===== C O N F I G =====
  const FORWARD_TO = 'https://script.google.com/macros/s/AKfycbwxbdddmN9GTFiy0hHaqJ3IaHt9y6zOshp_dM7pM9SqwelzRDHxLrX4ux8H_YZ5qTEY/exec';

  // ===== C O R S  (resolve preflight e libera navegador) =====
  res.setHeader('access-control-allow-origin', '*');
  res.setHeader('access-control-allow-methods', 'GET,POST,OPTIONS,HEAD');
  res.setHeader('access-control-allow-headers', 'content-type');
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  // ===== HEALTH CHECK local (não depende do Apps Script) =====
  // GET https://api.vitaclin.app.br/api?health=1
  try {
    const urlFull = new URL('https://dummy.local' + (req.url || '/'));
    if (urlFull.searchParams.has('health')) {
      res.setHeader('content-type', 'application/json; charset=UTF-8');
      res.status(200).send(JSON.stringify({ ok: true, ts: Date.now() }));
      return;
    }
  } catch (_) {
    // continua fluxo normal
  }

  // ===== PROXY para o Apps Script (mantém querystring) =====
  try {
    const url = new URL(FORWARD_TO);
    if (req.url && req.url.includes('?')) {
      url.search = req.url.split('?')[1];
    }

    const init = {
      method: req.method,
      headers: { 'content-type': 'text/plain;charset=UTF-8' }
    };

    if (!['GET', 'HEAD'].includes(req.method)) {
      const body = await new Promise(resolve => {
        let data = '';
        req.on('data', c => (data += c));
        req.on('end', () => resolve(data));
      });
      init.body = body;
    }

    const upstream = await fetch(url, init);
    const text = await upstream.text();

    res.setHeader('content-type', upstream.headers.get('content-type') || 'application/json; charset=UTF-8');
    res.status(upstream.status).send(text);
  } catch (err) {
    res.setHeader('content-type', 'application/json; charset=UTF-8');
    res.status(502).send(JSON.stringify({ ok: false, error: String(err) }));
  }
}
