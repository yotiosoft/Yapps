// 文字列置き換え機能のJavaScript（バニラJS版）

document.addEventListener('DOMContentLoaded', function() {
    // 入力フィールドの変更時に処理を実行
    const inputTextarea = document.getElementById('input-textarea');
    const searchText = document.getElementById('search-text');
    const replaceText = document.getElementById('replace-text');
    const highlightMode = document.getElementById('highlight-mode');
    
    if (inputTextarea) inputTextarea.addEventListener('input', processText);
    if (searchText) searchText.addEventListener('input', processText);
    if (replaceText) replaceText.addEventListener('input', processText);
    if (highlightMode) highlightMode.addEventListener('change', processText);
    
    // ページ読み込み時にヘッダーとフッターを読み込み（簡易版）
    loadHeaderFooter();
});

function processText() {
    const inputTextarea = document.getElementById('input-textarea');
    const searchTextInput = document.getElementById('search-text');
    const replaceTextInput = document.getElementById('replace-text');
    const highlightModeInput = document.getElementById('highlight-mode');
    const outputTextarea = document.getElementById('output-textarea');
    
    if (!inputTextarea || !searchTextInput || !replaceTextInput || !highlightModeInput || !outputTextarea) {
        return;
    }
    
    const inputText = inputTextarea.value;
    const searchStr = searchTextInput.value;
    const replaceStr = replaceTextInput.value;
    const isHighlightMode = highlightModeInput.checked;
    
    if (!inputText) {
        outputTextarea.value = '';
        return;
    }
    
    if (!searchStr) {
        outputTextarea.value = inputText;
        return;
    }
    
    let outputText;
    
    if (isHighlightMode) {
        // ハイライトモード：置き換え対象を【】で囲む
        const regex = new RegExp(escapeRegExp(searchStr), 'g');
        outputText = inputText.replace(regex, `【${searchStr}】`);
    } else {
        // 通常の置き換えモード
        const regex = new RegExp(escapeRegExp(searchStr), 'g');
        outputText = inputText.replace(regex, replaceStr);
    }
    
    outputTextarea.value = outputText;
}

// 正規表現の特殊文字をエスケープする関数
function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// クリップボードにコピーする関数
function OnCopyButtonClick() {
    const outputTextarea = document.getElementById('output-textarea');
    
    if (!outputTextarea || !outputTextarea.value) {
        alert('コピーするテキストがありません。');
        return;
    }
    
    const outputText = outputTextarea.value;
    
    // クリップボードにコピー
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(outputText).then(function() {
            // コピー成功時の処理
            const button = document.querySelector('#copy-button .middle-text');
            if (button) {
                const originalText = button.textContent;
                button.textContent = 'コピーしました！';
                
                setTimeout(function() {
                    button.textContent = originalText;
                }, 2000);
            }
        }).catch(function(err) {
            console.error('クリップボードへのコピーに失敗しました: ', err);
            fallbackCopy(outputTextarea);
        });
    } else {
        // フォールバック：古いブラウザ対応
        fallbackCopy(outputTextarea);
    }
}

function fallbackCopy(textarea) {
    try {
        textarea.select();
        textarea.setSelectionRange(0, 99999); // モバイル対応
        document.execCommand('copy');
        alert('テキストがクリップボードにコピーされました。');
    } catch (e) {
        alert('クリップボードへのコピーに失敗しました。手動でテキストをコピーしてください。');
    }
}

function loadHeaderFooter() {
    // ヘッダーとフッターの読み込み（簡易版）
    // 実際のプロジェクトではfetchを使用してHTMLを読み込む
    console.log('ヘッダーとフッターの読み込みをスキップしました');
}
