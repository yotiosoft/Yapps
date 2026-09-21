const upstreams = [
  {base: 'https://r.yotio.jp/yapps-random', timeout: 3000},
  {base: 'https://yapps-random-api.onrender.com', timeout: 30000}
];
const parameters = {
  uniform: ['min', 'max'], normal: ['mu', 'sigma'], beta: ['alpha', 'beta'],
  triangular: ['min', 'max', 'mode'], lambda: ['lambda'], gamma: ['alpha', 'beta']
};

function json(data, status, origin, extra = {}) {
  return new Response(JSON.stringify(data), {status, headers: {
    'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store',
    'Access-Control-Allow-Origin': origin, 'Vary': 'Origin', ...extra
  }});
}

function validQuery(query, distribution) {
  const required = ['type', 'trials', ...parameters[distribution]];
  if ([...query.keys()].length !== required.length || required.some(key => query.getAll(key).length !== 1)) return false;
  if (!['int', 'float'].includes(query.get('type'))) return false;
  const trials = Number(query.get('trials'));
  if (!Number.isInteger(trials) || trials < 1 || trials > 10000) return false;
  if (parameters[distribution].some(key => !query.get(key).trim() || !Number.isFinite(Number(query.get(key))))) return false;
  const n = key => Number(query.get(key));
  if (['uniform', 'triangular'].includes(distribution) && n('min') > n('max')) return false;
  if (distribution === 'triangular' && (n('min') === n('max') || n('mode') < n('min') || n('mode') > n('max'))) return false;
  if (distribution === 'normal' && n('sigma') < 0) return false;
  if (['beta', 'gamma'].includes(distribution) && (n('alpha') <= 0 || n('beta') <= 0)) return false;
  if (distribution === 'lambda' && n('lambda') <= 0) return false;
  return true;
}

export default {
  async fetch(request, env) {
    const allowed = env.ALLOWED_ORIGIN;
    const reply = (message, status, headers) => json({error_message: message}, status, allowed, headers);
    if (!allowed || request.headers.get('Origin') !== allowed) return reply('Forbidden', 403);
    const url = new URL(request.url);
    const match = /^\/api\/random\/(uniform|normal|beta|triangular|lambda|gamma)$/.exec(url.pathname);
    if (!match) return reply('Not found', 404);
    if (request.method === 'OPTIONS') return new Response(null, {status: 204, headers: {
      'Access-Control-Allow-Origin': allowed, 'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Max-Age': '86400', 'Vary': 'Origin'
    }});
    if (request.method !== 'GET') return reply('Method not allowed', 405, {Allow: 'GET, OPTIONS'});
    if (url.search.length > 2000 || !validQuery(url.searchParams, match[1])) {
      return reply('パラメータを確認してください。試行回数は1〜10000回です。', 400);
    }
    try {
      const limit = await env.API_RATE_LIMITER.limit({key: 'random-api'});
      if (!limit.success) return reply('利用が集中しています。1分ほど待って再試行してください。', 429, {'Retry-After': '60'});
    } catch {
      return reply('現在利用できません。少し待って再試行してください。', 503);
    }
    for (const {base, timeout} of upstreams) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeout);
      try {
        const response = await fetch(`${base}/random/${match[1]}?${url.searchParams}`, {
          signal: controller.signal, redirect: 'error', headers: {Accept: 'application/json'}
        });
        if (!response.ok) {
          await response.body?.cancel();
          continue;
        }
        const data = await response.json();
        if (!Array.isArray(data?.rand_array) || data.rand_array.length !== Number(url.searchParams.get('trials')) ||
            !data.rand_array.every(value => typeof value === 'number' && Number.isFinite(value))) continue;
        return json({rand_array: data.rand_array}, 200, allowed);
      } catch {
        // 接続失敗・タイムアウト・不正な応答では次のサーバーへ切り替える。
      } finally {
        clearTimeout(timer);
      }
    }
    return reply('乱数生成サーバーに接続できません。時間をおいて再試行してください。', 502);
  }
};
