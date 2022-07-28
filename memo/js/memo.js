function OnSaveNewMemoButtonClick() {
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
        
        // 保存
        localStorage.setItem('yapps_memopad', JSON.stringify(memo_array));
        // 再読み込み
        load_memo();
    });
}

function OnSaveButtonClick(hash, color) {
    var title = document.getElementById("input_text_" + hash).value;
    var str   = document.getElementById("textarea_" + hash).value;

    // 更新前の要素は削除
    OnDeleteButtonClick(hash, false);
    
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

    hash_sha256(now.getTime()+str).then(v => {
        memo_array.push({
            'hash'  : v,
            'title' : title,
            'color' : color,
            'time'  : time,
            'text'  : str
        });
        
        // 保存
        localStorage.setItem('yapps_memopad', JSON.stringify(memo_array));
        // 再読み込み
        load_memo();
    });
}

function OnDeleteButtonClick(hash, need_confirm) {
    var get_json = localStorage.getItem('yapps_memopad');
    var memo_array = [];
    if (get_json) {
        memo_array = JSON.parse(get_json);

        // ハッシュが一致する要素を削除
        memo_array.some(function(v, i) {
            if (v.hash == hash) {
                // 確認
                var confirm_ok = false;
                if (need_confirm) {
                    confirm_ok = confirm("次のメモが削除されます：\n" +
                    "タイトル："+v.title+"\n" +
                    "最終更新日時：" + printTime(v.time) + "\n\nよろしいですか？");
                }

                if (confirm_ok || !need_confirm) {
                    memo_array.splice(i, 1);
                }
                else {
                    return;
                }
            }
        });

        // 保存
        localStorage.setItem('yapps_memopad', JSON.stringify(memo_array));
        // 再読み込み
        load_memo();
    }
}

function OnDownloadButtonClick(hash, download_button_id) {
    var download_button = document.getElementById(download_button_id);
    var get_json = localStorage.getItem('yapps_memopad');
    var memo_array = [];
    if (get_json) {
        memo_array = JSON.parse(get_json);

        // ハッシュが一致する要素をダウンロード
        memo_array.some(function(v, i) {
            if (v.hash == hash) {
                var title   = v.title;
                var str     = v.text;

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
                    download_button.click();
                }
            }
        });
    }
}

function OnEditButtonClick(hash, memo_paper_wrap, memo_paper_area) {
    var get_json = localStorage.getItem('yapps_memopad');
    var memo_array = [];
    if (get_json) {
        memo_array = JSON.parse(get_json);

        memo_array.some(function(v, i) {
            if (v.hash == hash) {
                var memo_title   = v.title;
                var memo_str     = v.text;
                var height  = memo_paper_wrap.clientHeight;

                // memo_paper_wrap内のすべての要素を削除
                while(memo_paper_wrap.firstChild) {
                    memo_paper_wrap.removeChild(memo_paper_wrap.firstChild);
                }

                // 編集用要素を設置
                var memo_paper          = document.createElement('div');
                memo_paper.className    = 'memo-paper';
                memo_paper.style        = 'background-color: #'+v.color+'; height: 100%;';

                var memo_title_element  = document.createElement('input');
                memo_title_element.type = 'text';
                memo_title_element.value = memo_title;
                memo_title_element.id   = 'input_text_' + hash;
                memo_title_element.className = 'simple-inputtext';
                
                var memo_textarea_element = document.createElement('textarea');
                memo_textarea_element.textContent = memo_str;
                memo_textarea_element.id    = 'textarea_' + hash;
                memo_textarea_element.className = 'simple-textarea';
                memo_textarea_element.style = 'height: ' + (height - memo_title_element.clientHeight - 130) + 'px;';

                var memo_savebtn_element_link = document.createElement('a');
                memo_savebtn_element_link.href = "JavaScript:OnSaveButtonClick(\""+hash+"\", \""+ v.color +"\")";
                var memo_savebtn_element    = document.createElement('div');
                memo_savebtn_element.className = 'round-rect-button';
                var memo_savebtn_text       = document.createElement('p');
                memo_savebtn_text.textContent = '保存';
                memo_savebtn_text.className = 'middle-text';
                memo_savebtn_text.style     = 'height: 20px;';
                memo_savebtn_element.appendChild(memo_savebtn_text);
                memo_savebtn_element.style = 'min-width: 50px; height: 30px; padding: 0px; margin: 5px; float: right;';
                memo_savebtn_element_link.appendChild(memo_savebtn_element);
                
                memo_paper.appendChild(memo_title_element);
                memo_paper.appendChild(memo_textarea_element);
                memo_paper.appendChild(memo_savebtn_element_link);
                memo_paper_wrap.appendChild(memo_paper);
            }
        });
    }
}

function printTime(time) {
    return time.year + '/' + zeroPadding(time.month, 2) + '/' + zeroPadding(time.date, 2) + ' '
    + zeroPadding(time.hour, 2) + ':' + zeroPadding(time.min, 2) + ':' + zeroPadding(time.sec, 2);
}

function close_information_button() {
    var get_json = localStorage.getItem('yapps_memopad_config');

    var memo_config = {};
    if (get_json) {
        memo_config = JSON.parse(get_json);
    }

    memo_config["information_button_flag"] = false;

    // 保存
    localStorage.setItem('yapps_memopad_config', JSON.stringify(memo_config));
}

$(window).on('load', function() {
    var get_json = localStorage.getItem('yapps_memopad_config');
    var memo_config = {};
    if (get_json) {
        memo_config = JSON.parse(get_json);
    }

    if ("information_button_flag" in memo_config) {
        if (!memo_config["information_button_flag"]) {
            $('#information_button').hide();
        }
    }
});
