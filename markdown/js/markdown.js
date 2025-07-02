const input = document.getElementById('markdown-input');
const preview = document.getElementById('preview');

// スクロール同期のフラグ（無限ループ防止）
let isScrollingSyncing = false;

function updatePreview() {
    const markdownText = input.value;
    preview.innerHTML = marked.parse(markdownText);
}

function fitPreviewHeight() {
    console.log('fitPreviewHeight called');
    preview.style.height = 'auto'; // 高さをリセット
    preview.style.height = input.style.height; // 入力エリアの高さに合わせる
}

// スクロール同期関数（エディタ → プレビュー）
function syncScrollToPreview() {
    if (isScrollingSyncing) return;
    
    isScrollingSyncing = true;
    
    // エディタのスクロール位置の比率を計算
    const scrollTop = input.scrollTop;
    const scrollHeight = input.scrollHeight - input.clientHeight;
    const scrollRatio = scrollHeight > 0 ? scrollTop / scrollHeight : 0;
    
    // プレビューの対応する位置を計算
    const previewScrollHeight = preview.scrollHeight - preview.clientHeight;
    const previewScrollTop = previewScrollHeight * scrollRatio;
    
    // プレビューをスクロール
    preview.scrollTop = previewScrollTop;
    
    // 少し遅延してフラグをリセット
    setTimeout(() => {
        isScrollingSyncing = false;
    }, 10);
}

// スクロール同期関数（プレビュー → エディタ）
function syncScrollToEditor() {
    if (isScrollingSyncing) return;
    
    isScrollingSyncing = true;
    
    // プレビューのスクロール位置の比率を計算
    const scrollTop = preview.scrollTop;
    const scrollHeight = preview.scrollHeight - preview.clientHeight;
    const scrollRatio = scrollHeight > 0 ? scrollTop / scrollHeight : 0;
    
    // エディタの対応する位置を計算
    const editorScrollHeight = input.scrollHeight - input.clientHeight;
    const editorScrollTop = editorScrollHeight * scrollRatio;
    
    // エディタをスクロール
    input.scrollTop = editorScrollTop;
    
    // 少し遅延してフラグをリセット
    setTimeout(() => {
        isScrollingSyncing = false;
    }, 10);
}

// デバウンス関数（パフォーマンス最適化）
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// イベントリスナーの設定
input.addEventListener('input', updatePreview);
input.addEventListener('scroll', debounce(syncScrollToPreview, 10));
preview.addEventListener('scroll', debounce(syncScrollToEditor, 10));

new ResizeObserver(fitPreviewHeight).observe(input);
updatePreview(); // 初期表示
