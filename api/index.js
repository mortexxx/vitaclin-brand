export default async function handler(req, res) {
  const FORWARD_TO =
    'https://script.google.com/macros/s/AKfycbwxbdddmN9GTFiy0hHaqJ3IaHt9y6zOshp_dM7pM9SqwelzRDHxLrX4ux8H_YZ5qTEY/exec';

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'content-type');
  if (req.method === 'OPTIONS') return res.status(204).end();

  const u = new URL(FORWARD_TO);
  const qs = req.url.split('?')[1];
  if (qs) u.search = qs;

  const init = {
    method: req.method,
    headers: { 'content-type': 'text/plain; charset=UTF-8' }
  };

  if (!['GET','HEAD'].includes(req.method)) {
    const body = await new Promise(r => { let d=''; req.on('data', c => d+=c); req.on('end', () => r(d)); });
    init.body = body;
  }

  const upstream = await fetch(u.toString(), init);
  const text = await upstream.text();

  res.setHeader('content-type', upstream.headers.get('content-type') || 'application/json; charset=UTF-8');
  res.status(upstream.status).send(text);
}
