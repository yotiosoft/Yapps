// Generate a conservative, portable subset. Never interpret sample text as regex code.
export const flavors = {
  javascript: { name: 'JavaScript', start: '^', end: '$', note: 'フラグなしで使用してください。JavaScript の RegExp で検証します。' },
  python: { name: 'Python (re)', start: '\\A', end: '\\Z', note: 'Python 3 の re 用です。文字列リテラルではバックスラッシュのエスケープが必要です。' },
  java: { name: 'Java', start: '\\A', end: '\\z', note: 'java.util.regex.Pattern 用です。Java の文字列内では \\ を \\\\ にしてください。' },
  dotnet: { name: '.NET', start: '\\A', end: '\\z', note: 'System.Text.RegularExpressions 用です。C# では逐語的文字列 @"…" も利用できます。' },
  pcre: { name: 'PCRE2 / PHP', start: '\\A', end: '\\z', note: 'PCRE2 用です。PHP では区切り文字を追加し、その文字をエスケープしてください。' },
  go: { name: 'Go (RE2)', start: '\\A', end: '\\z', note: 'Go の regexp 用です。後読み・先読み・後方参照を使わずに生成します。' },
};
export function parseLines(text) {
  const lines = text.split(/\r\n|\n|\r/).filter(line => line !== '');
  if (lines.length > 100 || lines.some(line => line.length > 500)) throw new Error('各欄は100行まで、1行は500文字までにしてください。');
  return [...new Set(lines)];
}
export function escapeLiteral(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/[\x00-\x1f\x7f]/g, char => '\\x' + char.charCodeAt(0).toString(16).padStart(2, '0'));
}
function kind(char) {
  if (/[0-9]/.test(char)) return 'digit';
  if (/[A-Z]/.test(char)) return 'upper';
  if (/[a-z]/.test(char)) return 'lower';
  if (/[ \t]/.test(char)) return 'space';
  return 'literal';
}
const classes = { digit: '[0-9]', upper: '[A-Z]', lower: '[a-z]', space: '[ \\t]' };
export function tokenize(text) {
  const tokens = [];
  for (const char of text) {
    const type = kind(char);
    if (tokens.at(-1)?.type === type) tokens.at(-1).text += char;
    else tokens.push({ type, text: char });
  }
  return tokens;
}
export function groupExamples(examples) {
  const groups = new Map();
  for (const example of examples) {
    const tokens = tokenize(example);
    const key = JSON.stringify(tokens.map(t => t.type === 'literal' ? [t.type, t.text] : [t.type]));
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(tokens);
  }
  return [...groups.values()];
}
function either(parts) {
  const unique = [...new Set(parts)];
  return unique.length === 1 ? unique[0] : '(?:' + unique.join('|') + ')';
}
function quantity(lengths, lengthMode) {
  if (lengthMode === 'any') return '+';
  const min = Math.min(...lengths), max = Math.max(...lengths);
  return min === max ? (min === 1 ? '' : `{${min}}`) : `{${min},${max}}`;
}
export function generate(examples, { method = 'smart', length = 'observed', scope = 'full', flavor = 'javascript', overrides = {}, negative = [] } = {}) {
  if (!examples.length) throw new Error('一致させたい文字列を1行以上入力してください。');
  const groups = groupExamples(examples);
  const prefix = scope === 'full' || scope === 'prefix';
  const suffix = scope === 'full' || scope === 'suffix';
  const previewFor = body => (prefix ? '^' : '') + body + (suffix ? '$' : '');
  const conflictsFor = body => {
    const regex = new RegExp(previewFor(body), 'u');
    return negative.filter(value => regex.test(value)).length;
  };
  // With substring/prefix/suffix matching, a negative example containing a required
  // literal match cannot be separated without changing the requested scope.
  if (negative.length && conflictsFor(either(examples.map(escapeLiteral)))) {
    throw new Error('一致例と除外例が矛盾しています。同じ文字列が両方にないか確認してください。部分・先頭・末尾一致では、一致例を含む除外例も分離できません。一致範囲や入力例を見直してください。');
  }
  let adjusted = false, literalFallback = false;
  let body;
  if (method === 'literal') body = either(examples.map(escapeLiteral));
  else body = either(groups.map(rows => {
    const parts = rows[0].map((token, index) => {
    const values = rows.map(row => row[index].text);
    const rule = groups.length === 1 ? overrides[index] || 'auto' : 'auto';
    const generalize = rule === 'class' || (rule === 'auto' && (method === 'classes' || token.type === 'digit' || new Set(values).size > 1));
    return generalize && classes[token.type]
      ? classes[token.type] + quantity(values.map(v => v.length), length)
      : either(values.map(escapeLiteral));
    });
    let conflicts = negative.length ? conflictsFor(parts.join('')) : 0;
    if (!conflicts) return parts.join('');
    adjusted = true;
    // Narrow only parts that eliminate a conflict. Preserve the other inferred
    // classes, and use finite alternatives for compatibility with RE2 as well.
    for (let index = 0; index < parts.length && conflicts; index++) {
      const fixed = either(rows.map(row => escapeLiteral(row[index].text)));
      if (fixed === parts[index]) continue;
      const previous = parts[index];
      parts[index] = fixed;
      const remaining = conflictsFor(parts.join(''));
      if (remaining < conflicts) conflicts = remaining;
      else parts[index] = previous;
    }
    if (!conflicts) return parts.join('');
    // Correlations between parts can require preserving complete examples.
    literalFallback = true;
    return either(rows.map(row => escapeLiteral(row.map(token => token.text).join(''))));
  }));
  const selected = flavors[flavor];
  if (!selected) throw new Error('利用先を選択してください。');
  return {
    pattern: (prefix ? selected.start : '') + body + (suffix ? selected.end : ''),
    // Preview the same generated body in JS, not a foreign engine's syntax.
    preview: (prefix ? '^' : '') + body + (suffix ? '$' : ''),
    groups: groups.length,
    adjusted,
    literalFallback,
  };
}
export function check(preview, text) {
  const match = new RegExp(preview, 'u').exec(text);
  return match ? { index: match.index, text: match[0] } : null;
}
