$(window).on('load', function() {
    // 情報の表示
    information_show_if_needed('yapps_info_random_240406', 'information_button');

    var segmenter;
    var use_segmenter = true;
    // Intl.Segmenterが使えるかどうかの判定
    if (Intl != undefined && Intl.Segmenter != undefined) {
        segmenter = new Intl.Segmenter("ja-JP", { granularity: "grapheme" });
    } else {
        use_segmenter = false;

        document.getElementById("intl_caution").insertAdjacentHTML(
            'beforebegin',
            '<div class="information" style="background-color: #dddd00; color: #000;"> \
                本ツールでは文字数を性格にカウントするために Intl.Segmenter を利用していますが、お使いのブラウザは対応していないようです。<br> \
                そのため、絵文字や異体字、結合文字など特殊文字を含む文字列のカウントは正確に行えません。<br> \
                これらを含む文字列を入力する場合は、Google Chrome などの対応済みブラウザをご利用ください。<br> \
            </div>'
        );
    }
    function get_segments(input_value) {
        if (!use_segmenter) {
            return [...input_value];
        }
        return [...segmenter.segment(input_value)];
    }

    $('#input-textarea').keyup(function() {
        var output_char_count = document.getElementById("output-char-count");
        var output_char_count_wo_br_space = document.getElementById("output-char-count-without-br-space");
        var output_char_count_br = document.getElementById("output-char-count-br");
        var output_char_count_space = document.getElementById("output-char-count-space");
        var output_char_count_wo_br = document.getElementById("output-char-count-without-br");
        var output_line_count = document.getElementById("output-line-count");

        var input_textarea = document.getElementById("input-textarea");
        var input_value = input_textarea.value;

        // 絵文字の置き換え
        // 各カウント値の取得
        var char_count = get_segments(input_value).length;

        var char_count_wo_br = get_segments(input_value.replace(/\r\n|\r|\n/g, "")).length;
        var char_count_wo_space = get_segments(input_value.replace(/\s/g, "")).length;

        var char_count_br = char_count - char_count_wo_br;
        var char_count_space = char_count - char_count_wo_space - char_count_br;

        // 出力
        output_char_count.value = char_count;
        output_char_count_wo_br_space.value = char_count - char_count_br - char_count_space;
        output_char_count_br.value = char_count_br;
        output_char_count_space.value = char_count_space;
        output_char_count_wo_br.value = char_count_wo_br;
        output_line_count.value = char_count_br + 1;
    });
});
