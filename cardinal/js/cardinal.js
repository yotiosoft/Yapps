var input_bin = document.getElementById("input_bin_id");
input_bin.addEventListener('input', update_from_bin);
var input_oct = document.getElementById("input_oct_id");
input_oct.addEventListener('input', update_from_oct);
var input_dec = document.getElementById("input_dec_id");
input_dec.addEventListener('input', update_from_dec);
var input_hex = document.getElementById("input_hex_id");
input_hex.addEventListener('input', update_from_hex);
var input_ncard = document.getElementById("input_ncard_id");
input_ncard.addEventListener('input', update_from_ncard);

var input_n = document.getElementById("input_n_id");
input_n.addEventListener('input', update_n);
var n = "";

var output_bin = document.getElementById("output_bin_id");
var output_oct = document.getElementById("output_oct_id");
var output_dec = document.getElementById("output_dec_id");
var output_hex = document.getElementById("output_hex_id");
var output_ncard = document.getElementById("output_ncard_id");

var dec_num = "";

function update_from_bin(e) {
    dec_num = parseInt(input_bin.value, 2);

    input_oct.value = "";
    input_dec.value = "";
    input_hex.value = "";
    input_ncard.value = "";

    update_outputs(dec_num);
}

function update_from_oct(e) {
    dec_num = parseInt(input_oct.value, 8);

    input_bin.value = "";
    input_dec.value = "";
    input_hex.value = "";
    input_ncard.value = "";

    update_outputs(dec_num);
}

function update_from_dec(e) {
    dec_num = parseInt(input_dec.value, 10);

    input_bin.value = "";
    input_oct.value = "";
    input_hex.value = "";
    input_ncard.value = "";

    update_outputs(dec_num);
}

function update_from_hex(e) {
    dec_num = parseInt(input_hex.value, 16);

    input_bin.value = "";
    input_oct.value = "";
    input_dec.value = "";
    input_ncard.value = "";

    update_outputs(dec_num);
}

function update_from_ncard(e) {
    if (n.length == 0) {
        alert('基数を指定してください');
        return;
    }

    var ncard_num = parseInt(input_ncard.value, parseInt(n, 10));

    input_bin.value = "";
    input_oct.value = "";
    input_dec.value = "";
    input_hex.value = "";

    update_outputs(ncard_num);
}

function update_n(e) {
    n = document.getElementById("input_n_id").value;

    if (dec_num.length > 0) {
        update_outputs(dec_num);
    }
}

function update_outputs(dec_num) {
    output_bin.value = dec_num.toString(2);
    output_oct.value = dec_num.toString(8);
    output_dec.value = dec_num.toString(10);
    output_hex.value = dec_num.toString(16);
    
    var n = document.getElementById("input_n_id").value;
    if (isNaN(parseInt(n, 10)) == false) {
        output_ncard.value = dec_num.toString(parseInt(n, 10));
    }
}
