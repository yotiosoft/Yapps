const W = 1000;
const H = 500;

const getInputImage = () => {
    const canvas = document.getElementById("img-input");
    const context = canvas.getContext("2d");
    const image = context.getImageData(0, 0, canvas.width, canvas.height);
    return image;
}

const detectFaces = () => {
    const image = cv.matFromArray(getInputImage(), 24);
    const gray = new cv.Mat();
    const color = new cv.Mat();
    cv.cvtColor(image, gray, cv.ColorConversionCodes.COLOR_RGBA2GRAY.value, 0);
    cv.cvtColor(image, color, cv.ColorConversionCodes.COLOR_RGBA2RGB.value, 0);

    const classfier = new cv.CascadeClassifier();
    classfier.load('../../test/data/haarcascade_frontalface_default.xml');

    const faces = new cv.RectVector();
    const s1 = [0, 0];
    const s2 = [0, 0];
    classfier.detectMultiScale(gray, faces, 1.1, 3, 0, s1, s2);

    for (let i = 0; i < faces.size(); ++i) {
        const face = faces.get(i);
        const x = face.x;
        const y = face.y;
        const w = face.width;
        const h = face.height;
        const point1 = [x, y];
        const point2 = [x + w, y + h];
        const rectangle_color = new cv.Scalar(255, 0, 0, 255);
        cv.rectangle(color, point1, point2, rectangle_color, 2, 8, 0);
        face.delete();
        rectangle_color.delete();
    }

    renderImage(color, 'img-output');
    image.delete();
    color.delete();
    faces.delete();
    gray.delete();
}

const renderImage = (mat, id) => {
    const canvas = document.getElementById(id);
    const context = canvas.getContext("2d");
    const data = mat.data();
    const channels = mat.channels();

    context.clearRect(0, 0, canvas.width, canvas.height);
    canvas.width = mat.cols;
    canvas.height = mat.rows;

    let imageData = context.createImageData(mat.cols, mat.rows);
    for (let i = 0, j = 0; i < data.length; i += channels, j += 4) {
        imageData.data[j] = data[i];
        imageData.data[j + 1] = data[i + 1 % channels];
        imageData.data[j + 2] = data[i + 2 % channels];
        imageData.data[j + 3] = 255;
    }
    context.putImageData(imageData, 0, 0);
}

const onImageSelect = (event) => {
    const canvas = document.getElementById("img-input");
    const context = canvas.getContext("2d");
    const image = new Image();
    image.onload = () => {
        const scale = Math.min(W / image.width, H / image.height);
        canvas.width = image.width * scale;
        canvas.height = image.height * scale;
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        detectFaces();
    }
    image.src = URL.createObjectURL(event.target.files[0]);
}

const input = document.querySelector('input');
input.addEventListener('change', onImageSelect, false);
