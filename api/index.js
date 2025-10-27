export default async function handler(req, res) {
  // URL do seu Apps Script (termina com /exec)
  const FORWARD_TO = 'https://script.google.com/macros/s/AKfycbwxbdddmN9GTFiy0hHaqJ3IaHt9y6zOshp_dM7pM9SqwelzRDHxLrX4ux8H_YZ5qTEY/exec';

  const url = new URL(FORWARD_TO);
  if (req.url.includes('?')) url.search = req.url.split('?')[1];

  const init = { method: req.method, headers: { 'content-type': 'text/plain;charset=UTF-8' } };
  if (!['GET','HEAD','OPTIONS'].includes(req.method)) {
    const body = await new Promise(r => { let d=''; req.on('data', c => d+=c); req.on('end', () => r(d)); });
    init.body = body;
  }

  const upstream = await fetch(url, init);
  const text = await upstream.text();

  res.setHeader('access-control-allow-origin', '*');
  res.setHeader('content-type', upstream.headers.get('content-type') || 'application/json; charset=UTF-8');
  res.status(upstream.status).send(text);
}
