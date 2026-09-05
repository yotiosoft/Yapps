import { flavors, parseLines, groupExamples, generate, check } from './engine.mjs';
const $ = id => document.getElementById(id);
let overrides = {};
let current = null;
for (const [value, flavor] of Object.entries(flavors)) $('flavor').add(new Option(flavor.name, value));
const descriptions = {
  smart: '数字は一般化し、半角英字・空白は例の間で変化する部分だけ一般化します。',
  literal: '入力例のいずれかをそのまま許可します。文字数や部分ごとの設定は適用しません。',
  classes: '半角の大文字・小文字・数字・空白を文字種に置き換えます。日本語・記号は固定します。',
};
function renderParts(examples) {
  $('parts').replaceChildren();
  const groups = groupExamples(examples);
  const enabled = groups.length === 1 && $('method').value !== 'literal';
  $('parts-help').textContent = enabled ? '「固定」は、その部分に入力された値だけを許可します。「自動」は生成方法に従います。' : '同じ文字種の並びを持つ例で、推測または文字種による生成を選ぶと調整できます。';
  if (!enabled) return;
  groups[0][0].forEach((token, index) => {
    const row = document.createElement('div'); row.className = 'part';
    const label = document.createElement('label'); label.htmlFor = `part-${index}`;
    const code = document.createElement('code'); code.textContent = token.text; label.append(code);
    const select = document.createElement('select'); select.id = label.htmlFor;
    select.add(new Option('自動', 'auto')); select.add(new Option('固定（入力値だけ）', 'fixed'));
    if (token.type !== 'literal') select.add(new Option('文字種で一般化', 'class'));
    select.value = overrides[index] || 'auto';
    select.addEventListener('change', () => { overrides[index] = select.value; update(false); });
    row.append(label, select); $('parts').append(row);
  });
}
function rowFor(text, match, label, pass) {
  const row = document.createElement('div'); row.className = 'result';
  const badge = document.createElement('span'); badge.className = pass ? 'pass' : 'fail'; badge.textContent = label;
  const code = document.createElement('code');
  if (match) {
    const mark = document.createElement('mark'); mark.textContent = match.text;
    code.append(text.slice(0, match.index), mark, text.slice(match.index + match.text.length));
  } else code.textContent = text;
  row.append(badge, code); return row;
}
function update(parts = true) {
  $('copy-status').textContent = '';
  $('error').textContent = '';
  $('adjustment').textContent = '';
  $('method-help').textContent = descriptions[$('method').value];
  $('length').disabled = $('method').value === 'literal';
  const flavor = flavors[$('flavor').value];
  $('flavor-help').textContent = flavor.note;
  $('preview-note').textContent = $('flavor').value === 'javascript' ? 'JavaScript で検証しています。部分一致は最初の一致箇所を表示します。' : '検証は生成内容を JavaScript に置き換えた参考結果です。選択したエンジン自体では実行しません。利用先でも確認してください。';
  try {
    const positive = parseLines($('positive').value), negative = parseLines($('negative').value), tests = parseLines($('test').value);
    if (parts) renderParts(positive);
    if (!positive.length) {
      current = null; $('pattern').value = ''; $('copy').disabled = true;
      $('results').replaceChildren(); $('test-results').replaceChildren();
      $('status').textContent = '文字列を入力すると自動で生成します。';
      $('status').className = '';
      return;
    }
    current = generate(positive, { method: $('method').value, length: $('length').value, scope: $('scope').value, flavor: $('flavor').value, overrides, negative });
    $('adjustment').textContent = current.literalFallback
      ? '除外例を優先し、一部の構造は入力例そのものだけを許可する形に絞り込みました。'
      : current.adjusted ? '除外例を優先し、一般化した部分の一部を入力値だけに絞り込みました。' : '';
    $('pattern').value = current.pattern; $('copy').disabled = false;
    let hits = 0, conflicts = 0;
    $('results').replaceChildren();
    for (const text of positive) {
      const match = check(current.preview, text); if (match) hits++;
      $('results').append(rowFor(text, match, match ? '一致 ✓' : '未一致', !!match));
    }
    for (const text of negative) {
      const match = check(current.preview, text); if (match) conflicts++;
      $('results').append(rowFor(text, match, match ? '衝突 !' : '除外 ✓', !match));
    }
    $('status').textContent = `一致例 ${hits}/${positive.length} 件 · 除外例との衝突 ${conflicts} 件` + (current.groups > 1 ? ` · ${current.groups} 種類の構造を OR で結合` : '');
    $('status').className = conflicts || hits !== positive.length ? 'fail' : 'pass';
    $('test-results').replaceChildren(...tests.map(text => { const match = check(current.preview, text); return rowFor(text, match, match ? '一致' : '未一致', !!match); }));
  } catch (error) {
    current = null; $('pattern').value = ''; $('copy').disabled = true;
    if (parts) { $('parts').replaceChildren(); $('parts-help').textContent = '入力例を確認してください。'; }
    $('results').replaceChildren(); $('test-results').replaceChildren(); $('status').textContent = '';
    $('error').textContent = error.message;
  }
}
for (const id of ['positive', 'negative', 'test']) $(id).addEventListener('input', () => {
  if (id === 'positive') overrides = {};
  update(id === 'positive');
});
for (const id of ['method', 'scope', 'length', 'flavor']) $(id).addEventListener('change', () => update());
$('copy').addEventListener('click', async () => {
  if (!current) return;
  try { await navigator.clipboard.writeText(current.pattern); $('copy-status').textContent = 'コピーしました。'; }
  catch { $('pattern').focus(); $('pattern').select(); $('copy-status').textContent = '自動コピーできませんでした。選択した正規表現を手動でコピーしてください。'; }
});
update();
