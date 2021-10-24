function OnConvertButtonClick(halfToFull) {
    input_area  = document.getElementById("input-textarea");
}

function OnDownloadButtonClick() {
    var title = document.getElementById("title").value;
    var str   = document.getElementById("input-textarea").value;
    var download_button = document.getElementById("download-button");

    var blob = new Blob(
        [ str ], 
        { "type": "text/plain"}
    );
    var file_name = title+".txt";
    if (window.navigator.msSaveBlob) {
        window.navigator.msSaveBlob(blob, file_name);
        window.navigator.msSaveOrOpenBlob(blob, file_name);
    }
    else {
        download_button.download = title+".txt";
        download_button.href = window.URL.createObjectURL(blob);
    }
}
