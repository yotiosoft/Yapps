let ctx_input;
let ctx_output;

// 検出された顔の情報を保持する配列
let detectedFaces = [];
// 手動で選択された領域を保持する配列
let manualSelections = [];
// ドラッグ選択用の変数
let isDrawing = false;
let startX, startY;
let currentRect = null;

// 入力画像の描画処理
function drawImage(image) {
    // 仮想キャンバスに画像を描画（画像サイズはそのまま）
    virtual_canvas = document.querySelector('#virtual-canvas');
    virtual_ctx = virtual_canvas.getContext('2d');
    // 一旦クリア
    virtual_ctx.clearRect(0, 0, virtual_canvas.width, virtual_canvas.height);
    // 画像を描画
    virtual_canvas.width = image.width;
    virtual_canvas.height = image.height;
    virtual_ctx.drawImage(image, 0, 0, image.width, image.height);

    /*--------------------------------------------------*/

    // 表示用キャンバスに画像を描画（画像サイズは縮小）
    canvas_input = document.querySelector('#img-input');
    scroller_inner = document.querySelector('#canvas-scroller-input-inner');

    // リサイズ処理（最大: x=1000, y=1000）
    ctx_input = canvas_input.getContext('2d');
    // 一旦クリア
    ctx_input.clearRect(0, 0, canvas_input.width, canvas_input.height);
    // 画像を描画
    img = image;
    let width = img.width, height = img.height;
    const max_width = 1000, max_height = 1000;

    if (width > max_width) {
        if (img.width > img.height) {
            height = max_width * img.height / img.width;
            width = max_width;
        } else {
            width = max_height * img.width / img.height;
            height = max_height;
        }
    }
    if (height > max_height) {
        if (img.width > img.height) {
            height = max_width * img.height / img.width;
            width = max_width;
        } else {
            width = max_height * img.width / img.height;
            height = max_height;
        }
    }

    canvas_input.width = width;
    canvas_input.height = height;
    canvas_input.style.width = width;
    canvas_input.style.height = height;
    ctx_input.canvas.width = width;
    ctx_input.canvas.height = height;
    ctx_input.drawImage(image, 0, 0, width, height);

    /*--------------------------------------------------*/

    // 出力用キャンバスをクリア
    canvas_output = document.querySelector('#img-output');
    ctx_output = canvas_output.getContext('2d');
    ctx_output.clearRect(0, 0, canvas_output.width, canvas_output.height);
}

// cvが読み込まれたときに実行
function onCvLoaded() {
    cv.onRuntimeInitialized = onCVReady();

    // 検出結果キャンバスにイベントリスナーを追加
    canvas_input = document.querySelector('#img-input');
    
    // クリックイベント（検出された顔の選択/非選択）
    canvas_input.addEventListener('click', function(e) {
        const rect = canvas_input.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // クリックされた位置に顔があるか確認
        for (let i = 0; i < detectedFaces.length; i++) {
            const face = detectedFaces[i];
            if (x >= face.x && x <= face.x + face.width &&
                y >= face.y && y <= face.y + face.height) {
                // 顔のモザイク適用/非適用を切り替え
                face.applyMosaic = !face.applyMosaic;
                // 顔検出結果を再描画
                redrawDetectionResults();
                // モザイク処理を再適用
                applyMosaicToImage();
                break;
            }
        }
    });
    
    // 手動選択用のイベントリスナー
    canvas_input.addEventListener('mousedown', function(e) {
        const rect = canvas_input.getBoundingClientRect();
        startX = e.clientX - rect.left;
        startY = e.clientY - rect.top;
        isDrawing = true;
    });
    
    canvas_input.addEventListener('mousemove', function(e) {
        if (!isDrawing) return;
        
        const rect = canvas_input.getBoundingClientRect();
        const currentX = e.clientX - rect.left;
        const currentY = e.clientY - rect.top;
        
        // 前回の選択範囲を消去
        redrawDetectionResults();
        
        // 新しい選択範囲を描画
        const ctx = canvas_input.getContext('2d');
        ctx.strokeStyle = 'blue';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.rect(startX, startY, currentX - startX, currentY - startY);
        ctx.stroke();
        
        // 現在の選択範囲を保存
        currentRect = {
            x: Math.min(startX, currentX),
            y: Math.min(startY, currentY),
            width: Math.abs(currentX - startX),
            height: Math.abs(currentY - startY)
        };
    });
    
    canvas_input.addEventListener('mouseup', function(e) {
        if (!isDrawing) return;
        isDrawing = false;
        
        if (currentRect && currentRect.width > 5 && currentRect.height > 5) {
            // 選択範囲が十分な大きさの場合、手動選択として追加
            manualSelections.push({
                x: currentRect.x,
                y: currentRect.y,
                width: currentRect.width,
                height: currentRect.height,
                applyMosaic: true
            });
            
            // 顔検出結果を再描画
            redrawDetectionResults();
            // モザイク処理を再適用
            applyMosaicToImage();
        }
        
        currentRect = null;
    });
}

