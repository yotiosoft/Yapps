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

// /apps.json からアプリ情報を取得
function get_apps_json(id) {
    $.getJSON("apps.json", function(data) {
        /* テンプレート:
        <div class="box-wrap">
            <a href="./space-checker/">
                <div class="box">
                    <img src="/img/tools_icon/text/space-checker.svg" type=”image/svg+xml” width="128" height="128" alt="空白文字チェッカー">
                    <p class="tool-title">空白文字チェッカー</p>
                    <p class="summary">文章中の空白文字を検出します。</p>
                </div>
            </a>
        </div>
        */
       let apps_list = data.apps;
       console.log(apps_list.length);
        for (var i = 0; i < apps_list.length; i++) {
            var app = apps_list[i];
            var box_wrap = document.createElement("div");
            box_wrap.className = "box-wrap";
            var a = document.createElement("a");
            a.href = app.path;
            var box = document.createElement("div");
            box.className = "box";
            var img = document.createElement("img");
            img.src = app.image;
            img.width = 128;
            img.height = 128;
            img.alt = app.name;
            var p1 = document.createElement("p");
            p1.className = "tool-title";
            p1.textContent = app.name;
            var p2 = document.createElement("p");
            p2.className = "summary";
            p2.textContent = app.summary;

            box.appendChild(img);
            box.appendChild(p1);
            box.appendChild(p2);
            a.appendChild(box);
            box_wrap.appendChild(a);
            console.log(box_wrap);
            document.getElementById(id).appendChild(box_wrap);
        }
    }
    );
}
