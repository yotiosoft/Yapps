function OnRotateButtonClick() {
    input_area  = document.getElementById("input-textarea");
    output_area = document.getElementById("output-textarea");
    reverse_str = document.getElementById("reverse");

    // 変換
    output_area.value = "";
    $.getJSON("./codes.json", (data) => {
        var start = input_area.value.length - 1;
        var end = -1;
        var plus = -1;

        if (!reverse_str.checked) {
            start = 0;
            end = input_area.value.length;
            plus = 1;
        }

        for (var i = start; i != end; i += plus) {
            var replace = data.codes.find((v) => v.input == input_area.value[i]);
            if (replace) {
                output_area.value += replace.output;
            }
            else {
                var replace = data.codes.find((v) => v.output == input_area.value[i]);
                if (replace) {
                    output_area.value += replace.input;
                }
                else {
                    output_area.value += input_area.value[i];
                }
            }
        }
    });
}

function OnCopyButtonClick() {
    output_area = document.getElementById("output-textarea");
    output_area.select();
    document.execCommand("copy");
}
