import test from 'node:test';
import assert from 'node:assert/strict';
import { generate, check, parseLines, flavors } from './engine.mjs';

test('negative examples narrow classes while preserving unrelated generalization', () => {
  for (const flavor of Object.keys(flavors)) {
    const result = generate(['ABC-1234', 'ABC-5678'], { method: 'classes', flavor, negative: ['XYZ-1234'] });
    assert.equal(check(result.preview, 'XYZ-1234'), null);
    assert.ok(check(result.preview, 'ABC-9999'));
    assert.equal(result.adjusted, true);
    assert.equal(result.literalFallback, false);
    assert.ok(!result.pattern.includes('(?!'));
  }
});
test('negative examples override length and explicit class requests', () => {
  const result = generate(['ABC-12', 'ABC-34'], { length: 'any', overrides: { 2: 'class' }, negative: ['ABC-123'] });
  assert.equal(check(result.preview, 'ABC-123'), null);
  assert.ok(check(result.preview, 'ABC-12'));
  assert.ok(check(result.preview, 'ABC-34'));
});
test('correlated values fall back to literal examples without admitting negatives', () => {
  const result = generate(['AB-12', 'CD-34'], { negative: ['AB-34', 'CD-12'] });
  assert.equal(result.literalFallback, true);
  for (const value of ['AB-12', 'CD-34']) assert.ok(check(result.preview, value));
  for (const value of ['AB-34', 'CD-12']) assert.equal(check(result.preview, value), null);
});
test('contradictory examples fail rather than producing a misleading regex', () => {
  for (const scope of ['full', 'contains', 'prefix', 'suffix']) {
    assert.throws(() => generate(['cat'], { scope, negative: ['cat'] }), /矛盾/);
  }
  for (const [scope, value] of [['contains', 'a cat b'], ['prefix', 'cats'], ['suffix', 'a cat']]) {
    assert.throws(() => generate(['cat'], { scope, negative: [value] }), /一致範囲/);
  }
  assert.ok(generate(['cat'], { negative: ['cats'] }));
});
test('negative constraints work across structures, scopes, literals and Unicode', () => {
  const positive = ['AB-12', '日本語😀34', 'x.y'];
  const negative = ['XY-12', '日本語😀56', 'x+y'];
  for (const scope of ['full', 'contains', 'prefix', 'suffix']) for (const method of ['literal', 'smart', 'classes']) {
    const result = generate(positive, { scope, method, negative });
    for (const value of positive) assert.ok(check(result.preview, value));
    for (const value of negative) assert.equal(check(result.preview, value), null);
  }
  assert.equal(generate(['AB-12'], { negative: ['other'] }).adjusted, false);
});

test('default keeps shared text and infers digit length', () => {
  const result = generate(['ABC-1234', 'ABC-5678']);
  assert.equal(result.pattern, '^ABC-[0-9]{4}$');
  assert.ok(check(result.preview, 'ABC-9999'));
  for (const value of ['XYZ-1234', 'ABC-12', 'ABC-1234\n', ' ABC-1234', 'ABC-１２３４']) assert.equal(check(result.preview, value), null);
});
test('literal input escapes operators, backslashes and controls', () => {
  const values = ['a+b(c)[d]{2}?.*^$|\\', '<script>alert(1)</script>', '日本語😀', 'a\tb', 'x\x00y'];
  const result = generate(values, { method: 'literal' });
  for (const value of values) assert.ok(check(result.preview, value));
  assert.equal(check(result.preview, 'abcccc'), null);
});
test('class inference, lengths and overrides', () => {
  assert.equal(generate(['ABC-1234'], { method: 'classes' }).pattern, '^[A-Z]{3}-[0-9]{4}$');
  const examples = ['ABC-12', 'XYZ-1234'];
  assert.equal(generate(examples).pattern, '^[A-Z]{3}-[0-9]{2,4}$');
  assert.ok(check(generate(examples).preview, 'DEF-123'));
  assert.equal(check(generate(examples).preview, 'DEF-1'), null);
  assert.ok(check(generate(examples, { length: 'any' }).preview, 'D-123456789'));
  const fixed = generate(examples, { overrides: { 0: 'fixed', 2: 'fixed' } });
  assert.equal(check(fixed.preview, 'DEF-12'), null);
  assert.equal(check(fixed.preview, 'ABC-123'), null);
  assert.ok(check(fixed.preview, 'XYZ-1234'));
});
test('scope applies to every alternative', () => {
  for (const flavor of Object.keys(flavors)) {
    const full = generate(['cat', 'dog!'], { method: 'literal', flavor });
    assert.ok(check(full.preview, 'dog!'));
    assert.equal(check(full.preview, 'catfish'), null);
    assert.equal(check(full.preview, 'hotdog!'), null);
  }
  assert.deepEqual(check(generate(['cat'], { scope: 'contains' }).preview, 'a cat b'), { index: 2, text: 'cat' });
  assert.ok(check(generate(['cat'], { scope: 'prefix' }).preview, 'cats'));
  assert.equal(check(generate(['cat'], { scope: 'prefix' }).preview, 'a cat'), null);
  assert.ok(check(generate(['cat'], { scope: 'suffix' }).preview, 'a cat'));
  assert.equal(check(generate(['cat'], { scope: 'suffix' }).preview, 'cats'), null);
});
test('flavor boundaries and multiple structures', () => {
  assert.equal(generate(['ABC-1'], { flavor: 'python' }).pattern, '\\AABC-[0-9]\\Z');
  for (const flavor of ['java', 'dotnet', 'pcre', 'go']) assert.equal(generate(['ABC-1'], { flavor }).pattern, '\\AABC-[0-9]\\z');
  const samples = ['AB-123', 'XY/45', '日本語😀42', 'a  b', 'a\tb'];
  for (const method of ['smart', 'classes', 'literal']) {
    const result = generate(samples, { method });
    for (const value of samples) assert.ok(check(result.preview, value));
  }
});
test('input validation preserves whitespace and rejects limits', () => {
  assert.deepEqual(parseLines(' a \r\n\n b\rb\n a '), [' a ', ' b', 'b']);
  assert.throws(() => parseLines('x'.repeat(501)));
  assert.throws(() => parseLines(Array(101).fill('x').join('\n')));
  assert.throws(() => generate([]));
});
test('all positive examples survive inference across deterministic varied data', () => {
  const samples = Array.from({ length: 70 }, (_, i) => `${i % 2 ? '日本' : 'AB'}-${i}.${i % 3 ? 'xy' : 'z'}[😀]`);
  for (const method of ['literal', 'smart', 'classes']) for (const length of ['observed', 'any']) {
    const result = generate(samples, { method, length });
    for (const value of samples) assert.ok(check(result.preview, value));
  }
});
