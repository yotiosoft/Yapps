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

// 出力の更新
var output = document.getElementById("id_output");
var output_cmd = "";
function update() {
    output_cmd = `${search_keyword} ${author_id}`;

    output.value = output_cmd;
}

// 検索
function search() {
    var search_cmd = output.value;
    window.open(`https://twitter.com/search?q=${search_cmd}`);
}
