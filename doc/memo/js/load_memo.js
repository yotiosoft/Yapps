var get_json = localStorage.getItem('yapps_memopad');
var memo_array = {};
if (get_json) {
    memo_array = JSON.parse(get_json);

    for (memo in memo_array) {
        var memo_title          = document.createElement('div');
        memo_title.className    = 'title';
        memo_title.textContent  = memo_array[memo].title;

        var memo_date           = document.createElement('div');
        memo_date.className     = 'date';
        memo_date.textContent   = memo_array[memo].time.year + '/' + zeroPadding(memo_array[memo].time.month, 2) + '/' + zeroPadding(memo_array[memo].time.date, 2) + ' ' 
            + zeroPadding(memo_array[memo].time.hour, 2) + ':' + zeroPadding(memo_array[memo].time.min, 2) + ':' + zeroPadding(memo_array[memo].time.sec, 2);

        var memo_text           = document.createElement('div');
        memo_text.className     = 'text';
        memo_text.style         = 'white-space: pre-wrap;';
        memo_text.textContent   = memo_array[memo].text;
    
        var memo_paper          = document.createElement('div');
        memo_paper.className    = 'memo-paper';
        memo_paper.style        = 'background-color: #'+memo_array[memo].color;
        memo_paper.appendChild(memo_title);
        memo_paper.appendChild(memo_date);
        memo_paper.appendChild(memo_text);

        document.getElementById("memo-paper-area-id").appendChild(memo_paper);
    }
}

function zeroPadding(num,length){
    return ('0000000000' + num).slice(-length);
}
