import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

for (const file of ['random.js', 'random.min.js']) {
  test(`${file} uses only the Worker and shows rate-limit errors`, async () => {
    const source = readFileSync(new URL(file, import.meta.url), 'utf8');
    assert.doesNotMatch(source, /r\.yotio\.jp|onrender\.com|fetch_with_fallback/);
    const output = {value: ''};
    let alertMessage;
    let fetched;
    const context = vm.createContext({
      document: {querySelector: () => ({content: 'https://worker.example/api/random'}), getElementById: () => output},
      window: {}, $: () => ({on() {}}), URLSearchParams, AbortController, setTimeout, clearTimeout,
      alert: message => {alertMessage = message;},
      fetch: async url => {fetched = url; return Response.json({rand_array: [2, 4]});}
    });
    vm.runInContext(source, context);
    vm.runInContext("send_and_get('uniform', {type: 'int', trials: 2, min: 1, max: 10})", context);
    await new Promise(resolve => setImmediate(resolve));
    assert.equal(fetched, 'https://worker.example/api/random/uniform?type=int&trials=2&min=1&max=10');
    assert.equal(output.value, '2\n4\n');
    context.fetch = async () => Response.json({error_message: '1分ほど待って再試行してください。'}, {status: 429});
    vm.runInContext("send_and_get('uniform', {})", context);
    await new Promise(resolve => setImmediate(resolve));
    assert.match(alertMessage, /1分ほど待って/);
    assert.equal(output.value, '');
  });
}
