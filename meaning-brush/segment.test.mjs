import test from 'node:test';
import assert from 'node:assert/strict';
import {splitSentences, pickRanges} from './segment.mjs';

test('keeps exact UTF-16 ranges for Japanese sentences', () => {
  const text = '😀確認しました。 可能であれば金曜までにいただけると助かります。\n今回は参加できません。';
  const parts = splitSentences(text);
  assert.equal(parts.length, 3);
  assert.deepEqual(parts.map(part => text.slice(part.start, part.end)), parts.map(part => part.text));
  assert.deepEqual(pickRanges(parts, {s0:{noul:0.1},s1:{noul:0.92},s2:{noul:0.2}}), [{start:parts[1].start,end:parts[1].end}]);
});
