let ctx_input;
let ctx_output;

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

    console.log("after width:" + width + ", height:" + height);
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
    console.log('on OpenCV.js Loaded', cv);
    
    cv.onRuntimeInitialized = onCVReady();

    // detectキャンバスにクリックイベントを追加
    canvas_input = document.querySelector('#img-input');
    canvas_input.addEventListener('mousedown', function(e) {
        console.log("mousedown at " + e.offsetX + ", " + e.offsetY);
    });
    canvas_input.addEventListener('mouseup', function(e) {
        console.log("mouseup at " + e.offsetX + ", " + e.offsetY);
    });
}

// cvがInitializeされたときに実行
function onCVReady() {
    console.log("onCVReady");

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

    console.log("faces.size() = " + faces.size());

    // 検出した領域に赤枠を表示
    for (let i = 0; i < faces.size(); ++i) {
        let point1 = new cv.Point(faces.get(i).x, faces.get(i).y);
        let point2 = new cv.Point(faces.get(i).x + faces.get(i).width, faces.get(i).y + faces.get(i).height);
        cv.rectangle(cvImage_detect, point1, point2, [255, 0, 0, 255], 2);
    }
    cv.imshow("img-input", cvImage_detect);

    // 検出した領域にモザイクをかける
    for (let i = 0; i < faces.size(); ++i) {
        mosaic(cvImage_result, faces.get(i).x, faces.get(i).y, faces.get(i).width, faces.get(i).height);
    }

    // 顔検出結果をimg-outputキャンバスに表示
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

    cv.imshow("img-output", cvImage_result);

    // 仮想キャンバスにも適用（ダウンロード用; サイズは元画像と同じ）
    let virtualImage = cv.imread("virtual-canvas");
    virtual_canvas = document.querySelector('#virtual-canvas');
    for (let i = 0; i < faces.size(); ++i) {
        mosaic(virtualImage, faces.get(i).x * (virtual_canvas.width / img_width), faces.get(i).y * (virtual_canvas.width / img_width),
                    faces.get(i).width * (virtual_canvas.width / img_width), faces.get(i).height * (virtual_canvas.width / img_width));
    }
    cv.imshow("virtual-canvas", virtualImage);

    // メモリ解放
    cvImage_result.delete();
    cvImage_detect.delete();
    virtualImage.delete();
    gray.delete();
    faces.delete();
    faceCascade.delete();
}
