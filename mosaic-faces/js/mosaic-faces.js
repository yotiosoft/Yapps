const W = 1024;
const H = 600;
let virtualW = W;
let virtualH = H;
let canvas;
let ctx;
let img;
let scroller_inner;

window.addEventListener('DOMContentLoaded', function(){
    canvas = document.querySelector('#canvas')
    canvas.width = W
    canvas.height = H
    ctx = canvas.getContext('2d')

    const scroller = document.querySelector('#canvas-scroller')

    const offscreenCanvas = document.createElement('canvas')
    offscreenCanvas.width = virtualW
    offscreenCanvas.height = virtualH
    const offscreenCtx = offscreenCanvas.getContext('2d')

    scroller_inner = document.querySelector('#canvas-scroller-inner')
   
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

   scroller.addEventListener('scroll', (e) => {
        e.preventDefault()
        const target = e.target
        updateMapPos(ctx,{ x: target.scrollLeft, y: target.scrollTop})
    }, { passive: false})
});

function drawMap(image) {
    img = image;
    ctx.drawImage(image, 0, 0, image.width, image.height);
    virtualW = image.width;
    virtualH = image.height;
    const imageData = ctx.getImageData(0, 0, image.width, image.height);
    scroller_inner.style.width = virtualW;
    scroller_inner.style.height = virtualH;
}