// cvがInitializeされたときに実行
function onCVReady() {
    // 画像を元のサイズでダウンロード
    window.addEventListener('DOMContentLoaded', onUtilsLoaded);
}

// ダウンロードボタンが押されたときに実行
function OnDownloadButtonClicked() {
    let canvas = document.getElementById("virtual-canvas");

    let link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = "test.png";
    link.click();
}

function mosaic(img, x, y, w, h) {
    // 画像の切り抜き
    let roi = img.roi(new cv.Rect(x, y, w, h));

    // 画像の縮小
    let dst = new cv.Mat();
    let dsize = new cv.Size(5, 5);
    cv.resize(roi, dst, dsize, 0, 0, cv.INTER_AREA);

    // 画像の拡大
    let dst2 = new cv.Mat();
    let dsize2 = new cv.Size(w, h);
    cv.resize(dst, dst2, dsize2, 0, 0, cv.INTER_CUBIC);

    // 画像の貼り付け
    dst2.copyTo(img.roi(new cv.Rect(x, y, w, h)));

    // 画像の解放
    roi.delete();
    dst.delete();
    dst2.delete();
}

// utils.jsが読み込まれたときに実行
function onUtilsLoaded() {
    // ファイル入力
    let fileInput = document.getElementById('fileInput');

    // 学習済みデータの読み込みの準備
    // xmlファイルを読み込むので、utilsで読み込んでからcascadeを読み込む必要あり
    faceCascadeFile = './haarcascade_frontalface_default.xml';
    const utils = new Utils('error-message');
    utils.createFileFromUrl(faceCascadeFile, faceCascadeFile, () => {
        // ファイル準備完了時の動作
        fileInput.onchange = (e) => {
            // 選択されていない場合は何もしない
            if (e.target.files.length == 0) {
                return;
            }

            // 処理中の表示
            document.getElementById("processing").style.display = "block";

            // 矢印は隠す
            document.getElementById("arrow_down").style.display = "none";

            // ダウンロードボタンも隠す
            document.getElementById("download").style.display = "none";

            // 説明書きも隠す
            for (let element of document.getElementsByClassName("result_summary")) {
                element.style.display = "none";
            }

            // キャンバスを非表示
            document.getElementById("img-input").style.display = "none";
            document.getElementById("img-output").style.display = "none";

            // 画像読み込み準備
            const image = new Image();
            image.src = URL.createObjectURL(e.target.files[0]);

            image.onload = ()  => {
                // 画像をimg-inputキャンバスに読み込み
                drawImage(image);

                // キャンバスを再表示
                document.getElementById("img-input").style.display = "block";
                document.getElementById("img-output").style.display = "block";

                // ダウンロードボタンを表示
                document.getElementById("download").style.display = "inline";

                // 学習済みデータの読み込み
                let faceCascade = new cv.CascadeClassifier();
                faceCascade.load(faceCascadeFile);
                detect(faceCascade);
            }
        };
    });
}

// 顔検出結果を再描画する関数
function redrawDetectionResults() {
    // 元の画像を読み込み
    let cvImage_detect = cv.imread("img-input");
    
    // 検出した顔に枠を表示
    for (let i = 0; i < detectedFaces.length; i++) {
        const face = detectedFaces[i];
        let point1 = new cv.Point(face.x, face.y);
        let point2 = new cv.Point(face.x + face.width, face.y + face.height);
        
        // モザイク適用/非適用で色を変える
        let color = face.applyMosaic ? [255, 0, 0, 255] : [0, 255, 0, 255]; // 赤:適用、緑:非適用
        cv.rectangle(cvImage_detect, point1, point2, color, 2);
    }
    
    // 手動選択領域に青枠を表示
    for (let i = 0; i < manualSelections.length; i++) {
        const selection = manualSelections[i];
        let point1 = new cv.Point(selection.x, selection.y);
        let point2 = new cv.Point(selection.x + selection.width, selection.y + selection.height);
        cv.rectangle(cvImage_detect, point1, point2, [0, 0, 255, 255], 2); // 青色
    }
    
    cv.imshow("img-input", cvImage_detect);
    cvImage_detect.delete();
}

