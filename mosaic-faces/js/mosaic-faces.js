function onCvLoaded() {
    console.log('on OpenCV.js Loaded', cv);
    
    cv.onRuntimeInitialized = onReady();
}

function onReady() {
    console.log("onReady");
    const cv = Module;

    window.addEventListener('DOMContentLoaded', function(){
        let fileInput = document.getElementById('fileInput');

        // ここから顔検出
        //let gray = new cv.Mat();
        //cv.cvtColor(cvImage, gray, cv.COLOR_RGBA2GRAY, 0);
        //let faces = new cv.RectVector();
        
        let faceCascade = new cv.CascadeClassifier();

        // 学習済みデータの読み込み
        //let utils = new Utils('errorMessage'); //use utils class
        faceCascadeFile = './haarcascade_frontalface_default.xml';
        const utils = new Utils('error-message');  // Set Element ID
        utils.createFileFromUrl(faceCascadeFile, faceCascadeFile, () => {
            console.log('Face Cascade File Loaded');
            faceCascade.load(faceCascadeFile);
        });

        // use createFileFromUrl to "pre-build" the xml
        //utils.createFileFromUrl(faceCascadeFile, faceCascadeFile, () => {
        //    faceCascade.load(faceCascadeFile); // in the callback, load the cascade from file 
        //});
        
        // ファイル読み込み時の動作
        fileInput.onchange = (e) => {
        const image = new Image();

        image.src = URL.createObjectURL(e.target.files[0]);

        image.onload = ()  => {
            const canvas = document.getElementById('img-input');
            const context = canvas.getContext('2d');

            //context.drawImage(image, 0, 0, image.width, image.height);
            //const imageData = context.getImageData(0, 0, image.width, image.height);
            
            // 画像読み込み
            drawMap(image)
            
            // opencvに読み込み
            const cvImage = cv.imread("img-input");
            const mean = cv.mean(cvImage)
            console.log(`Mean: ${mean[0]}, ${mean[1]}, ${mean[2]}`)

            // 顔検出
            /*let msize = new cv.Size(0, 0);
            faceCascade.detectMultiScale(cvImage, faces, 1.1, 3, 0, msize, msize);

            // 検出した顔にモザイクをかける
            for (let i = 0; i < faces.size(); ++i) {
                //let face = faces.get(i);
                //mosaic(cvImage, face);
                let roiGray = gray.roi(faces.get(i));
                let roiSec = cvImage.roi(faces.get(i));
                let point1 = new cv.Point(faces.get(i).x, faces.get(i).y);
                let point2 = new cv.Point(faces.get(i).x + faces.get(i).width, faces.get(i).y + faces.get(i).height);
                cv.rectangle(cvImage, point1, point2, [255, 0, 0, 255]);
            }

            // 顔検出結果を表示
            cv.imshow("canvas", cvImage);
            cvImage.delete();
            gray.delete();
            faces.delete();
            faceCascade.delete();*/
        }
        };
    });
}
