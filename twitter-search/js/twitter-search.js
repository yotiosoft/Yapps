// オプション保持用辞書
var options = {};

// 言語コードの読み込み
$(window).on('load', function() {
    var select_language = document.getElementById("id_select_language");
    $.getJSON("./language.json", (data) => {
        for (var i = 0; i < data['langs'].length; i++) {
            var option = document.createElement("option");
            option.value = Object.keys(data['langs'][i])[0];
            option.text = Object.values(data['langs'][i])[0];
            select_language.appendChild(option);
        }
    });
});

// 入力文字列の追加
function common_add_inputted_str(filter_name, inputted_str) {
    var splitted_str = inputted_str.value.split(`, `);
    var ret = "";

    for (var i = 0; i < splitted_str.length; i++) {
        ret += filter_name + splitted_str[i];
        if (i != splitted_str.length - 1) {
            ret += " ";
        }
    }

    return ret;
}

// 現在の日付の文字列を取得
function common_get_today() {
    var today = new Date();
    today.setDate(today.getDate());
    var year = String(today.getFullYear());
    var month = ("0"+(today.getMonth()+1)).slice(-2);
    var date = ("0"+today.getDate()).slice(-2);

    return [year, month, date];
}

// プルダウンメニューの選択肢よりオプションを取得
function common_get_selected_option(select, option_name) {
    var ret;

    if (select.value == "include") {
        ret = "";
    }
    else if (select.value == "exclude") {
        ret = "-filter:" + option_name;
    }
    else if (select.value == "only") {
        ret = "filter:" + option_name;
    }

    return ret;
}

// 検索キーワード
var check_search_keyword = document.getElementById("id_check_search-keyword");
check_search_keyword.addEventListener('input', update_search_keyword);
var input_search_keyword = document.getElementById("id_input_search-keyword");
input_search_keyword.addEventListener('input', update_search_keyword);

options['search_keyword'] = "";

function update_search_keyword() {
    if (check_search_keyword.checked) {
        options['search_keyword'] = common_add_inputted_str("", input_search_keyword);
    }
    else {
        options['search_keyword'] = "";
    }

    update();
}

// 除外キーワード
var check_exclude_keyword = document.getElementById("id_check_exclude-keyword");
check_exclude_keyword.addEventListener('input', update_exclude_keyword);
var input_exclude_keyword = document.getElementById("id_input_exclude-keyword");
input_exclude_keyword.addEventListener('input', update_exclude_keyword);

options['exclude_keyword'] = "";

function update_exclude_keyword() {
    if (check_exclude_keyword.checked && input_exclude_keyword.value != "") {
        options['exclude_keyword'] = common_add_inputted_str("-", input_exclude_keyword);
    }
    else {
        options['exclude_keyword'] = "";
    }

    update();
}

// 投稿者ID
var check_autdor_id = document.getElementById("id_check_autdor-id");
check_autdor_id.addEventListener('input', update_autdor_id);
var input_autdor_id = document.getElementById("id_input_autdor-id");
input_autdor_id.addEventListener('input', update_autdor_id);

options['autdor_id'] = "";

function update_autdor_id() {
    if (check_autdor_id.checked && input_autdor_id.value != "") {
        options['autdor_id'] = common_add_inputted_str("from:", input_autdor_id);
    }
    else {
        options['autdor_id'] = "";
    }

    update();
}

// 除外ID
var check_exclude_autdor_id = document.getElementById("id_check_exclude-autdor-id");
check_exclude_autdor_id.addEventListener('input', update_exclude_autdor_id);
var input_exclude_autdor_id = document.getElementById("id_input_exclude-autdor-id");
input_exclude_autdor_id.addEventListener('input', update_exclude_autdor_id);

options['exclude_autdor_id'] = "";

function update_exclude_autdor_id() {
    if (check_exclude_autdor_id.checked && input_exclude_autdor_id.value != "") {
        options['exclude_autdor_id'] = common_add_inputted_str("-from:", input_exclude_autdor_id);
    }
    else {
        options['exclude_autdor_id'] = "";
    }

    update();
}

// 返信先
var check_replies = document.getElementById("id_check_reply-id");
check_replies.addEventListener('input', update_reply_id);
var input_replies = document.getElementById("id_input_reply-id");
input_replies.addEventListener('input', update_reply_id);

options['reply_id'] = "";

function update_reply_id() {
    if (check_replies.checked && input_replies.value != "") {
        options['reply_id'] = common_add_inputted_str("to:", input_replies);
    }
    else {
        options['reply_id'] = "";
    }

    update();
}

// 次のURLを含む
var check_included_url = document.getElementById("id_check_included-url");
check_included_url.addEventListener('input', update_included_url);
var input_included_url = document.getElementById("id_input_included-url");
input_included_url.addEventListener('input', update_included_url);

options['included_url'] = "";

function update_included_url() {
    if (check_included_url.checked && input_included_url.value != "") {
        options['included_url'] = common_add_inputted_str("url:", input_included_url);
    }
    else {
        options['included_url'] = "";
    }

    update();
}

// 開始日時
var check_since_date = document.getElementById("id_check_since-date");
check_since_date.addEventListener('input', update_since_date);
var input_since_date = document.getElementById("id_input_since-date");
input_since_date.addEventListener('input', update_since_date);
var input_since_date_time = document.getElementById("id_input_since-date_time");
input_since_date_time.addEventListener('input', update_since_date);

