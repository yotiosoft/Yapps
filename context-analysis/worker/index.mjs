import {splitSentences} from '../segment.mjs';
import {classifyWithJev} from '../jev.mjs';

const json = (data, status, origin) => new Response(JSON.stringify(data), {
  status,
  headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store',
    'Access-Control-Allow-Origin':origin,'Vary':'Origin'}
});

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin');
    const allowed = env.ALLOWED_ORIGIN;
    const path = new URL(request.url).pathname;
    if (path !== '/api/meaning-brush') return json({error:'Not found'}, 404, allowed);
    if (origin !== allowed) return json({error:'Forbidden'}, 403, allowed);
    if (request.method === 'OPTIONS') {
      return new Response(null, {status:204, headers:{
        'Access-Control-Allow-Origin':allowed,
        'Access-Control-Allow-Methods':'POST, OPTIONS',
        'Access-Control-Allow-Headers':'Content-Type',
        'Access-Control-Max-Age':'86400',
        'Vary':'Origin'
      }});
    }
    if (request.method !== 'POST') return json({error:'Method not allowed'}, 405, allowed);
    if (!env.TYPESAFE_API_KEY) return json({error:'Jev API キーが設定されていません。'}, 503, allowed);
    if (!request.headers.get('Content-Type')?.toLowerCase().startsWith('application/json')) return json({error:'JSON を送信してください。'}, 415, allowed);
    if (Number(request.headers.get('Content-Length')) > 30000) return json({error:'文章が長すぎます。'}, 413, allowed);
    const raw = await request.text();
    if (raw.length > 30000) return json({error:'文章が長すぎます。'}, 413, allowed);
    let body;
    try { body = JSON.parse(raw); } catch { return json({error:'JSON が不正です。'}, 400, allowed); }
    const {text, meaning} = body || {};
    if (typeof text !== 'string' || typeof meaning !== 'string' || !text.trim() || !meaning.trim() || text.length > 10000 || meaning.length > 200) return json({error:'文章または選びたい意味を確認してください。'}, 400, allowed);
    if (splitSentences(text).length > 80) return json({error:'文が多すぎます。80文以内にしてください。'}, 400, allowed);
    const limit = await env.API_RATE_LIMITER.limit({key:'meaning-brush-api'});
    if (!limit.success) return json({error:'利用が集中しています。少し待って再試行してください。'}, 429, allowed);
    try {
      return json({ranges:await classifyWithJev(text, meaning, env.TYPESAFE_API_KEY)}, 200, allowed);
    } catch (error) {
      console.error('Jev request failed:', error.message);
      return json({error:'Jev の判定に失敗しました。'}, 502, allowed);
    }
  }
};
