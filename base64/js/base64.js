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

function toBinary(string) {
    // JSの文字列はUTF-16からなるので、16bitの箱を用意する
    const codeUnits = new Uint16Array(string.length);
    for (let i = 0; i < codeUnits.length; i++) {
      // １文字ずつコードポイントを出力して、入れていく
      codeUnits[i] = string.charCodeAt(i);
    }
    console.log(codeUnits);
    // （...） 内がわかりにくいが、16bit 毎だったバイナリを 8bit 毎にわけて、それぞれを文字列に変換している
    // Uint8Array の　要素の範囲は 0..255 であるため変換後の文字が`バイナリ文字`であることが保証できる
    const uint8_array = new Uint8Array(codeUnits.buffer);
    
    let binaryString = "";
    const len = uint8_array.byteLength;
    for (let i = 0; i < len; i++) {
        binaryString += String.fromCharCode(uint8_array[i]);
    }
    return binaryString
  }

function base64_encode(str) {
    binary_str = toBinary(str);
    console.log(binary_str);
    return btoa(binary_str);
}

function base64_decode(str) {
    base64_data = atob(str);
    return base64_data;
}
