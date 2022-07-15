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

// 出力の更新
var output = document.getElementById("id_output");
var output_cmd = "";
function update() {
    output_cmd = `${search_keyword}`;

    output.value = output_cmd;
}
