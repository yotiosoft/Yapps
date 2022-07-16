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

// 検索キーワード
var check_search_keyword = document.getElementById("id_check_search-keyword");
check_search_keyword.addEventListener('input', update_search_keyword);
var input_search_keyword = document.getElementById("id_input_search-keyword");
input_search_keyword.addEventListener('input', update_search_keyword);

var search_keyword = "";

function update_search_keyword() {
    if (check_search_keyword.checked) {
        var search_keywords = input_search_keyword.value.split(`, `);
        search_keyword = "";

        for (var i = 0; i < search_keywords.length; i++) {
            search_keyword += search_keywords[i];
            if (i != search_keywords.length - 1) {
                search_keyword += " ";
            }
        }
    }
    else {
        search_keyword = "";
    }

    update();
}

// 除外キーワード
var check_exclude_keyword = document.getElementById("id_check_exclude-keyword");
check_exclude_keyword.addEventListener('input', update_exclude_keyword);
var input_exclude_keyword = document.getElementById("id_input_exclude-keyword");
input_exclude_keyword.addEventListener('input', update_exclude_keyword);

var exclude_keyword = "";

function update_exclude_keyword() {
    if (check_exclude_keyword.checked && input_exclude_keyword.value != "") {
        var exclude_keywords = input_exclude_keyword.value.split(`, `);
        exclude_keyword = "";

        for (var i = 0; i < exclude_keywords.length; i++) {
            exclude_keyword += "-" + exclude_keywords[i];
            if (i != exclude_keywords.length - 1) {
                exclude_keyword += " ";
            }
        }
    }
    else {
        exclude_keyword = "";
    }

    update();
}

// 投稿者ID
var check_autdor_id = document.getElementById("id_check_autdor-id");
check_autdor_id.addEventListener('input', update_autdor_id);
var input_autdor_id = document.getElementById("id_input_autdor-id");
input_autdor_id.addEventListener('input', update_autdor_id);

var autdor_id = "";

function update_autdor_id() {
    if (check_autdor_id.checked && input_autdor_id.value != "") {
        var autdor_ids = input_autdor_id.value.split(`, `);
        autdor_id = "";

        for (var i = 0; i < autdor_ids.length; i++) {
            autdor_id += " from:" + autdor_ids[i];
        }
    }
    else {
        autdor_id = "";
    }

    update();
}

// 除外ID
var check_exclude_autdor_id = document.getElementById("id_check_exclude-autdor-id");
check_exclude_autdor_id.addEventListener('input', update_exclude_autdor_id);
var input_exclude_autdor_id = document.getElementById("id_input_exclude-autdor-id");
input_exclude_autdor_id.addEventListener('input', update_exclude_autdor_id);

var exclude_autdor_id = "";

function update_exclude_autdor_id() {
    if (check_exclude_autdor_id.checked && input_exclude_autdor_id.value != "") {
        var exclude_autdor_ids = input_exclude_autdor_id.value.split(`, `);
        exclude_autdor_id = "";

        for (var i = 0; i < exclude_autdor_ids.length; i++) {
            exclude_autdor_id += " -from:" + exclude_autdor_ids[i];
        }
    }
    else {
        exclude_autdor_id = "";
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

var since_date = "";

function update_since_date() {
    if (!check_since_date.checked) {
        update();
        return;
    }

    console.log(input_since_date_time.value);

    since_date = "";
    if (input_since_date.value) {
        since_date = "since:" + input_since_date.value;
    }
    if (input_since_date_time.value) {
        if (!input_since_date.value) {
            var today = new Date();
            today.setDate(today.getDate());
            var year = today.getFullYear();
            var month = ("0"+(today.getMonth()+1)).slice(-2);
            var date = ("0"+today.getDate()).slice(-2);
            
            input_since_date.value = year +'-'+ month +'-'+ date;
            since_date = "since:" + check_since_date.value;
        }

        since_date += "_" + input_since_date_time.value + ":00_JST";
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

var until_date = "";

function update_until_date() {
    if (!check_until_date.checked) {
        update();
        return;
    }

    console.log(input_until_date_time.value);

    until_date = "";
    if (input_until_date.value) {
        until_date = "until:" + input_until_date.value;
    }
    if (input_until_date_time.value) {
        if (!input_until_date.value) {
            var today = new Date();
            today.setDate(today.getDate());
            var year = today.getFullYear();
            var month = ("0"+(today.getMonth()+1)).slice(-2);
            var date = ("0"+today.getDate()).slice(-2);
            
            input_until_date.value = year +'-'+ month +'-'+ date;
            until_date = "until:" + check_until_date.value;
        }

        until_date += "_" + input_until_date_time.value + ":00_JST";
    }

    update();
}

// 言語指定
var check_lang = document.getElementById("id_check_language");
check_lang.addEventListener('input', update_lang);
var input_lang = document.getElementById("id_select_language");
input_lang.addEventListener('input', update_lang);

var lang = "";

function update_lang() {
    if (check_lang.checked) {
        lang = "lang:" + input_lang.value;
    }
    else {
        lang = "";
    }

    update();
}

// キーワードのみ検索
var check_only_keywords = document.getElementById("id_check_only-keywords");
check_only_keywords.addEventListener('input', update_only_keywords);

var only_keywords = "";

function update_only_keywords() {
    if (check_only_keywords.checked) {
        only_keywords = "OR @i -@i";
    }
    else {
        only_keywords = "";
    }

    update();
}

// リプライ
var select_reply = document.getElementById("id_select_reply");
select_reply.addEventListener('input', update_reply);
var reply = "";

function update_reply() {
    if (select_reply.value == "include") {
        reply = "";
    }
    else if (select_reply.value == "exclude") {
        reply = "-filter:replies";
    }
    else if (select_reply.value == "only") {
        reply = "filter:replies";
    }

    update();
}

// リンク付きツイート
var select_links = document.getElementById("id_select_links");
select_links.addEventListener('input', update_links);
var links = "";

function update_links() {
    if (select_links.value == "include") {
        links = "";
    }
    else if (select_links.value == "exclude") {
        links = "-filter:links";
    }
    else if (select_reply.value == "only") {
        links = "filter:links";
    }

    update();
}

// 出力の更新
var output = document.getElementById("id_output");
var output_cmd = "";
function update() {
    output_cmd = "";
    if (search_keyword != "") {
        output_cmd += search_keyword;
    }
    if (only_keywords != "") {
        output_cmd += " " + only_keywords;
    }
    if (autdor_id != "") {
        output_cmd += " " + autdor_id;
    }
    if (exclude_keyword != "") {
        output_cmd += " " + exclude_keyword;
    }
    if (exclude_autdor_id != "") {
        output_cmd += " " + exclude_autdor_id;
    }
    if (reply != "") {
        output_cmd += " " + reply;
    }
    if (links != "") {
        output_cmd += " " + links;
    }
    if (since_date != "") {
        output_cmd += " " + since_date;
    }
    if (until_date != "") {
        output_cmd += " " + until_date;
    }
    if (lang != "") {
        output_cmd += " " + lang;
    }

    output.value = output_cmd;
}

// 検索
function search() {
    var search_cmd = output.value;
    window.open(`https://twitter.com/search?q=${search_cmd}`);
}
