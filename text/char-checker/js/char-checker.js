function OnCheckButtonClick() {
    var input  = document.getElementById("input-textarea");
    var output = document.getElementById("output-area");

    while (output.firstChild) {
        output.removeChild(output.firstChild);
    }

    for (var i=0; i<input.value.length; i++) {
        if (input.value[i].match(/^[^\x01-\x7E\xA1-\xDF]+$/)) { 
            var bcg = document.createElement("span");
            bcg.style = "background-color: #ffcc00;";
            bcg.textContent = input.value[i];
            output.appendChild(bcg);
        }
        else {
            var char = document.createElement("span");
            char.textContent = input.value[i];
            output.appendChild(char);
        }
        console.log(input.value[i]);
    }
}
