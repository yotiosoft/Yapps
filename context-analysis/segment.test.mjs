import test from 'node:test';
import assert from 'node:assert/strict';
import {splitSentences, pickRanges} from './segment.mjs';
import {splitSentences as splitWorkerSentences} from '../workers/meaning-brush/segment.mjs';

test('keeps exact UTF-16 ranges for Japanese sentences', () => {
  const text = '😀確認しました。 可能であれば金曜までにいただけると助かります。\n今回は参加できません。';
  const parts = splitSentences(text);
  assert.equal(parts.length, 3);
  assert.deepEqual(parts.map(part => text.slice(part.start, part.end)), parts.map(part => part.text));
  assert.deepEqual(pickRanges(parts, {s0:{noul:0.1},s1:{noul:0.92},s2:{noul:0.2}}), [{start:parts[1].start,end:parts[1].end}]);
});

test('splits English periods and half-width/full-width questions and exclamations', () => {
  const text = 'Please send it by Friday. I think it will work? Really!\nお願いできますか？もちろん！本当ですか?はい!';
  const expected = [
    'Please send it by Friday.', 'I think it will work?', 'Really!',
    'お願いできますか？', 'もちろん！', '本当ですか?', 'はい!'
  ];
  for (const split of [splitSentences, splitWorkerSentences]) {
    const parts = split(text);
    assert.deepEqual(parts.map(part => part.text), expected);
    assert.deepEqual(parts.map(part => text.slice(part.start, part.end)), expected);
  }
});

test('keeps decimals, URLs, punctuation runs and closing quotes together', () => {
  const text = 'Version 1.2 is at example.com. "Really?!" Yes... Done.';
  const expected = ['Version 1.2 is at example.com.', '"Really?!"', 'Yes...', 'Done.'];
  for (const split of [splitSentences, splitWorkerSentences]) {
    assert.deepEqual(split(text).map(part => part.text), expected);
  }
});
