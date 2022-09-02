const getInputImage = () => {
    const canvas = document.getElementById("img-input");
    const context = canvas.getContext("2d");
    const image = context.getImageData(0, 0, canvas.width, canvas.height);
    return image;
}

const detectFaces = () => {
    const image = cv.matFromImageData(getInputImage());
    const gray = new cv.Mat();
    const color = new cv.Mat();
    cv.cvtColor(image, gray, cv.COLOR_RGBA2GRAY, 0);
    cv.cvtColor(gray, color, cv.COLOR_GRAY2RGBA, 0);

    const classfier = new cv.CascadeClassifier();
    classfier.load('haarcascade_frontalface_default.xml');

    const faces = new cv.RectVector();
    const s1 = new cv.Size(0, 0);
    const s2 = new cv.Size(0, 0);
    classfier.detectMultiScale(gray, faces, 1.1, 3, 0, s1, s2);

    for (let i = 0; i < faces.size(); ++i) {
        const face = faces.get(i);
        const point1 = new cv.Point(face.x, face.y);
        const point2 = new cv.Point(face.x + face.width, face.y + face.height);
        cv.rectangle(color, point1, point2, [255, 0, 0, 255]);
    }

    cv.imshow('canvas-output', color);
    image.delete(); gray.delete(); color.delete();
    classfier.delete(); faces.delete();
}

const renderImage = (mat, id) => {
    const canvas = document.getElementById(id);
    const context = canvas.getContext("2d");
    const data = mat.data();
    const channels = mat.channels();

    context.clearRect(0, 0, canvas.width, canvas.height);
    canvas.width = mat.cols;
    canvas.height = mat.rows;

    const imageData = context.createImageData(mat.cols, mat.rows);
    for (let i = 0; i < data.length; i+=channels) {
        for (let j = 0; j < data.length; j+=4) {
            imageData.data[j] = data[i];
            imageData.data[j+1] = data[i+1 % channels];
            imageData.data[j+2] = data[i+2 % channels];
            imageData.data[j+3] = 255;
        }
    }
    context.putImageData(imageData, 0, 0);
}

const onImageSelect = (event) => {
    const canvas = document.getElementById("img-input");
    const context = canvas.getContext("2d");
    const image = new Image();
    image.onload = () => {
        const scale = Math.min(canvas.width / image.width, canvas.height / image.height);
        canvas.width = image.width * scale;
        canvas.height = image.height * scale;
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        detectFaces();
    }
    image.src = URL.createObjectURL(event.target.files[0]);
}

function init() {
    const input = document.querySelector('input');
    input.addEventListener('change', onImageSelect, false);
}
