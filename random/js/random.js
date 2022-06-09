function norm_random() {
    var num = 0, i;
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
    let num_output = document.getElementById('id_output');
    let random_num = make_number();
    
    num_output.value = random_num;
}
