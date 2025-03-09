// DOM要素の取得
let imageInput = null;
let imageCanvas = null;
let rgbValue = null;
let colorPreview = null;
let hexValue = null;
let positionValue = null;

// 画像関連の変数
let image = null;
let ctx = null;

// ページ読み込み完了時の処理
$(document).ready(function() {
    // DOM要素の取得
    imageInput = document.getElementById('image-input');
    imageCanvas = document.getElementById('image-canvas');
    rgbValue = document.getElementById('rgb-value');
    colorPreview = document.getElementById('color-preview');
    hexValue = document.getElementById('hex-value');
    positionValue = document.getElementById('position-value');
    
    // キャンバスのコンテキスト取得
    ctx = imageCanvas.getContext('2d');
    
    // ファイル選択時のイベントリスナー
    imageInput.addEventListener('change', handleImageUpload);
    
    // キャンバスクリック時のイベントリスナー
    imageCanvas.addEventListener('click', handleCanvasClick);
});

/**
 * 画像アップロード処理
 */
function handleImageUpload(e) {
    const file = e.target.files[0];
    
    if (file && file.type.match('image.*')) {
        const reader = new FileReader();
        
        reader.onload = function(event) {
            // 画像オブジェクトの作成
            image = new Image();
            
            image.onload = function() {
                // キャンバスのサイズを画像に合わせる
                const maxWidth = 800;
                const maxHeight = 500;
                let width = image.width;
                let height = image.height;
                
                // 画像が大きすぎる場合はリサイズ
                if (width > maxWidth || height > maxHeight) {
                    const ratio = Math.min(maxWidth / width, maxHeight / height);
                    width *= ratio;
                    height *= ratio;
                }
                
                imageCanvas.width = width;
                imageCanvas.height = height;
                
                // 画像の描画
                ctx.drawImage(image, 0, 0, width, height);
                
                // 情報表示エリアをリセット
                resetInfoArea();
            };
            
            image.src = event.target.result;
        };
        
        reader.readAsDataURL(file);
    }
}

/**
 * キャンバスクリック時の処理
 */
function handleCanvasClick(e) {
    if (!image) return;
    
    // クリック位置の取得
    const rect = imageCanvas.getBoundingClientRect();
    const x = Math.floor(e.clientX - rect.left);
    const y = Math.floor(e.clientY - rect.top);
    
    // クリック位置のピクセルデータ取得
    const pixelData = ctx.getImageData(x, y, 1, 1).data;
    const r = pixelData[0];
    const g = pixelData[1];
    const b = pixelData[2];
    
    // RGB値の表示
    rgbValue.textContent = `R: ${r}, G: ${g}, B: ${b}`;
    
    // 色のプレビュー
    colorPreview.style.backgroundColor = `rgb(${r}, ${g}, ${b})`;
    
    // HEX値の表示
    const hexR = r.toString(16).padStart(2, '0');
    const hexG = g.toString(16).padStart(2, '0');
    const hexB = b.toString(16).padStart(2, '0');
    hexValue.textContent = `#${hexR}${hexG}${hexB}`;
    
    // 位置の表示
    positionValue.textContent = `X: ${x}, Y: ${y}`;
}

/**
 * 情報表示エリアのリセット
 */
function resetInfoArea() {
    rgbValue.textContent = 'クリックして値を取得';
    colorPreview.style.backgroundColor = 'transparent';
    hexValue.textContent = 'クリックして値を取得';
    positionValue.textContent = 'クリックして値を取得';
}
