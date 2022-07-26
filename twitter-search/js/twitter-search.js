// オプション保持用辞書
var option_str = {};
var option_values = {};

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

option_str['search_keyword'] = "";

function update_search_keyword() {
    if (check_search_keyword.checked) {
        option_str['search_keyword'] = common_add_inputted_str("", input_search_keyword);
    }
    else {
        option_str['search_keyword'] = "";
    }

    update();
}

// 除外キーワード
var check_exclude_keyword = document.getElementById("id_check_exclude-keyword");
check_exclude_keyword.addEventListener('input', update_exclude_keyword);
var input_exclude_keyword = document.getElementById("id_input_exclude-keyword");
input_exclude_keyword.addEventListener('input', update_exclude_keyword);

option_str['exclude_keyword'] = "";

function update_exclude_keyword() {
    if (check_exclude_keyword.checked && input_exclude_keyword.value != "") {
        option_str['exclude_keyword'] = common_add_inputted_str("-", input_exclude_keyword);
    }
    else {
        option_str['exclude_keyword'] = "";
    }

    update();
}

// 投稿者ID
var check_autdor_id = document.getElementById("id_check_autdor-id");
check_autdor_id.addEventListener('input', update_autdor_id);
var input_autdor_id = document.getElementById("id_input_autdor-id");
input_autdor_id.addEventListener('input', update_autdor_id);

option_str['autdor_id'] = "";

function update_autdor_id() {
    if (check_autdor_id.checked && input_autdor_id.value != "") {
        option_str['autdor_id'] = common_add_inputted_str("from:", input_autdor_id);
    }
    else {
        option_str['autdor_id'] = "";
    }

    update();
}

// 除外ID
var check_exclude_autdor_id = document.getElementById("id_check_exclude-autdor-id");
check_exclude_autdor_id.addEventListener('input', update_exclude_autdor_id);
var input_exclude_autdor_id = document.getElementById("id_input_exclude-autdor-id");
input_exclude_autdor_id.addEventListener('input', update_exclude_autdor_id);

option_str['exclude_autdor_id'] = "";

function update_exclude_autdor_id() {
    if (check_exclude_autdor_id.checked && input_exclude_autdor_id.value != "") {
        option_str['exclude_autdor_id'] = common_add_inputted_str("-from:", input_exclude_autdor_id);
    }
    else {
        option_str['exclude_autdor_id'] = "";
    }

    update();
}

// 返信先
var check_replies = document.getElementById("id_check_reply-id");
check_replies.addEventListener('input', update_reply_id);
var input_replies = document.getElementById("id_input_reply-id");
input_replies.addEventListener('input', update_reply_id);

option_str['reply_id'] = "";

function update_reply_id() {
    if (check_replies.checked && input_replies.value != "") {
        option_str['reply_id'] = common_add_inputted_str("to:", input_replies);
    }
    else {
        option_str['reply_id'] = "";
    }

    update();
}

// 次のURLを含む
var check_included_url = document.getElementById("id_check_included-url");
check_included_url.addEventListener('input', update_included_url);
var input_included_url = document.getElementById("id_input_included-url");
input_included_url.addEventListener('input', update_included_url);

option_str['included_url'] = "";

