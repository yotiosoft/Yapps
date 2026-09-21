import test from 'node:test';
import assert from 'node:assert/strict';
import worker from './index.mjs';

const origin = 'https://yapps.yotiosoft.com';
const query = 'type=int&trials=2&min=1&max=10';
const req = (path = `/api/random/uniform?${query}`, options = {}) => new Request(`https://worker.example${path}`, {
  headers: {Origin: origin}, ...options
});
const env = {ALLOWED_ORIGIN: origin, API_RATE_LIMITER: {limit: async () => ({success: true})}};
const result = () => Response.json({rand_array: [2, 4], upstream: 'private'}, {headers: {Location: 'https://private.example'}});

test('origin, path, method and input failures never reach upstream', async t => {
  t.mock.method(globalThis, 'fetch', () => {throw new Error('must not fetch');});
  for (const headers of [{}, {Origin: 'https://other.example'}, {Origin: `${origin}.evil.example`}]) {
    assert.equal((await worker.fetch(req(undefined, {headers}), env)).status, 403);
  }
  assert.equal((await worker.fetch(req('/api/random/unknown'), env)).status, 404);
  assert.equal((await worker.fetch(req(undefined, {method: 'POST'}), env)).status, 405);
  for (const invalid of [query + '&url=https://evil.example', query + '&trials=1', query.replace('trials=2', 'trials=10001'),
    query.replace('trials=2', 'trials=0'), query.replace('min=1', 'min=NaN'), query.replace('min=1', 'min=20'),
    query.replace('type=int', 'type=unknown')]) {
    assert.equal((await worker.fetch(req(`/api/random/uniform?${invalid}`), env)).status, 400);
  }
  assert.equal(globalThis.fetch.mock.callCount(), 0);
});

test('preflight does not consume the rate limit', async t => {
  const limit = t.mock.fn();
  const response = await worker.fetch(req(undefined, {method: 'OPTIONS'}), {...env, API_RATE_LIMITER: {limit}});
  assert.equal(response.status, 204);
  assert.equal(response.headers.get('Access-Control-Allow-Origin'), origin);
  assert.equal(response.headers.get('Access-Control-Allow-Methods'), 'GET, OPTIONS');
  assert.equal(limit.mock.callCount(), 0);
});

test('limit blocks upstream and limiter failure fails closed', async t => {
  const fetch = t.mock.method(globalThis, 'fetch', result);
  const response = await worker.fetch(req(), {...env, API_RATE_LIMITER: {limit: async () => ({success: false})}});
  assert.equal(response.status, 429);
  assert.equal(response.headers.get('Retry-After'), '60');
  assert.equal((await worker.fetch(req(), {ALLOWED_ORIGIN: origin})).status, 503);
  assert.equal(fetch.mock.callCount(), 0);
});

test('all six distributions preserve the API contract and hide upstream metadata', async t => {
  const fetch = t.mock.method(globalThis, 'fetch', result);
  for (const [distribution, params] of Object.entries({uniform: 'min=1&max=10', normal: 'mu=0&sigma=1',
    beta: 'alpha=1&beta=2', triangular: 'min=1&max=10&mode=5', lambda: 'lambda=1', gamma: 'alpha=1&beta=2'})) {
    const search = `type=int&trials=2&${params}`;
    const response = await worker.fetch(req(`/api/random/${distribution}?${search}`), env);
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), {rand_array: [2, 4]});
    assert.equal(response.headers.get('Location'), null);
    assert.equal(response.headers.get('Cache-Control'), 'no-store');
    assert.equal(response.headers.get('Access-Control-Allow-Origin'), origin);
    const call = fetch.mock.calls.at(-1).arguments;
    assert.equal(call[0], `https://r.yotio.jp/yapps-random/random/${distribution}?${search}`);
    assert.equal(call[1].redirect, 'manual');
    assert.deepEqual(call[1].headers, {Accept: 'application/json'});
  }
});

for (const [name, fail] of Object.entries({
  network: () => {throw new Error('private server address');},
  http: () => new Response('private server address', {status: 503}),
  redirect: () => new Response(null, {status: 302, headers: {Location: 'https://private.example'}}),
  json: () => new Response('<html>private server address</html>'),
  schema: () => Response.json({rand_array: ['private server address']}),
  apiError: () => Response.json({error_message: 'private server address'})
})) {
  test(`falls back on ${name} failure, consuming only one limit count`, async t => {
    let attempts = 0;
    const fetch = t.mock.method(globalThis, 'fetch', (...args) => ++attempts === 1 ? fail(...args) : result());
    const limit = t.mock.fn(async () => ({success: true}));
    const response = await worker.fetch(req(), {...env, API_RATE_LIMITER: {limit}});
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), {rand_array: [2, 4]});
    assert.equal(fetch.mock.callCount(), 2);
    assert.equal(fetch.mock.calls[1].arguments[0], `https://yapps-random-api.onrender.com/random/uniform?${query}`);
    assert.equal(limit.mock.callCount(), 1);
  });
}

test('primary timeout also covers a stalled response body', async t => {
  t.mock.timers.enable({apis: ['setTimeout']});
  let bodyStarted;
  const started = new Promise(resolve => {bodyStarted = resolve;});
  let attempts = 0;
  const fetch = t.mock.method(globalThis, 'fetch', async (_url, {signal}) => {
    if (++attempts === 2) return result();
    return {ok: true, json: () => new Promise((resolve, reject) => {
      signal.addEventListener('abort', () => reject(new Error('timeout')), {once: true});
      bodyStarted();
    })};
  });
  const pending = worker.fetch(req(), env);
  await started;
  t.mock.timers.tick(3000);
  assert.equal((await pending).status, 200);
  assert.equal(fetch.mock.callCount(), 2);
});

test('both upstream timeouts return a sanitized 502', async t => {
  t.mock.timers.enable({apis: ['setTimeout']});
  let started;
  let ready = new Promise(resolve => {started = resolve;});
  t.mock.method(globalThis, 'fetch', (_url, {signal}) => new Promise((resolve, reject) => {
    signal.addEventListener('abort', () => reject(new Error('private server')), {once: true});
    started();
  }));
  const pending = worker.fetch(req(), env);
  await ready;
  ready = new Promise(resolve => {started = resolve;});
  t.mock.timers.tick(3000);
  await ready;
  t.mock.timers.tick(30000);
  const response = await pending;
  assert.equal(response.status, 502);
  assert.equal((await response.text()).includes('private'), false);
});
