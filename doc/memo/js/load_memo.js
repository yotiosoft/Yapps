function load_memo() {
    var memo_paper_area = document.getElementById("memo-paper-area-id");
    var get_json = localStorage.getItem('yapps_memopad');
    var memo_array = {};

    if (get_json) {
        memo_array = JSON.parse(get_json);
        memo_array.reverse();

        while(memo_paper_area.firstChild) {
            memo_paper_area.removeChild(memo_paper_area.firstChild);
        }
    
        for (memo in memo_array) {
            var memo_title          = document.createElement('div');
            memo_title.className    = 'title';
            memo_title.textContent  = memo_array[memo].title;
    
            var memo_delete_button_link = document.createElement('a');
            memo_delete_button_link.href = "JavaScript:OnDeleteButtonClick(\""+ memo_array[memo].hash +"\")";
            var memo_delete_button  = document.createElement('img');
            memo_delete_button.src = "/img/common/delete.svg";
            memo_delete_button.width = 24;
            memo_delete_button.height = 24;
            memo_delete_button_link.appendChild(memo_delete_button);
            memo_delete_button_link.className = 'simple-img-button';
    
            var memo_title_area     = document.createElement('div');
            memo_title_area.className = 'title-area';
            memo_title_area.appendChild(memo_title);
            memo_title_area.appendChild(memo_delete_button_link);
    
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
            memo_paper.style        = 'background-color: #'+memo_array[memo].color+';';
            memo_paper.appendChild(memo_title_area);
            memo_paper.appendChild(memo_date);
            memo_paper.appendChild(memo_text);
    
            memo_paper_area.appendChild(memo_paper);
        }
    }
}

function zeroPadding(num,length){
    return ('0000000000' + num).slice(-length);
}
