// Keep original UTF-16 offsets so selection and deletion operate on the source verbatim.
export function splitSentences(text) {
  const pieces = [];
  let start = 0;
  for (let i = 0; i < text.length; i++) {
    const character = text[i];
    const punctuation = /[。．！？!?]/.test(character);
    const period = character === '.' && (i === text.length - 1 || /[\s.!?"'”’」』]/.test(text[i + 1]));
    if (!punctuation && !period && character !== '\n') continue;
    if (character !== '\n') {
      while (i + 1 < text.length && /[。．！？!?]/.test(text[i + 1])) i++;
      while (i + 1 < text.length && text[i + 1] === '.' &&
        (i + 2 === text.length || /[\s.!?"'”’」』]/.test(text[i + 2]))) i++;
      while (i + 1 < text.length && /["'”’」』]/.test(text[i + 1])) i++;
    }
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
