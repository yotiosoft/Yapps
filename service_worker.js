// Cache name
const CACHE_NAME = 'pwa-sample-caches-v1';
// Cache targets
const urlsToCache = [
    './index.html',
    './about/index.html',
    './add-spaces/js/add-spaces.js',
    './add-spaces/index.html',
    './add-spaces/add-spaces.css',
    './app-page.css',
    './apps.json',
    './badges.css',
    './box.css',
    './button.css',
    './cardinal/js/cardinal.js',
    './cardinal/index.html',
    './cardinal/cardinal.css',
    './char-checker/js/char-checker.js',
    './char-checker/char-checker.css',
    './char-checker/index.html',
    './char-counter/js/char-counter.js',
    './char-counter/char-counter.css',
    './char-counter/index.html',
    './checkbox.css',
    './del-line-breaks/js/del-line-breaks.js',
    './del-line-breaks/del-line-breaks.css',
    './del-line-breaks/index.html',
    './footer.css',
    './footer.html',
    './header.html',
    './header_m.html',
    './img/logo.svg',
    './img/text.svg',
    './img/yotiosoft.svg',
    './img/document.svg',
    './img/image.svg',
    './img/image.png',
    './img/logo_untransparent.svg',
    './img/text.png',
    './img/logo.png',
    './img/update/update.svg',
    './img/about/pc.svg',
    './img/about/badge.svg',
    './img/about/what.svg',
    './img/yapps-mini.png',
    './img/logo-yapps.svg',
    './img/yslab.png',
    './img/common/arrow_right.svg',
    './img/common/delete.svg',
    './img/common/download.svg',
    './img/common/arrow_right2.svg',
    './img/common/edit.svg',
    './img/common/arrow_down.svg',
    './img/math.svg',
    './img/tools_icon/document/read-speaker.svg',
    './img/tools_icon/document/memo.svg',
    './img/tools_icon/text/char-checker.svg',
    './img/tools_icon/text/del-line-breaks.svg',
    './img/tools_icon/text/rotate.svg',
    './img/tools_icon/text/char-counter.svg',
    './img/tools_icon/text/rotate.png',
    './img/tools_icon/text/space-checker.svg',
    './img/tools_icon/text/width-converter.svg',
    './img/tools_icon/text/add-spaces.svg',
    './img/tools_icon/math/random.svg',
    './img/tools_icon/math/cardinal.svg',
    './img/tools_icon/img/face_detect.svg',
    './information.css',
    './js/common.js',
    './js/opencv.js',
    './js/opencv4.6.0.js',
    './js/jquery-3.5.1.min.js',
    './js/yapps-lib.js',
    './js/utils.js',
    './manifest.json',
    './memo/js/memo.js',
    './memo/js/load_memo.js',
    './memo/memo.css',
    './memo/index.html',
    './mosaic-faces/js/mosaic-faces.js',
    './mosaic-faces/cv.data',
    './mosaic-faces/mosaic-faces.css',
    './mosaic-faces/haarcascade_frontalface_default.xml',
    './mosaic-faces/cv-wasm.data',
    './mosaic-faces/index.html',
    './opencv/haarcascades/haarcascade_frontalface_default.xml',
    './package-lock.json',
    './package.json',
    './random/js/random.js',
    './random/random.css',
    './random/index.html',
    './read-speaker/js/read-speaker.js',
    './read-speaker/index.html',
    './rotate/js/rotate.js',
    './rotate/picker.css',
    './rotate/codes.json',
    './rotate/index.html',
    './service_worker.js',
    './simple-select.css',
    './simple-textarea.css',
    './sitemap.xml',
    './space-checker/js/space-checker.js',
    './space-checker/space-checker.css',
    './space-checker/index.html',
    './style.css',
    './test.html',
    './update/index.html',
    './width-converter/js/width-converter.js',
    './width-converter/others-codes.json',
    './width-converter/kana-codes.json',
    './width-converter/index.html'
  ];
  

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches
      .match(event.request)
      .then((response) => {
        return response ? response : fetch(event.request);
      })
  );
});
