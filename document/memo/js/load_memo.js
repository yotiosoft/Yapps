console.log("before");
var get_json = localStorage.getItem('yapps_memopad');
var memo_array = {};
if (get_json) {
    console.log("I'm in");
    memo_array = JSON.parse(get_json);
    console.log(memo_array);

    for (memo in memo_array) {
        console.log(memo_array[memo].title);
        console.log(memo_array[memo].text);
        var memo_title      = document.createElement('input');
        memo_title.type     = 'text';
        memo_title.id       = 'title2';
        memo_title.name     = 'title2';
        memo_title.className= 'simple-inputtext';
        memo_title.value    = memo_array[memo].title;
    
        var memo_text       = document.createElement('textarea');
        memo_text.name      = 'input-text2';
        memo_text.id        = 'input-textarea2';
        memo_text.className = 'simple-textarea'
        memo_text.value     = memo_array[memo].text;

        document.getElementById("memo-area").appendChild(memo_title);
        document.getElementById("memo-area").appendChild(memo_text);
    }
}
