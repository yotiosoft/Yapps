var base64_data = "";

function OnEncodeButtonClick() {
    var input_textarea = document.getElementById("input-textarea");
    var output_textarea = document.getElementById("output-textarea");
    input_text = input_textarea.value;
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

function OnDownloadButtonClick() {
    var text = base64_data;
    console.log(text);
    var blob = new Blob([text], { type: "application/octet-stream" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = "base64.png";
    a.click();
}

function dropHandler(event) {
    event.preventDefault();
    var output_textarea = document.getElementById("output-textarea");
    var file = event.dataTransfer.files[0];
    var reader = new FileReader();
    reader.onload = function (e) {
        var result = base64_encode(e.target.result);
        output_textarea.value = result;
    };
    reader.readAsText(file);
}

function dragOverHandler(event) {
    event.preventDefault();
    var drop_area_wrap = document.getElementById("file-drop");
    drop_area_wrap.style.border = "2px dashed #000";
}

function fileInputHandler(event) {
    var output_textarea = document.getElementById("output-textarea");
    var file = event.target.files[0];
    var reader = new FileReader();
    reader.onload = function (e) {
        var result = base64_encode(e.target.result);
        output_textarea.value = result;
    };
    reader.readAsText(file);
}

function base64_encode(data){
    return btoa([...data].map(n => String.fromCharCode(n)).join(""));
}

function base64_decode(data){
    return new Uint8Array([...atob(data)].map(s => s.charCodeAt(0)));
}
