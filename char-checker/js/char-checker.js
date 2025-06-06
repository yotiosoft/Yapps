$(window).on('load', function() {
    // 情報の表示
    //information_show_if_needed('yapps_info_char-checker_250217', 'information_button');
});

$('#input-textarea').keyup(function() {
    var input  = document.getElementById("input-textarea");
    var output = document.getElementById("output-area");

    while (output.firstChild) {
        output.removeChild(output.firstChild);
    }

    var full_char = false;
    var bcg = document.createElement("span");
    for (var i=0; i<input.value.length; i++) {
        if (input.value[i].match(/^[\p{Script=Hiragana}\u30A0-\u30FF\u31F0-\u31FF\u3000-\u303F\u4E00-\u9FFF\uFF01-\uFF60\uFFE0-\uFFE6\p{Script=Han}\u00A7-\u00A8\u00B0-\u00B1\u00B4\u00B6\u00D7\u00F7\u0390-\u03FF\u0401\u0410-\u044F\u0451\u2100-\u2BFF\u3000-\u33FF\uFF01-\uFF60\uFFE0-\uFFE6]+$/u)) { 
            if (!full_char) {
                if (bcg != null)
                    output.appendChild(bcg);

                full_char = true;
                bcg = document.createElement("span");
                bcg.style = "background-color: #ffcc00;";
            }
            bcg.textContent += input.value[i];
        }
        else {
            if (full_char) {
                if (bcg != null)
                    output.appendChild(bcg);

                full_char = false;
                bcg = document.createElement("span");
            }
            bcg.textContent += input.value[i];
        }
        if (bcg != null)
            output.appendChild(bcg);
    }
});
