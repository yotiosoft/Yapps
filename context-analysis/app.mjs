const source = document.querySelector('#source');
const query = document.querySelector('#query');
const result = document.querySelector('#result');
const status = document.querySelector('#status');
const count = document.querySelector('#count');
const run = document.querySelector('#run');
const copy = document.querySelector('#copy');
const remove = document.querySelector('#delete');
const clear = document.querySelector('#clear');
let ranges = [];
let analyzedText = '';

const sample = '資料を確認しました。可能であれば金曜までにいただけると助かります。おそらく来週には結果が出ると思います。ただ、今回は追加の打ち合わせには参加できません。';

function setStatus(message) { status.textContent = message; }
function selected() { return ranges.filter(range => range.active); }
function updateControls() {
  const n = selected().length;
  count.textContent = ranges.length ? `${n} / ${ranges.length} 箇所を選択中` : '';
  copy.disabled = remove.disabled = clear.disabled = n === 0;
}
function render() {
  result.replaceChildren();
  const text = analyzedText || source.value;
  if (!text) { result.textContent = '選択結果がここに表示されます。'; updateControls(); return; }
  let cursor = 0;
  for (const [index, range] of ranges.entries()) {
    result.append(document.createTextNode(text.slice(cursor, range.start)));
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `selection${range.active ? '' : ' off'}`;
    button.textContent = text.slice(range.start, range.end);
    button.setAttribute('aria-pressed', String(range.active));
    button.title = range.active ? 'クリックして選択を解除' : 'クリックして選択';
    button.addEventListener('click', () => { ranges[index].active = !ranges[index].active; render(); });
    result.append(button);
    cursor = range.end;
  }
  result.append(document.createTextNode(text.slice(cursor)));
  updateControls();
}
function normalizeRanges(raw, text) {
  if (!Array.isArray(raw)) throw new Error('判定結果を読み取れませんでした。');
  const valid = raw.filter(item => Number.isInteger(item.start) && Number.isInteger(item.end) && item.start >= 0 && item.end <= text.length && item.start < item.end)
    .sort((a, b) => a.start - b.start || a.end - b.end);
  const merged = [];
  for (const item of valid) {
    const last = merged.at(-1);
    if (last && item.start < last.end) last.end = Math.max(last.end, item.end);
    else merged.push({start:item.start, end:item.end, active:true});
  }
  return merged;
}
async function infer(text, meaning) {
  const endpoint = ['localhost', '127.0.0.1'].includes(location.hostname)
    ? '/api/meaning-brush'
    : document.querySelector('meta[name="meaning-brush-api-url"]')?.content || '/api/meaning-brush';
  const response = await fetch(endpoint, {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({text, meaning})});
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || '判定に失敗しました。');
  return normalizeRanges(data.ranges, text);
}
run.addEventListener('click', async () => {
  const text = source.value;
  const meaning = query.value.trim();
  if (!text.trim() || !meaning) { setStatus('文章と選びたい意味を入力してください。'); return; }
  run.disabled = true;
  setStatus('意味を判定しています…');
  try {
    const found = await infer(text, meaning);
    if (source.value !== text) { setStatus('文章が変更されました。もう一度選んでください。'); return; }
    analyzedText = text;
    ranges = found;
    render();
    setStatus(found.length ? `${found.length} 箇所が見つかりました。結果をクリックして調整できます。` : '該当箇所は見つかりませんでした。');
  } catch (error) { setStatus(error.message || '判定に失敗しました。'); }
  finally { run.disabled = false; }
});
document.querySelector('#sample').addEventListener('click', () => { source.value = sample; analyzedText = ''; ranges = []; render(); setStatus('例文を入れました。選びたい意味を指定してください。'); });
document.querySelectorAll('[data-query]').forEach(button => button.addEventListener('click', () => { query.value = button.dataset.query; query.focus(); }));
source.addEventListener('input', () => { analyzedText = ''; ranges = []; render(); setStatus('文章を変更しました。意味で選び直してください。'); });
query.addEventListener('keydown', event => { if (event.key === 'Enter') run.click(); });
copy.addEventListener('click', async () => {
  try { await navigator.clipboard.writeText(selected().map(range => analyzedText.slice(range.start, range.end)).join('\n')); setStatus('選択部分をコピーしました。'); }
  catch { setStatus('コピーできませんでした。ブラウザーの権限を確認してください。'); }
});
remove.addEventListener('click', () => {
  const keep = selected().sort((a,b) => b.start-a.start);
  let text = analyzedText;
  for (const range of keep) text = text.slice(0,range.start) + text.slice(range.end);
  source.value = text;
  analyzedText = '';
  ranges = [];
  render();
  setStatus('選択部分を削除しました。続ける場合は意味で選び直してください。');
});
clear.addEventListener('click', () => { ranges.forEach(range => { range.active = false; }); render(); setStatus('選択を解除しました。'); });
render();
