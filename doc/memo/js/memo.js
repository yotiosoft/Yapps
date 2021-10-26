function OnSaveButtonClick(halfToFull) {
    var title = document.getElementById("title").value;
    var str   = document.getElementById("input-textarea").value;
    
    var now   = new Date();
    var get_json = localStorage.getItem('yapps_memopad');
    var memo_array = [];
    if (get_json) {
        memo_array = JSON.parse(get_json);
    }

    var time = {
        'year'  : now.getFullYear(),
        'month' : now.getMonth() + 1,
        'date'  : now.getDate(),
        'hour'  : now.getHours(),
        'min'   : now.getMinutes(),
        'sec'   : now.getSeconds()
    }

    var color_array = [
        "f4d03f", "f5e653", "4ecdc4", "7befb2", "89c4f4", "19b5fe", "d5b8ff"
    ]
    var color = color_array[Math.floor(Math.random() * color_array.length)];

    hash_sha256(now.getTime()+str).then(v => {
        memo_array.push({
            'hash'  : v,
            'title' : title,
            'color' : color,
            'time'  : time,
            'text'  : str
        });
    
        localStorage.setItem('yapps_memopad', JSON.stringify(memo_array));
    });
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
