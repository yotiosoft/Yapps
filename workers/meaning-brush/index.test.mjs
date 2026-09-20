import test from 'node:test';
import assert from 'node:assert/strict';
import worker from './index.mjs';

const origin = 'https://yapps.yotiosoft.com';
const env = {ALLOWED_ORIGIN:origin,TYPESAFE_API_KEY:'test-secret',API_RATE_LIMITER:{limit:async () => ({success:true})}};
const request = (body, headers = {}) => new Request('https://worker.example/api/meaning-brush', {
  method:'POST',headers:{Origin:origin,'Content-Type':'application/json',...headers},body:JSON.stringify(body)
});

test('rejects an unexpected origin before calling Jev', async () => {
  const response = await worker.fetch(request({text:'依頼です。',meaning:'依頼'}, {Origin:'https://other.example'}), env);
  assert.equal(response.status, 403);
});

test('keeps the key server side and returns original offsets', async () => {
  const originalFetch = globalThis.fetch;
  let upstream;
  globalThis.fetch = async (url, options) => {
    upstream = {url, options};
    return new Response(JSON.stringify({answers:{s0:{noul:0.1},s1:{noul:0.9}}}), {status:200});
  };
  try {
    const text = '確認しました。可能なら金曜までにお願いします。';
    const response = await worker.fetch(request({text,meaning:'相手に行動を求めている部分'}), env);
    assert.equal(response.status, 200);
    assert.equal(response.headers.get('Access-Control-Allow-Origin'), origin);
    const body = await response.json();
    assert.deepEqual(body.ranges, [{start:7,end:text.length}]);
    assert.equal(upstream.options.headers.Authorization, 'Bearer test-secret');
    assert.equal(JSON.stringify(body).includes('test-secret'), false);
  } finally { globalThis.fetch = originalFetch; }
});

test('preflight allows the site and content type', async () => {
  const response = await worker.fetch(new Request('https://worker.example/api/meaning-brush', {method:'OPTIONS',headers:{Origin:origin}}), env);
  assert.equal(response.status, 204);
  assert.equal(response.headers.get('Access-Control-Allow-Headers'), 'Content-Type');
});

test('rate limit blocks a valid request before Jev is called', async () => {
  const blocked = {...env, API_RATE_LIMITER:{limit:async () => ({success:false})}};
  const response = await worker.fetch(request({text:'金曜までにお願いします。',meaning:'依頼'}), blocked);
  assert.equal(response.status, 429);
});
