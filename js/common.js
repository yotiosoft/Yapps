// gtag
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'G-43EGG0HL47');

//共通パー�?読み込み
$(function() {
    if (window.innerWidth <= 700 || navigator.userAgent.match(/iPhone|Android.+Mobile/)) {
        $("#header").load("/header_m.html");
    }
    else {
        $("#header").load("/header.html");
    }
    $("#footer").load("/footer.html");
    
    window.addEventListener('resize', function(){
        if (window.innerWidth <= 700 || navigator.userAgent.match(/iPhone|Android.+Mobile/)) {
            $("#header").load("/header_m.html");
        }
        else {
            $("#header").load("/header.html");
        }
    });
});

function information_show_if_needed(config_name, config_id) {
    var get_json = localStorage.getItem(config_name);

    var memo_config = {};
    if (get_json) {
        memo_config = JSON.parse(get_json);
    }

    if (!("information_button_flag" in memo_config)) {
        $('#' + config_id).show();
    }
}

function close_information_button(config_name, config_id) {
    var get_json = localStorage.getItem(config_name);

    var memo_config = {};
    if (get_json) {
        memo_config = JSON.parse(get_json);
    }

    memo_config["information_button_flag"] = false;

    // 保存
    localStorage.setItem(config_name, JSON.stringify(memo_config));

    $('#' + config_id).hide();
}