options['since_date'] = "";

function update_since_date() {
    if (!check_since_date.checked) {
        options['since_date'] = "";
        update();
        return;
    }

    since_date = "";
    if (input_since_date.value) {
        options['since_date'] = "since:" + input_since_date.value;
    }
    if (input_since_date_time.value) {
        if (!input_since_date.value) {
            var today = common_get_today();
            
            input_since_date.value = today[0] +'-'+ today[1] +'-'+ today[2];
            options['since_date'] = "since:" + input_since_date.value;
        }

        options['since_date'] += "_" + input_since_date_time.value + ":00_JST";
    }

    update();
}

// 終了日時
var check_until_date = document.getElementById("id_check_until-date");
check_until_date.addEventListener('input', update_until_date);
var input_until_date = document.getElementById("id_input_until-date");
input_until_date.addEventListener('input', update_until_date);
var input_until_date_time = document.getElementById("id_input_until-date_time");
input_until_date_time.addEventListener('input', update_until_date);

options['until_date'] = "";

function update_until_date() {
    if (!check_until_date.checked) {
        options['until_date'] = "";
        update();
        return;
    }

    until_date = "";
    if (input_until_date.value) {
        options['until_date'] = "until:" + input_until_date.value;
    }
    if (input_until_date_time.value) {
        if (!input_until_date.value) {
            var today = common_get_today();
            
            input_until_date.value = today[0] +'-'+ today[1] +'-'+ today[2];
            options['until_date'] = "until:" + input_until_date.value;
        }

        options['until_date'] += "_" + input_until_date_time.value + ":00_JST";
    }

    update();
}

// 言語指定
var check_lang = document.getElementById("id_check_language");
check_lang.addEventListener('input', update_lang);
var input_lang = document.getElementById("id_select_language");
input_lang.addEventListener('input', update_lang);

options['lang'] = "";

function update_lang() {
    if (check_lang.checked) {
        options['lang'] = "lang:" + input_lang.value;
    }
    else {
        options['lang'] = "";
    }

    update();
}

// キーワードのみ検索
var check_only_keywords = document.getElementById("id_check_only-keywords");
check_only_keywords.addEventListener('input', update_only_keywords);

options['only_keywords'] = "";

function update_only_keywords() {
    if (check_only_keywords.checked) {
        options['only_keywords'] = "OR @i -@i";
    }
    else {
        options['only_keywords'] = "";
    }

    update();
}

// リプライ
var select_replies = document.getElementById("id_select_replies");
select_replies.addEventListener('input', update_replies);
options['replies'] = "";

function update_replies() {
    options['replies'] = common_get_selected_option(select_replies, "replies");
    update();
}

// リンク付きツイート
var select_links = document.getElementById("id_select_links");
select_links.addEventListener('input', update_links);
options['links'] = "";

function update_links() {
    options['links'] = common_get_selected_option(select_links, "links");
    update();
}

// 画像付きツイート
var select_images = document.getElementById("id_select_images");
select_images.addEventListener('input', update_images);
options['images'] = "";

function update_images() {
    options['images'] = common_get_selected_option(select_images, "images");
    update();
}

// 動画付きツイート
var select_videos = document.getElementById("id_select_videos");
select_videos.addEventListener('input', update_videos);
options['videos'] = "";

function update_videos() {
    options['videos'] = common_get_selected_option(select_videos, "videos");
    update();
}

// 出力の更新
var output = document.getElementById("id_output");
options['output_cmd'] = "";
function update() {
    options['output_cmd'] = "";
    if (options['search_keyword'] != "") {
        options['output_cmd'] += options['search_keyword'];
    }
    if (options['only_keywords'] != "") {
        options['output_cmd'] += " " + options['only_keywords'];
    }
    if (options['autdor_id'] != "") {
        options['output_cmd'] += " " + options['autdor_id'];
    }
    if (options['exclude_keyword'] != "") {
        options['output_cmd'] += " " + options['exclude_keyword'];
    }
    if (options['exclude_autdor_id'] != "") {
        options['output_cmd'] += " " + options['exclude_autdor_id'];
    }
    if (options['included_url'] != "") {
        options['output_cmd'] += " " + options['included_url'];
    }
    if (options['replies'] != "") {
        options['output_cmd'] += " " + options['replies'];
    }
    if (options['reply_id'] != "") {
        options['output_cmd'] += " " + options['reply_id'];
    }
    if (options['links'] != "") {
        options['output_cmd'] += " " + options['links'];
    }
    if (options['since_date'] != "") {
        options['output_cmd'] += " " + options['since_date'];
    }
    if (options['until_date'] != "") {
        options['output_cmd'] += " " + options['until_date'];
    }
    if (options['lang'] != "") {
        options['output_cmd'] += " " + options['lang'];
    }
    if (options['images'] != "") {
        options['output_cmd'] += " " + options['images'];
    }
    if (options['videos'] != "") {
        options['output_cmd'] += " " + options['videos'];
    }

    output.value = options['output_cmd'];
}

// 検索
function search() {
    var search_cmd = output.value;
    window.open(`https://twitter.com/search?q=${search_cmd}`);
}