// モザイク処理を適用する関数
function applyMosaicToImage() {
    // 元の画像を読み込み
    let cvImage_result = cv.imread("img-input");
    let img_width = cvImage_result.cols;
    let img_height = cvImage_result.rows;
    
    // 検出した顔にモザイクをかける（フラグがtrueの場合のみ）
    for (let i = 0; i < detectedFaces.length; i++) {
        const face = detectedFaces[i];
        if (face.applyMosaic) {
            mosaic(cvImage_result, face.x, face.y, face.width, face.height);
        }
    }
    
    // 手動選択領域にモザイクをかける
    for (let i = 0; i < manualSelections.length; i++) {
        const selection = manualSelections[i];
        if (selection.applyMosaic) {
            mosaic(cvImage_result, selection.x, selection.y, selection.width, selection.height);
        }
    }
    
    // 結果をimg-outputキャンバスに表示
    cv.imshow("img-output", cvImage_result);
    
    // 仮想キャンバスにも適用（ダウンロード用; サイズは元画像と同じ）
    let virtualImage = cv.imread("virtual-canvas");
    virtual_canvas = document.querySelector('#virtual-canvas');
    
    // 検出した顔にモザイクをかける（フラグがtrueの場合のみ）
    for (let i = 0; i < detectedFaces.length; i++) {
        const face = detectedFaces[i];
        if (face.applyMosaic) {
            const scale = virtual_canvas.width / img_width;
            mosaic(virtualImage, 
                   face.x * scale, 
                   face.y * scale,
                   face.width * scale, 
                   face.height * scale);
        }
    }
    
    // 手動選択領域にモザイクをかける
    for (let i = 0; i < manualSelections.length; i++) {
        const selection = manualSelections[i];
        if (selection.applyMosaic) {
            const scale = virtual_canvas.width / img_width;
            mosaic(virtualImage, 
                   selection.x * scale, 
                   selection.y * scale,
                   selection.width * scale, 
                   selection.height * scale);
        }
    }
    
    cv.imshow("virtual-canvas", virtualImage);
    
    // メモリ解放
    cvImage_result.delete();
    virtualImage.delete();
}

function detect(faceCascade) {
    // 読み込み完了後：
    // img-inputキャンパスからopencvに読み込み
    let cvImage_result = cv.imread("img-input");
    let cvImage_detect = new cv.Mat();
    cvImage_result.copyTo(cvImage_detect);

    let img_width = cvImage_result.cols;
    let img_height = cvImage_result.rows;

    // グレースケール化
    let gray = new cv.Mat();
    cv.cvtColor(cvImage_result, gray, cv.COLOR_RGBA2GRAY, 0);
            
    // 顔検出
    let faces = new cv.RectVector();
    let msize = new cv.Size(0, 0);
    faceCascade.detectMultiScale(gray, faces, 1.1, 3, 0, msize, msize);

    // 検出した顔情報を配列に保存
    detectedFaces = [];
    manualSelections = [];
    for (let i = 0; i < faces.size(); ++i) {
        detectedFaces.push({
            x: faces.get(i).x,
            y: faces.get(i).y,
            width: faces.get(i).width,
            height: faces.get(i).height,
            applyMosaic: true // デフォルトでモザイク適用
        });
    }

    // 検出した顔に赤枠を表示
    redrawDetectionResults();

    // モザイク処理を適用
    applyMosaicToImage();

    // output用のキャンバスも同じサイズにする
    canvas_output = document.querySelector('#img-output');
    ctx_output = canvas_output.getContext('2d');
    canvas_output.width = img_width;
    canvas_output.height = img_height;
    canvas_output.style.width = img_width + "px";
    canvas_output.style.height = img_height + "px";

    // 処理中の表示を消す
    document.getElementById("processing").style.display = "none";

    // 矢印を表示
    document.getElementById("arrow_down").style.display = "block";

    // 説明書きを表示
    for (let element of document.getElementsByClassName("result_summary")) {
        element.style.display = "inline";
    }

    // メモリ解放
    cvImage_result.delete();
    cvImage_detect.delete();
    gray.delete();
    faces.delete();
    faceCascade.delete();
}
