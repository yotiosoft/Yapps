function update_output(rand_array) {
    output = document.getElementById('id_output');
    output.value = "";
    for (i=0; i<rand_array.length; i++) {
        output.value += rand_array[i] + '\n';
    }
}

function send_and_get(distribution, params) {
    // 「接続中」と出力しておく
    output = document.getElementById('id_output');
    output.value = "接続中";

    // パラメータからクエリを生成
    const query = new URLSearchParams(params);

    // JSONをフェッチ
    console.log(`https://murmuring-taiga-39514.herokuapp.com/random/${distribution}?${query}`);
    fetch(`https://murmuring-taiga-39514.herokuapp.com/random/${distribution}?${query}`)
    .then(response => response.json())
    .then(data => {
        if (data.hasOwnProperty('rand_array')) {
            update_output(data.rand_array);     // 結果を出力
        }
        else if (data.hasOwnProperty('error_message')) {
            alert(data.error_message);
        }
    });
}

// 一様分布
function uniform() {
    // パラメータの取得
    var trials              = document.getElementById('id_trials');
    var integer_mode        = document.getElementById('id_integer_mode');

    var range               = document.getElementsByName('range_uniform');

    var input_limit_min     = document.getElementById('id_input_min_uniform');
    var input_limit_max     = document.getElementById('id_input_max_uniform');

    var input_digit         = document.getElementById('id_input_digit_uniform');

    // クエリパラメータの登録
    const params = {};

    if (integer_mode.checked) {
        params["type"] = "int";
    }
    else {
        params["type"] = "float";
    }

    params["trials"] = trials.value;
 
    if (range[0].checked) {
        params["max"] = parseInt(input_limit_max.value);
        params["min"] = parseInt(input_limit_min.value);
    }
    else if (range[1].checked) {
        let digits = parseInt(input_digit.value);
        let base_num = Math.pow(10, digits-1);
        let max_num = Math.pow(10, digits) - 1;
        
        params["max"] = base_num;
        params["min"] = max_num;
    }

    // 乱数APIと送受信
    send_and_get("uniform", params);
}

// 正規分布
function normal() {
    // パラメータの取得
    var trials              = document.getElementById('id_trials');
    var integer_mode        = document.getElementById('id_integer_mode');

    var input_mu            = document.getElementById('id_input_mu');
    var input_sigma         = document.getElementById('id_input_sigma');

    // クエリパラメータの登録
    const params = {};

    if (integer_mode.checked) {
        params["type"] = "int";
    }
    else {
        params["type"] = "float";
    }

    params["trials"] = trials.value;

    params["mu"]    = input_mu.value;
    params["sigma"] = input_sigma.value;

    // 乱数APIと送受信
    send_and_get("normal", params);
}

// ベータ分布
function beta() {
    // パラメータの取得
    var trials              = document.getElementById('id_trials');
    var integer_mode        = document.getElementById('id_integer_mode');

    var input_alpha         = document.getElementById('id_input_alpha');
    var input_beta          = document.getElementById('id_input_beta');

    // クエリパラメータの登録
    const params = {};

    if (integer_mode.checked) {
        params["type"] = "int";
    }
    else {
        params["type"] = "float";
    }

    params["trials"] = trials.value;

    params["alpha"] = input_alpha.value;
    params["beta"]  = input_beta.value;

    // 乱数APIと送受信
    send_and_get("beta", params);
}

// 三角分布
function triangular() {
    // パラメータの取得
    var trials              = document.getElementById('id_trials');
    var integer_mode        = document.getElementById('id_integer_mode');

    var range               = document.getElementsByName('range_triangular');

    var input_limit_min     = document.getElementById('id_input_min_triangular');
    var input_limit_max     = document.getElementById('id_input_max_triangular');

    var input_digit         = document.getElementById('id_input_digit_triangular');

    var input_mode          = document.getElementById('id_input_mode');

    // クエリパラメータの登録
    const params = {};

    if (integer_mode.checked) {
        params["type"] = "int";
    }
    else {
        params["type"] = "float";
    }

    params["trials"] = trials.value;
 
    if (range[0].checked) {
        params["max"] = parseInt(input_limit_max.value);
        params["min"] = parseInt(input_limit_min.value);
    }
    else if (range[1].checked) {
        let digits = parseInt(input_digit.value);
        let base_num = Math.pow(10, digits-1);
        let max_num = Math.pow(10, digits) - 1;
        
        params["max"] = base_num;
        params["min"] = max_num;
    }

    params["mode"] = input_mode.value;

    // 乱数APIと送受信
    send_and_get("triangular", params);
}

// ラムダ分布
function lambda() {
    // パラメータの取得
    var trials              = document.getElementById('id_trials');
    var integer_mode        = document.getElementById('id_integer_mode');

    var input_lambda        = document.getElementById('id_input_lambda');

    // クエリパラメータの登録
    const params = {};

    if (integer_mode.checked) {
        params["type"] = "int";
    }
    else {
        params["type"] = "float";
    }

    params["trials"] = trials.value;

    params["lambda"] = input_lambda.value;

    // 乱数APIと送受信
    send_and_get("lambda", params);
}

function norm_random() {
    num = 0, i;
    for (i = 0; i < 12; i++) {
        num += Math.random();
    }
    num = num / 12;
    console.log(num);
    return num;
}

function make_number() {
    var range               = document.getElementsByName("range");
    var select_random       = document.getElementById('id_select_random');

    var input_limit_min     = document.getElementById('id_input_min');
    var input_limit_max     = document.getElementById('id_input_max');

    var input_digit         = document.getElementById('id_input_digit');

    let num = 0;
    let random;

    if (select_random.value == "uniform") {
        random = Math.random();
    }
    else if (select_random.value == "normal") {
        random = norm_random();
    }
 
    if (range[0].checked) {
        let limit_max = parseInt(input_limit_max.value);
        let limit_min = parseInt(input_limit_min.value);
        let range = limit_max - limit_min + 1;
        num = Math.floor(random * range) + limit_min;
    }
    else if (range[1].checked) {
        let digits = parseInt(input_digit.value);
        let base_num = Math.pow(10, digits-1);
        let max_num = Math.pow(10, digits) - 1;
        let range = max_num - base_num + 1;
        num = Math.floor(random * range) + base_num;
    }
    else if (range[2].checked) {
        num = Math.floor(random * Number.MAX_SAFE_INTEGER);
    }

    return num;
}

function OnMakeButtonClick() {
    var select_random = document.getElementById("id_select_random");
                            
    if (select_random.value == "uniform") {
        uniform();
    }
    else if (select_random.value == "normal") {
        normal();
    }
    else if (select_random.value == "beta") {
        beta();
    }
    else if (select_random.value == "triangular") {
        triangular();
    }
    else if (select_random.value == "lambda") {
        lambda();
    }
}
