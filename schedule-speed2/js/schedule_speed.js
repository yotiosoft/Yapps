$(document).ready(function() {
    $("#calculate").click(function() {
        var stationName = $("#station-name").val();
        var distance = parseFloat($("#distance").val());
        var time = parseFloat($("#time").val());

        if (isNaN(distance) || isNaN(time)) {
            alert("距離と所要時間を入力してください。");
            return;
        }

        var speed = distance / (time / 60);
        var resultText = "表定速度: " + speed.toFixed(2) + " km/時";
        $("#result").text(resultText);

        var historyItem = "<li>";
        if (stationName) {
            historyItem += "駅名: " + stationName + ", ";
        }
        historyItem += "距離: " + distance + " km, 所要時間: " + time + " 分, 表定速度: " + speed.toFixed(2) + " km/時</li>";
        $("#history").append(historyItem);
    });
});
