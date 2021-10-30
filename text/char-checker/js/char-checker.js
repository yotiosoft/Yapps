function OnCheckButtonClick() {
    var input  = document.getElementById("input-textarea");
    var output = document.getElementById("output-area");

    while (output.firstChild) {
        output.removeChild(output.firstChild);
    }

    var full_char = false;
    var bcg = null;
    for (var i=0; i<input.value.length; i++) {
        if (input.value[i].match(/^[^\x01-\x7E\xA1-\xDF]+$/)) { 
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
}
