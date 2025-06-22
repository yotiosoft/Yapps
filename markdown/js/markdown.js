const input = document.getElementById('markdown-input');
const preview = document.getElementById('preview');

function updatePreview() {
    const markdownText = input.value;
    preview.innerHTML = marked.parse(markdownText);
}

function fitPreviewHeight() {
    console.log('fitPreviewHeight called');
    preview.style.height = 'auto'; // 高さをリセット
    preview.style.height = input.style.height; // 入力エリアの高さに合わせる
}

input.addEventListener('input', updatePreview);
new ResizeObserver(fitPreviewHeight).observe(input);
updatePreview(); // 初期表示
