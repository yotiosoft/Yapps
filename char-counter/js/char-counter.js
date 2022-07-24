$(window).on('load', function() {
    $('#input-textarea').keyup(function() {
        var output_char_count = document.getElementById("output-char-count");
        var input_textarea = document.getElementById("input-textarea");

        // 各カウント値の取得
        var char_count = input_textarea.value.length;

        // 出力
        output_char_count.value = char_count;
    });
});
