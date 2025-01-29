$('#input-textarea').keyup(function() {
    var input  = document.getElementById("input-textarea");
    var output = document.getElementById("output-area");

    while (output.firstChild) {
        output.removeChild(output.firstChild);
    }

    var tab_char = false, space_char = false;
    var bcg = document.createElement("span");
    for (var i=0; i<input.value.length; i++) {
        // タブ文字
        if (input.value[i].match(/^\t$/)) {
            if (!tab_char) {
                if (bcg != null)
                    output.appendChild(bcg);

                tab_char = true;
                space_char = false;
                bcg = document.createElement("span");
                bcg.style = "background-color: #ef454a;";
            }
            bcg.textContent += "\t";
        }
        // スペース
        else if (input.value[i].match(/^\s$/)) {
            if (!space_char) {
                if (bcg != null)
                    output.appendChild(bcg);

                space_char = true;
                tab_char = false;
                bcg = document.createElement("span");
                bcg.style = "background-color: #ffcc00;";
            }
            bcg.textContent += input.value[i];
        }
        // 通常文字
        else {
            if (tab_char || space_char) {
                if (bcg != null)
                    output.appendChild(bcg);

                tab_char = false;
                space_char = false;
                bcg = document.createElement("span");
            }
            bcg.textContent += input.value[i];
        }
        if (bcg != null)
            output.appendChild(bcg);
    }
});
