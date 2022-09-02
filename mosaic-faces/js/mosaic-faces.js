const W = 400
const H = 300
const virtualW = 10000
const virtualH = 10000
let canvas;
let ctx;
let img;

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
    const imageData = ctx.getImageData(0, 0, image.width, image.height);
}
