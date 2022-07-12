// gtag
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'G-43EGG0HL47');

//共通パーツ読み込み
$(function() {
    if (window.innerWidth <= 700 || navigator.userAgent.match(/iPhone|Android.+Mobile/)) {
        $("#header").load("/header_m.html");
    }
    else {
        $("#header").load("/header.html");
    }
    $("#footer").load("/footer_m.html");
    
    window.addEventListener('resize', function(){
        if (window.innerWidth <= 700 || navigator.userAgent.match(/iPhone|Android.+Mobile/)) {
            $("#header").load("/header_m.html");
        }
        else {
            $("#header").load("/header.html");
        }
    });
});