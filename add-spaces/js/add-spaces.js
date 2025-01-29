$('#input-textarea').keyup(convert);
$('#replace_to_space').change(convert);

function insertSpaces(text) {
    return text.replace(/([\u3000-\u9FFF])([a-zA-Z0-9.,-/:-@\[-~\]]+)/gu, '$1 $2')
               .replace(/([a-zA-Z0-9.,-/:-@\[-~\]]+)([\u3000-\u9FFF])/gu, '$1 $2');
}

function convert() {
    input_area  = document.getElementById("input-textarea");
    output_area = document.getElementById("output-textarea");

    // 英単語と全角文字の間にスペースを入れる
    var converted_str = insertSpaces(input_area.value);

    output_area.value = converted_str;
}

function OnCopyButtonClick() {
    output_area = document.getElementById("output-textarea");
    output_area.select();
    document.execCommand("copy");
}