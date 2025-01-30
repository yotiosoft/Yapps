$('#input-textarea').keyup(convert);
$('#without-marks').change(convert);

function insertSpacesWithoutMarks(text) {
    return text.replace(/(?![、。（）「」『』])([\u3000-\u9FFF])([\u0021-\u007D]+)/gu, '$1 $2')
               .replace(/([\u0021-\u007D]+)(?![、。（）「」『』])([\u3000-\u9FFF])/gu, '$1 $2');
    // 上記を半角スペース半角文字の間にある場合にもスペース追加を除くようにする
    // return text.replace(/(?![、。（）「」『』])([\u3000-\u9FFF])([\u0020-\u007D]+)/gu, '$1 $2')
}

function insertSpaces(text) {
    return text.replace(/([\u3000-\u9FFF])([\u0021-\u007D]+)/gu, '$1 $2')
               .replace(/([\u0021-\u007D]+)([\u3000-\u9FFF])/gu, '$1 $2');
}

function convert() {
    input_area  = document.getElementById("input-textarea");
    output_area = document.getElementById("output-textarea");

    // 句読点および括弧の前後にスペースを入れない
    var without_marks = document.getElementById("without-marks").checked;

    // 英単語と全角文字の間にスペースを入れる
    if (without_marks) {
        var converted_str = insertSpacesWithoutMarks(input_area.value);
        output_area.value = converted_str;
    }
    else {
        var converted_str = insertSpaces(input_area.value);
        output_area.value = converted_str;
    }
}

function OnCopyButtonClick() {
    output_area = document.getElementById("output-textarea");
    output_area.select();
    document.execCommand("copy");
}