// 検索キーワード
var check_search_keyword = document.getElementById("id_check_search-keyword");
check_search_keyword.addEventListener('input', update_search_keyword);
var input_search_keyword = document.getElementById("id_input_search-keyword");
input_search_keyword.addEventListener('input', update_search_keyword);

var search_keyword = "";

function update_search_keyword() {
    if (check_search_keyword.checked) {
        search_keyword = input_search_keyword.value;
    }
    else {
        search_keyword = "";
    }

    update();
}

// 投稿者ID
var check_author_id = document.getElementById("id_check_author-id");
check_author_id.addEventListener('input', update_author_id);
var input_author_id = document.getElementById("id_input_author-id");
input_author_id.addEventListener('input', update_author_id);

var author_id = "";

function update_author_id() {
    if (check_author_id.checked) {
        author_id = "from:" + input_author_id.value;
    }
    else {
        author_id = "";
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
    if (author_id != "") {
        output_cmd += " " + author_id;
    }
    if (reply != "") {
        output_cmd += " " + reply;
    }
    if (links != "") {
        output_cmd += " " + links;
    }

    output.value = output_cmd;
}

// 検索
function search() {
    var search_cmd = output.value;
    window.open(`https://twitter.com/search?q=${search_cmd}`);
}
