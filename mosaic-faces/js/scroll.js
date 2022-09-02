const W = 1024;
const H = 600;
let virtualW = W;
let virtualH = H;
let canvas;
let ctx;
let img;
let scroller_inner;

const clearCanvas = (ctx) => {
    ctx.clearRect(0, 0, virtualW, virtualH)
}

const updateMapPos = (ctx, pos) => {
    const { x, y } = pos
    clearCanvas(ctx)
    ctx.save()
    ctx.translate(-x, -y)
    drawMap(img)
    ctx.restore()
}

window.addEventListener('DOMContentLoaded', function(){
    canvases = [document.querySelector('#img-input'), document.querySelector('#img-output')];

    for (const canvas of canvases) {
        canvas.width = W
        canvas.height = H
        ctx = canvas.getContext('2d')

        const offscreenCanvas = document.createElement('canvas')
        offscreenCanvas.width = virtualW
        offscreenCanvas.height = virtualH
        const offscreenCtx = offscreenCanvas.getContext('2d')
    }

    scrollers = [document.querySelector('#canvas-scroller-input'), document.querySelector('#canvas-scroller-output')];

    for (const scroller of scrollers) {
        scroller.addEventListener('scroll', (e) => {
            e.preventDefault()
            const target = e.target
            updateMapPos(ctx,{ x: target.scrollLeft, y: target.scrollTop})
        }, { passive: false})
    }
});

function drawMap(image) {
    clearCanvas(ctx);
    img = image;
    ctx.drawImage(image, 0, 0, image.width, image.height);
    virtualW = image.width;
    virtualH = image.height;
    const imageData = ctx.getImageData(0, 0, image.width, image.height);
    scroller_inner.style.width = virtualW;
    scroller_inner.style.height = virtualH;
}
