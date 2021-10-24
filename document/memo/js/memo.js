function OnSaveButtonClick(halfToFull) {
    var title = document.getElementById("title").value;
    var str   = document.getElementById("input-textarea").value;

    var get_json = localStorage.getItem('yapps_memopad');
    var memo_array = [];
    if (get_json) {
        memo_array = JSON.parse(get_json);
    }

    memo_array.push({
        'title' : title,
        'text'  : str
    });

    localStorage.setItem('yapps_memopad', JSON.stringify(memo_array));
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
