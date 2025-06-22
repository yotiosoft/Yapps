const input = document.getElementById('markdown-input');
const preview = document.getElementById('preview');

function updatePreview() {
    const markdownText = input.value;
    preview.innerHTML = marked.parse(markdownText);
}

function fitPreviewHeight() {
    preview.style.height = 'auto'; // 高さをリセット
    preview.style.height = input.scrollHeight + 'px'; // 入力エリアの高さに合わせる
}

input.addEventListener('input', updatePreview);
input.onresize = fitPreviewHeight;
updatePreview(); // 初期表示
