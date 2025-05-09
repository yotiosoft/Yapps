$('#input-textarea').keyup(function() {
    var input  = document.getElementById("input-textarea");
    var output = document.getElementById("output-area");

    while (output.firstChild) {
        output.removeChild(output.firstChild);
    }

    var tab_char = false, half_space_char = false, full_space_char = false;
    var bcg = document.createElement("span");
    for (var i=0; i<input.value.length; i++) {
        // タブ文字
        if (input.value[i].match(/^\t$/)) {
            if (!tab_char) {
                if (bcg != null)
                    output.appendChild(bcg);

                tab_char = true;
                half_space_char = false;
                full_space_char = false;
                bcg = document.createElement("span");
                bcg.style = "background-color: #ef454a;";
            }
            bcg.textContent += "\t";
        }
        // 半角スペース
        else if (input.value[i].match(/^ $/)) {
            if (!half_space_char) {
                if (bcg != null)
                    output.appendChild(bcg);

                half_space_char = true;
                full_space_char = false;
                tab_char = false;
                bcg = document.createElement("span");
                bcg.style = "background-color: #20f582;";
            }
            bcg.textContent += input.value[i];
        }
        // 全角スペース
        else if (input.value[i].match(/^　$/)) {
            if (!full_space_char) {
                if (bcg != null)
                    output.appendChild(bcg);

                full_space_char = true;
                half_space_char = false;
                tab_char = false;
                bcg = document.createElement("span");
                bcg.style = "background-color: #20c8f5;";
            }
            bcg.textContent += input.value[i];
        }
        // 通常文字
        else {
            if (tab_char || half_space_char || full_space_char) {
                if (bcg != null)
                    output.appendChild(bcg);

                tab_char = false;
                half_space_char = false;
                full_space_char = false;
                bcg = document.createElement("span");
            }
            bcg.textContent += input.value[i];
        }
        if (bcg != null)
            output.appendChild(bcg);
    }
});
