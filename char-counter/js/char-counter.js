$(window).on('load', function() {
    $('#input-textarea').keyup(function() {
        var output_char_count = document.getElementById("output-char-count");
        var output_char_count_wo_br_space = document.getElementById("output-char-count-without-br-space");
        var output_char_count_br = document.getElementById("output-char-count-br");
        var output_char_count_space = document.getElementById("output-char-count-space");
        //var output_char_count_wo_space = document.getElementById("output-char-count-without-space");

        var input_textarea = document.getElementById("input-textarea");

        // 各カウント値の取得
        var char_count = input_textarea.value.length;

        var char_count_wo_br = input_textarea.value.replace(/\r\n|\r|\n/g, "").length;
        var char_count_wo_space = input_textarea.value.replace(/\s/g, "").length;

        var char_count_br = char_count - char_count_wo_br;
        var char_count_space = char_count - char_count_wo_space - char_count_br;

        // 出力
        output_char_count.value = char_count;
        output_char_count_wo_br_space.value = char_count - char_count_br - char_count_space;
        output_char_count_br.value = char_count_br;
        output_char_count_space.value = char_count_space;
        //output_char_count_wo_space.value = char_count_wo_space;
    });
});