function update_included_url() {
    if (check_included_url.checked && input_included_url.value != "") {
        option_str['included_url'] = common_add_inputted_str("url:", input_included_url);
    }
    else {
        option_str['included_url'] = "";
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

option_str['since_date'] = "";

function update_since_date() {
    if (!check_since_date.checked) {
        option_str['since_date'] = "";
        update();
        return;
    }

    since_date = "";
    if (input_since_date.value) {
        option_str['since_date'] = "since:" + input_since_date.value;
    }
    if (input_since_date_time.value) {
        if (!input_since_date.value) {
            var today = common_get_today();
            
            input_since_date.value = today[0] +'-'+ today[1] +'-'+ today[2];
            option_str['since_date'] = "since:" + input_since_date.value;
        }

        option_str['since_date'] += "_" + input_since_date_time.value + ":00_JST";
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

option_str['until_date'] = "";

function update_until_date() {
    if (!check_until_date.checked) {
        option_str['until_date'] = "";
        update();
        return;
    }

    until_date = "";
    if (input_until_date.value) {
        option_str['until_date'] = "until:" + input_until_date.value;
    }
    if (input_until_date_time.value) {
        if (!input_until_date.value) {
            var today = common_get_today();
            
            input_until_date.value = today[0] +'-'+ today[1] +'-'+ today[2];
            option_str['until_date'] = "until:" + input_until_date.value;
        }

        option_str['until_date'] += "_" + input_until_date_time.value + ":00_JST";
    }

    update();
}

// 言語指定
var check_lang = document.getElementById("id_check_language");
check_lang.addEventListener('input', update_lang);
var select_lang = document.getElementById("id_select_language");
select_lang.addEventListener('input', update_lang);

option_str['lang'] = "";

function update_lang() {
    if (check_lang.checked) {
        option_str['lang'] = "lang:" + select_lang.value;
    }
    else {
        option_str['lang'] = "";
    }

    update();
}

// キーワードのみ検索
var check_only_keywords = document.getElementById("id_check_only-keywords");
check_only_keywords.addEventListener('input', update_only_keywords);

option_str['only_keywords'] = "";

function update_only_keywords() {
    if (check_only_keywords.checked) {
        option_str['only_keywords'] = "OR @i -@i";
    }
    else {
        option_str['only_keywords'] = "";
    }

    update();
}

// Twitter公式アプリからの書き込みのみ検索
var check_only_twitter_app = document.getElementById("id_check_only-twitter-app");
check_only_twitter_app.addEventListener('input', update_only_twitter_app);

option_str['only_twitter_app'] = "";

function update_only_twitter_app() {
    if (check_only_twitter_app.checked) {
        option_str['only_twitter_app'] = `source:"Twitter for iPhone" OR source:"Twitter for iPad" OR source:"Twitter for Android" OR  source:"Twitter for Windows" OR source:"Twitter for Mac" OR source:"Twitter for Apple Watch" OR source:"Twitter Web App"`;
    }
    else {
        option_str['only_twitter_app'] = "";
    }

    update();
}

// リプライ
var select_replies = document.getElementById("id_select_replies");
select_replies.addEventListener('input', update_replies);
option_str['replies'] = "";

function update_replies() {
    option_str['replies'] = common_get_selected_option(select_replies, "replies");
    update();
}

// リンク付きツイート
var select_links = document.getElementById("id_select_links");
select_links.addEventListener('input', update_links);
option_str['links'] = "";

function update_links() {
    option_str['links'] = common_get_selected_option(select_links, "links");
    update();
}

// 画像付きツイート
var select_images = document.getElementById("id_select_images");
select_images.addEventListener('input', update_images);
option_str['images'] = "";

function update_images() {
    option_str['images'] = common_get_selected_option(select_images, "images");
    update();
}

// 動画付きツイート
var select_videos = document.getElementById("id_select_videos");
select_videos.addEventListener('input', update_videos);
option_str['videos'] = "";

function update_videos() {
    option_str['videos'] = common_get_selected_option(select_videos, "videos");
    update();
}

// 出力の更新
var output = document.getElementById("id_output");
option_str['output_cmd'] = "";
function update() {
    option_str['output_cmd'] = "";
    if (option_str['search_keyword'] != "") {
        option_str['output_cmd'] += option_str['search_keyword'];
    }
    if (option_str['only_keywords'] != "") {
        option_str['output_cmd'] += " " + option_str['only_keywords'];
    }
    if (option_str['autdor_id'] != "") {
        option_str['output_cmd'] += " " + option_str['autdor_id'];
    }
    if (option_str['exclude_keyword'] != "") {
        option_str['output_cmd'] += " " + option_str['exclude_keyword'];
    }
    if (option_str['exclude_autdor_id'] != "") {
        option_str['output_cmd'] += " " + option_str['exclude_autdor_id'];
    }
    if (option_str['included_url'] != "") {
        option_str['output_cmd'] += " " + option_str['included_url'];
    }
    if (option_str['replies'] != "") {
        option_str['output_cmd'] += " " + option_str['replies'];
    }
    if (option_str['reply_id'] != "") {
        option_str['output_cmd'] += " " + option_str['reply_id'];
    }
    if (option_str['links'] != "") {
        option_str['output_cmd'] += " " + option_str['links'];
    }
    if (option_str['since_date'] != "") {
        option_str['output_cmd'] += " " + option_str['since_date'];
    }
    if (option_str['until_date'] != "") {
        option_str['output_cmd'] += " " + option_str['until_date'];
    }
    if (option_str['lang'] != "") {
        option_str['output_cmd'] += " " + option_str['lang'];
    }
    if (option_str['images'] != "") {
        option_str['output_cmd'] += " " + option_str['images'];
    }
    if (option_str['videos'] != "") {
        option_str['output_cmd'] += " " + option_str['videos'];
    }
    if (option_str['only_twitter_app'] != "") {
        option_str['output_cmd'] += " " + option_str['only_twitter_app'];
    }

    output.value = option_str['output_cmd'];
}

// 検索
function search() {
    var search_cmd = output.value;
    window.open(`https://twitter.com/search?q=${search_cmd}`);
}

// 全てのオブジェクトを更新
function update_all() {
    update_search_keyword();
    update_exclude_keyword();
    update_autdor_id();
    update_exclude_autdor_id();
    update_reply_id();
    update_included_url();
    update_since_date();
    update_until_date();
    update_lang();
    update_only_keywords();
    update_replies();
    update_links();
    update_images();
    update_videos();
}

// option_valuesにセット
function set_option_values() {
    option_values['search_keyword'] = input_search_keyword.value;
    option_values['check-search_keyword'] = check_search_keyword.checked;
    option_values['only_twitter_app'] = check_only_twitter_app.checked;
    option_values['only_keywords'] = check_only_keywords.checked;
    option_values['autdor_id'] = input_autdor_id.value;
    option_values['check-autdor_id'] = check_autdor_id.checked;
    option_values['exclude_keyword'] = input_exclude_keyword.value;
    option_values['check-exclude_keyword'] = check_exclude_keyword.checked;
    option_values['exclude_autdor_id'] = input_exclude_autdor_id.value;
    option_values['check-exclude_autdor_id'] = check_exclude_autdor_id.checked;
    option_values['included_url'] = input_included_url.value;
    option_values['check-included_url'] = check_included_url.checked;
    option_values['replies'] = input_replies.value;
    option_values['check-replies'] = check_replies.checked;
    option_values['reply_id'] = select_replies.value;
    option_values['links'] = select_links.value;
    option_values['since_date'] = input_since_date.value;
    option_values['since_date_time'] = input_since_date_time.value;
    option_values['check-since_date'] = check_since_date.checked;
    option_values['until_date'] = input_until_date.value;
    option_values['until_date_time'] = input_until_date_time.value;
    option_values['check-until_date'] = check_until_date.checked;
    option_values['lang'] = select_lang.value;
    option_values['check-lang'] = check_lang.checked;
    option_values['images'] = select_images.value;
    option_values['videos'] = select_videos.value;
    option_values['output_cmd'] = output.value;
}

// 保存
var save_button = document.getElementById("id_save-button");
var save_preset_name = document.getElementById("id_input_save-preset-name");

function save() {
    var preset_name = save_preset_name.value;
    if (preset_name == "") {
        alert("プリセット名を入力してください");
        return;
    }

    var get_json = localStorage.getItem('yapps_twitter_search_preset');
    var presets_array = [];
    if (get_json) {
        presets_array = JSON.parse(get_json);
    }

    for (var i = 0; i < presets_array.length; i++) {
        if (presets_array[i]['preset_name'] == preset_name) {
            if (confirm("すでに同じ名前のプリセットが存在します："+preset_name+"\n上書きしますか？")) {
                presets_array.splice(i, 1);
                break;
            }
            else {
                return;
            }
        }
    }

    set_option_values();

    option_values["preset_name"] = preset_name;
    presets_array.push(option_values);
    
    // 保存
    localStorage.setItem('yapps_twitter_search_preset', JSON.stringify(presets_array));

    alert("保存しました："+preset_name);

    prepare_load_select_options();
}

// 読み込みselectの準備
var load_preset_select = document.getElementById("id_select_load-preset-name");

function prepare_load_select_options() {
    load_preset_select.innerHTML = "";

    var get_json = localStorage.getItem('yapps_twitter_search_preset');
    var presets_array = [];
    if (get_json) {
        presets_array = JSON.parse(get_json);
    }

    for (var i = presets_array.length - 1; i >= 0; i--) {
        var option = document.createElement("option");
        option.value = presets_array[i]['preset_name'];
        option.text = presets_array[i]['preset_name'];
        load_preset_select.add(option);
    }
}
$(window).on('load', prepare_load_select_options);  // ページの読み込み完了次第実行

// 読み込み
var load_button = document.getElementById("id_select_load-preset");

function load() {
    var preset_name = load_preset_select.value;
    option_values["preset_name"] = preset_name;

    if (preset_name == "") {
        alert("プリセットが存在しません");
        return;
    }

    var get_json = localStorage.getItem('yapps_twitter_search_preset');
    var presets_array = [];
    if (get_json) {
        presets_array = JSON.parse(get_json);
    }

    for (var i = 0; i < presets_array.length; i++) {
        if (presets_array[i]['preset_name'] == preset_name) {
            option_values = presets_array[i];

            input_search_keyword.value = option_values['search_keyword'];
            check_search_keyword.checked = option_values['check-search_keyword'];
            check_only_twitter_app.checked = option_values['only_twitter_app'];
            check_only_keywords.checked = option_values['only_keywords'];
            input_autdor_id.value = option_values['autdor_id'];
            check_autdor_id.checked = option_values['check-autdor_id'];
            input_exclude_keyword.value = option_values['exclude_keyword'];
            check_exclude_keyword.checked = option_values['check-exclude_keyword'];
            input_exclude_autdor_id.value = option_values['exclude_autdor_id'];
            check_exclude_autdor_id.checked = option_values['check-exclude_autdor_id'];
            input_included_url.value = option_values['included_url'];
            check_included_url.checked = option_values['check-included_url'];
            input_replies.value = option_values['replies'];
            check_replies.checked = option_values['check-replies'];
            select_replies.value = option_values['reply_id'];
            select_links.value = option_values['links'];
            input_since_date.value = option_values['since_date'];
            input_since_date_time.value = option_values['since_date_time'];
            check_since_date.checked = option_values['check-since_date'];
            input_until_date.value = option_values['until_date'];
            input_until_date_time.value = option_values['until_date_time'];
            check_until_date.checked = option_values['check-until_date'];
            select_lang.value = option_values['lang'];
            check_lang.checked = option_values['check-lang'];
            select_images.value = option_values['images'];
            select_videos.value = option_values['videos'];

            update_all();
            output.value = option_values['output_cmd'];
            
            break;
        }
    }
}
