function load_memo() {
    var memo_paper_area = document.getElementById("memo_paper_area_id");
    var get_json = localStorage.getItem('yapps_memopad');
    var memo_array = {};

    if (get_json) {
        memo_array = JSON.parse(get_json);
        memo_array.reverse();

        while(memo_paper_area.childNodes.length > 2) {
            memo_paper_area.removeChild(memo_paper_area.lastChild);
        }
    
        for (memo in memo_array) {
            loadMemoOnce(memo_array[memo], memo_paper_area);
        }
    }
}

function loadMemoOnce(memo, memo_paper_area) {
    var memo_paper_wrap     = document.createElement('div');
    memo_paper_wrap.className = 'memo-paper-wrap';
    memo_paper_wrap.id      = 'memo_paper_wrap_' + memo.hash;

    var memo_title          = document.createElement('div');
    memo_title.className    = 'title';
    memo_title.textContent  = memo.title;

    var memo_title_area     = document.createElement('div');
    memo_title_area.className = 'title-area';
    memo_title_area.appendChild(memo_title);
    var memo_buttons_area   = document.createElement('div');
    memo_buttons_area.style = 'display: flex; flex-wrap: wrap;'

    var edit_button_link   = makeImageButton("JavaScript:OnEditButtonClick(\""+ memo.hash +"\", memo_paper_wrap_"+ memo.hash + ')', "/img/common/edit.svg", 24, 24, 'simple-img-button');
    edit_button_link.title = "編集";
    memo_buttons_area.appendChild(edit_button_link);
    var download_button_link = makeImageButton("JavaScript:OnDownloadButtonClick(\""+ memo.hash +"\", \"dlbtn_"+memo.hash+"\")", "/img/common/download.svg", 24, 24, 'simple-img-button');
    download_button_link.id  = 'dlbtn_' + memo.hash;
    download_button_link.title = "ダウンロード";
    memo_buttons_area.appendChild(download_button_link);
    var delete_button_link   = makeImageButton("JavaScript:OnDeleteButtonClick(\""+ memo.hash +"\", "+ true +")", "/img/common/delete.svg", 24, 24, 'simple-img-button');
    delete_button_link.title = "削除";
    memo_buttons_area.appendChild(delete_button_link);
    memo_title_area.appendChild(memo_buttons_area);

    var memo_date           = document.createElement('div');
    memo_date.className     = 'date';
    memo_date.textContent   = printTime(memo.time);

    var memo_text           = document.createElement('div');
    memo_text.className     = 'text';
    memo_text.style         = 'white-space: pre-wrap;';
    memo_text.textContent   = memo.text;

    var memo_paper          = document.createElement('div');
    memo_paper.className    = 'memo-paper';
    memo_paper.style        = 'background-color: #'+memo.color+';';
    memo_paper.appendChild(memo_title_area);
    memo_paper.appendChild(memo_date);
    memo_paper.appendChild(memo_text);

    memo_paper_wrap.appendChild(memo_paper);

    memo_paper_area.appendChild(memo_paper_wrap);
}

function makeImageButton(href, src, w, h, className) {
    var button_link = document.createElement('a');
    if (href != "")
        button_link.href = href;
    var button  = document.createElement('img');
    button.src = src;
    button.width = w;
    button.height = h;
    button_link.appendChild(button);
    button_link.className = className;
    return button_link;
}

function zeroPadding(num,length){
    return ('0000000000' + num).slice(-length);
}
