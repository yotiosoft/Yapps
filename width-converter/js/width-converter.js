function OnConvertButtonClick(halfToFull) {
    input_area  = document.getElementById("input-textarea");
    output_area = document.getElementById("output-textarea");
    
    conv_alphabet    = document.getElementById("alphabet");
    conv_figures     = document.getElementById("figures");
    conv_kana        = document.getElementById("kana");
    conv_others      = document.getElementById("others");

    // 変換
    var converted_str = "";

    $.getJSON("./kana-codes.json", (kana) => {
        $.getJSON("./others-codes.json", (other_codes) => {
            for (var i = 0; i < input_area.value.length; i++) {
                var ascii = input_area.value.charCodeAt(i);
                
                // アルファベット
                if (conv_alphabet.checked) {
                    if (halfToFull) {
                        if ((ascii >= 65 && ascii <= 90) ||
                            (ascii >= 97 && ascii <= 122)) {
                            converted_str += String.fromCodePoint(ascii + 65248);
                            continue;
                        }
                    }
                    else {
                        if ((ascii >= 65248+65 && ascii <= 65248+90) ||
                            (ascii >= 65248+97 && ascii <= 65248+122)) {
                            converted_str += String.fromCodePoint(ascii - 65248);
                            continue;
                        }
                    }
                }
        
                // 数字
                if (conv_figures.checked) {
                    if (halfToFull) {
                        if (ascii >= 48 && ascii <= 57) {
                            converted_str += String.fromCodePoint(ascii + 65248);
                            continue;
                        }
                    }
                    else {
                        if (ascii >= 48 + 65248 && ascii <= 57 + 65248) {
                            converted_str += String.fromCodePoint(ascii - 65248);
                            continue;
                        }
                    }
                }
        
                // カタカナ
                if (conv_kana.checked) {
                    var replace;
                    if (halfToFull) {
                        replace = kana.codes.find((v) => v.half == input_area.value.slice(i, i+2));
                    }
                    else {
                        replace = kana.codes.find((v) => v.full == input_area.value[i]);
                    }
                    
                    if (replace) {
                        if (halfToFull) {
                            converted_str += replace.full;
                        }
                        else {
                            converted_str += replace.half;
                        }
                        continue;
                    }
                    else if (halfToFull) {
                        replace = kana.codes.find((v) => v.half == input_area.value[i]);
                        if (replace) {
                            converted_str += replace.full;
                            continue;
                        }
                    }
                }

                // 記号
                if (others.checked) {
                    var replace;
                    if (halfToFull) {
                        replace = other_codes.codes.find((v) => v.half == input_area.value[i]);
                    }
                    else {
                        replace = other_codes.codes.find((v) => v.full == input_area.value[i]);
                    }

                    if (replace) {
                        if (halfToFull) {
                            converted_str += replace.full;
                        }
                        else {
                            converted_str += replace.half;
                        }
                        continue;
                    }
                }

                // それ以外：そのまま（無変換）
                converted_str += input_area.value[i];
            }
            output_area.value = converted_str;
        });
    });
}

function OnCopyButtonClick() {
    output_area = document.getElementById("output-textarea");
    output_area.select();
    document.execCommand("copy");
}
