$(window).on('load', function() {
    $('#input-textarea').keyup(function() {
        var output_char_count = document.getElementById("output-char-count");
        var output_char_count_wo_br = document.getElementById("output-char-count-without-br");

        var input_textarea = document.getElementById("input-textarea");

        // 各カウント値の取得
        var char_count = input_textarea.value.length;
        var char_count_wo_br = input_textarea.value.replace(/\r\n|\r|\n/g, "").length;

        // 出力
        output_char_count.value = char_count;
        output_char_count_wo_br.value = char_count_wo_br;
    });
});
