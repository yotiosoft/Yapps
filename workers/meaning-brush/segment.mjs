// Keep original UTF-16 offsets so selection and deletion operate on the source verbatim.
export function splitSentences(text) {
  const pieces = [];
  let start = 0;
  for (let i = 0; i < text.length; i++) {
    if (!/[。！？!?\n]/.test(text[i])) continue;
    const end = i + 1;
    const raw = text.slice(start, end);
    const left = raw.search(/\S/);
    if (left !== -1) {
      const content = raw.trimEnd();
      pieces.push({start:start + left, end:start + content.length, text:raw.slice(left, content.length)});
    }
    start = end;
  }
  if (start < text.length) {
    const raw = text.slice(start);
    const left = raw.search(/\S/);
    if (left !== -1) {
      const content = raw.trimEnd();
      pieces.push({start:start + left, end:start + content.length, text:raw.slice(left, content.length)});
    }
  }
  return pieces;
}

export function pickRanges(sentences, answers, threshold = 0.65) {
  return sentences.flatMap((sentence, index) =>
    Number(answers[`s${index}`]?.noul) >= threshold ? [{start:sentence.start,end:sentence.end}] : []);
}
