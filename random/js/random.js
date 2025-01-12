//const api_url = "https://yapps-random-api.onrender.com";
const api_url = "https://r.yotio.jp/yapps-random";

// 接続確認用
function wakeup() {
    fetch(api_url)
    .then(response => {
        if (!response.ok) {
            alert("サーバエラーが発生しました。しばらくお待ちいただき、後でもう一度お試しください。");
        }
    })
    /*.catch(error => {
        alert(`乱数生成APIにアクセスできません。\nしばらくお待ちいただき、後でもう一度お試しください。\n\n${error}`);
    });*/
}

function update_output(rand_array) {
    const output = document.getElementById('id_output');
    output.value = "";
    for (i=0; i<rand_array.length; i++) {
        output.value += rand_array[i] + '\n';
    }
}

function send_and_get(distribution, params) {
    // 「乱数を生成中..」と出力しておく
    const output = document.getElementById('id_output');
    output.value = "乱数を生成中..";

    // パラメータからクエリを生成
    const query = new URLSearchParams(params);

    // JSONをフェッチ
    fetch(`${api_url}/random/${distribution}?${query}`)
    .then(response => {
        if (!response.ok) {
            alert("サーバエラーが発生しました。しばらくお待ちいただき、後でもう一度お試しください。");
            return;
        }

        return response.json();
    })
    .then(data => {
        if (data.hasOwnProperty('rand_array')) {
            update_output(data.rand_array);     // 結果を出力
        }
        else if (data.hasOwnProperty('error_message')) {
            alert(data.error_message);
        }
    })
    .catch(error => {
        alert(`乱数生成APIにアクセスできません。\nしばらくお待ちいただき、後でもう一度お試しください。\n\n${error}`);
    });
}

// 一様分布
function uniform() {
    // パラメータの取得
    const trials              = document.getElementById('id_trials');
    const integer_mode        = document.getElementById('id_integer_mode');

    const range               = document.getElementsByName('range_uniform');

    const input_limit_min     = document.getElementById('id_input_min_uniform');
    const input_limit_max     = document.getElementById('id_input_max_uniform');

    const input_digit         = document.getElementById('id_input_digit_uniform');

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
        
        params["max"] = max_num;
        params["min"] = base_num;
    }

    // 乱数APIと送受信
    send_and_get("uniform", params);
}

// 正規分布
function normal() {
    // パラメータの取得
    const trials              = document.getElementById('id_trials');
    const integer_mode        = document.getElementById('id_integer_mode');

    const input_mu            = document.getElementById('id_input_mu');
    const input_sigma         = document.getElementById('id_input_sigma');

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
    const trials              = document.getElementById('id_trials');
    const integer_mode        = document.getElementById('id_integer_mode');

    const input_alpha         = document.getElementById('id_input_alpha');
    const input_beta          = document.getElementById('id_input_beta');

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
    const trials              = document.getElementById('id_trials');
    const integer_mode        = document.getElementById('id_integer_mode');

    const range               = document.getElementsByName('range_triangular');

    const input_limit_min     = document.getElementById('id_input_min_triangular');
    const input_limit_max     = document.getElementById('id_input_max_triangular');

    const input_digit         = document.getElementById('id_input_digit_triangular');

    const input_mode          = document.getElementById('id_input_mode');

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
        
        params["max"] = max_num;
        params["min"] = base_num;
    }

    params["mode"] = input_mode.value;

    // 乱数APIと送受信
    send_and_get("triangular", params);
}

// ラムダ分布
function lambda() {
    // パラメータの取得
    const trials              = document.getElementById('id_trials');
    const integer_mode        = document.getElementById('id_integer_mode');

    const input_lambda        = document.getElementById('id_input_lambda');

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

// ガンマ分布
function gamma() {
    // パラメータの取得
    const trials              = document.getElementById('id_trials');
    const integer_mode        = document.getElementById('id_integer_mode');

    const input_alpha         = document.getElementById('id_input_gamma_alpha');
    const input_beta          = document.getElementById('id_input_gamma_beta');

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
    send_and_get("gamma", params);
}

function OnMakeButtonClick() {
    const select_random = document.getElementById("id_select_random");
                            
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
    else if (select_random.value == "gamma") {
        gamma();
    }
}
