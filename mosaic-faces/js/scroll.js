const W = 1024;
const H = 600;
let virtualW = W;
let virtualH = H;
let canvas;
let ctx_input;
let img;
let scroller_inner;

const clearCanvas = (ctx) => {
    ctx.clearRect(0, 0, virtualW, virtualH);
}

const updateMapPos = (ctx, pos) => {
    const { x, y } = pos;
    clearCanvas(ctx);
    ctx.save();
    ctx.translate(-x, -y);
    drawMap(img);
    ctx.restore();
}

window.addEventListener('DOMContentLoaded', function(){
    // 入力用
    canvas_input = document.querySelector('#img-input');
    ctx_input = canvas_input.getContext('2d');
    canvas_input.width = W;
    canvas_input.height = H;

    offscreenCanvas_input = document.createElement('canvas');
    offscreenCanvas_input.width = virtualW;
    offscreenCanvas_input.height = virtualH;
    offscreenCtx_input = offscreenCanvas_input.getContext('2d');

    scroller_input = document.querySelector('#canvas-scroller-input');
    scroller_input.addEventListener('scroll', (e) => {
        e.preventDefault()
        const target = e.target
        updateMapPos(ctx_input,{ x: target.scrollLeft, y: target.scrollTop})
    }, { passive: false})

    // 出力用
    /*
    canvas_output = document.querySelector('#img-output');
    ctx_output = canvas_output.getContext('2d');
    canvas_output.width = W;
    canvas_output.height = H;

    offscreenCanvas_output = document.createElement('canvas');
    offscreenCanvas_output.width = virtualW;
    offscreenCanvas_output.height = virtualH;
    offscreenCtx_output = offscreenCanvas_output.getContext('2d');

    scroller_output = document.querySelector('#canvas-scroller-output');
    scroller_output.addEventListener('scroll', (e) => {
        e.preventDefault()
        const target = e.target
        updateMapPos(ctx_output,{ x: target.scrollLeft, y: target.scrollTop})
    }, { passive: false})*/
});

function drawMap(image) {
    canvas_input = document.querySelector('#img-input');
    scroller_inner = document.querySelector('#canvas-scroller-input-inner');

    ctx_input = canvas_input.getContext('2d');
    clearCanvas(ctx_input);
    img = image;
    ctx_input.drawImage(image, 0, 0, image.width, image.height);
    virtualW = image.width;
    virtualH = image.height;
    const imageData = ctx_input.getImageData(0, 0, image.width, image.height);
    scroller_inner.style.width = virtualW;
    scroller_inner.style.height = virtualH;
}
