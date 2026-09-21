import {createServer} from 'node:http';
import {readFile, stat} from 'node:fs/promises';
import {resolve, extname, sep} from 'node:path';
import {fileURLToPath} from 'node:url';
import {splitSentences} from './segment.mjs';
import {classifyWithJev} from './jev.mjs';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const port = Number(process.env.PORT || 4173);
const mime = {'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.svg':'image/svg+xml','.png':'image/png'};
const reply = (res, code, data) => {res.writeHead(code, {'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});res.end(JSON.stringify(data));};

createServer(async (req, res) => {
  try {
    if (req.url === '/api/meaning-brush' && req.method === 'POST') {
      if (!process.env.TYPESAFE_API_KEY) return reply(res, 503, {error:'Jev の API キーが設定されていません。TYPESAFE_API_KEY を設定してください。'});
      let raw = '';
      for await (const chunk of req) { raw += chunk; if (raw.length > 30000) return reply(res, 413, {error:'文章が長すぎます。'}); }
      const {text, meaning} = JSON.parse(raw);
      if (typeof text !== 'string' || typeof meaning !== 'string' || !text.trim() || !meaning.trim() || text.length > 10000 || meaning.length > 200) return reply(res, 400, {error:'文章または選びたい意味を確認してください。'});
      if (splitSentences(text).length > 80) return reply(res, 400, {error:'文が多すぎます。80文以内にしてください。'});
      return reply(res, 200, {ranges:await classifyWithJev(text, meaning, process.env.TYPESAFE_API_KEY)});
    }
    if (req.method !== 'GET') return reply(res, 405, {error:'Method not allowed'});
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    const target = resolve(root, `.${pathname.endsWith('/') ? pathname + 'index.html' : pathname}`);
    if (!target.startsWith(root + sep) || /(^|[\\/])\./.test(target.slice(root.length)) || target.includes(`${sep}node_modules${sep}`) || target.includes(`${sep}scripts${sep}`)) return reply(res, 404, {error:'Not found'});
    const info = await stat(target);
    if (!info.isFile() || !mime[extname(target)]) return reply(res, 404, {error:'Not found'});
    res.writeHead(200, {'Content-Type':mime[extname(target)]});
    res.end(await readFile(target));
  } catch (error) {
    if (error.code === 'ENOENT') return reply(res, 404, {error:'Not found'});
    console.error(error);
    reply(res, 500, {error:'処理に失敗しました。しばらくしてから再試行してください。'});
  }
}).listen(port, () => console.log(`Meaning Brush: http://localhost:${port}/meaning-brush/`));
