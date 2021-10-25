// ブラウザがサポートしているかチェック
if (!"speechSynthesis" in window) {
    alert('申し訳ございません。お使いのブラウザは音声読み上げに対応しておりません。');
}

function LoadVoices() {
    let voices = speechSynthesis.getVoices();
    $('#voice-names').empty();

    voices.forEach(function(voice, i) {
        const $option = $("<option>");
        $option.val(voice.name);
        $option.text(voice.name + " (" + voice.lang + ")");
        $option.prop("selected", voice.name == "Kyoko");

        $("#voice-names").append($option);
    });
}

// 音声を読み込み
LoadVoices();

// 選択が変更された場合、再読み込み
window.speechSynthesis.onvoiceschanged = function(e) {
    LoadVoices();
};

var stop = false;
const uttr = new SpeechSynthesisUtterance();

function OnSpeakButtonClick() {
    if (!speechSynthesis.empty) {
        speechSynthesis.cancel();
    }
    stop = false;
    stop_button_text.textContent = "一時停止"

    uttr.text = document.getElementById("input-textarea").value;
    uttr.rate = parseFloat($("#rate").val());

    if ($("#voice-names").val()) {
        uttr.voice = speechSynthesis.getVoices().filter(voice => voice.name == $("#voice-names").val())[0];
    }
    speechSynthesis.speak(uttr);
    uttr.onend = function() {

    }
}

var stop_button_text = document.getElementById("stop-button-text")
function OnStopButtonClick() {
    if (speechSynthesis.empty) {
        return;
    }
    
    if (!stop) {
        stop = true;
        stop_button_text.textContent = "再開"
        speechSynthesis.pause();
    }
    else {
        if (uttr.text != document.getElementById("input-textarea").value) {
            OnSpeakButtonClick();
        }

        stop = false;
        stop_button_text.textContent = "一時停止"
        speechSynthesis.resume();
    }
}
