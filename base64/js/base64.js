var input_text = null;

function OnEncodeButtonClick() {
    var input_textarea = document.getElementById("input-textarea");
    var output_textarea = document.getElementById("output-textarea");
    if (input_text == null) {
        input_text = input_textarea.value;
    }
    var result = base64_encode(input_text);
    output_textarea.value = result;
}

function OnDecodeButtonClick() {
    var input_textarea = document.getElementById("input-textarea");
    var output_textarea = document.getElementById("output-textarea");
    var text = input_textarea.value;
    var result = base64_decode(text);
    output_textarea.value = result;
}

function DropHandler(event) {
    event.preventDefault();
    var input_textarea = document.getElementById("input-textarea");
    var output_textarea = document.getElementById("output-textarea");
    var file = event.dataTransfer.files[0];
    var reader = new FileReader();
    reader.onload = function (e) {
        input_textarea.value = e.target.result;
        var result = base64_encode(e.target.result);
        output_textarea.value = result;
    };
    reader.readAsText(file);
    input_text = reader.result;
    console.log(input_text);
}

function base64_encode(str) {
    return window.btoa(unescape(encodeURIComponent(str)));
}

function base64_decode(str) {
    return decodeURIComponent(escape(window.atob(str)));
}
