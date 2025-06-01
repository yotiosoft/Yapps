// 計算履歴を保存する配列
let calculationHistory = [];

// 表定速度を計算する関数
function calculateSpeed() {
    const startStation = document.getElementById('start-station').value.trim();
    const endStation = document.getElementById('end-station').value.trim();
    const stationName = (startStation && endStation) ? `${startStation}〜${endStation}` : (startStation || endStation || '');
    const distance = parseFloat(document.getElementById('distance').value);
    const time_minutes = parseFloat(document.getElementById('time-minutes').value);
    const time = parseFloat(document.getElementById('time-hours').value) * 60 + time_minutes;
    const remarks = document.getElementById('remarks').value.trim();

    // 入力値の検証
    if (isNaN(distance) || distance <= 0) {
        alert('距離を正しく入力してください（0より大きい数値）');
        return;
    }

    if (isNaN(time_minutes) || time_minutes < 0 || time_minutes >= 60) {
        alert('所要時間の分を正しく入力してください（0以上59以下の数値）');
        return;
    }

    if (isNaN(time) || time <= 0) {
        alert('所要時間を正しく入力してください（0より大きい数値）');
        return;
    }

    // 表定速度を計算（距離 ÷ (時間/60)）
    const speed = distance / (time / 60);

    // 結果を表示
    displayResult(stationName, remarks, distance, time, speed);

    // 履歴に追加
    addToHistory(stationName, remarks, distance, time, speed);
}

// 計算結果を表示する関数
function displayResult(stationName, remarks, distance, time, speed) {
    const resultDiv = document.getElementById('result-display');
    const resultContent = document.getElementById('result-content');

    let stationInfo = stationName ? `<p><strong>区間：</strong>${stationName}</p>` : '';
    let remarksInfo = remarks ? `<p><strong>備考：</strong>${remarks}</p>` : '';

    let time_hours;
    if (time < 60) {
        time_hours = '';
    } else {
        time_hours = Math.floor(time / 60) + ' 時間 ';
    }
    let time_minutes = time % 60;

    resultContent.innerHTML = `
        ${stationInfo}
        ${remarksInfo}
        <p><strong>距離：</strong>${distance} km</p>
        <p><strong>所要時間：</strong>${time_hours}${time_minutes} 分</p>
        <p><strong>表定速度：</strong><span style="font-size: 1.2em; color: #007bff; font-weight: bold;">${speed.toFixed(2)} km/h</span></p>
    `;

    resultDiv.style.display = 'block';
}

// 履歴に追加する関数
function addToHistory(stationName, remarks, distance, time, speed) {
    const timestamp = new Date().toLocaleString('ja-JP');
    const historyItem = {
        timestamp: timestamp,
        stationName: stationName,
        remarks: remarks,
        distance: distance,
        time: time,
        speed: speed
    };

    calculationHistory.unshift(historyItem); // 最新を先頭に追加
    updateHistoryDisplay();
}

// 履歴表示を更新する関数
function updateHistoryDisplay() {
    const historyList = document.getElementById('history-list');

    if (calculationHistory.length === 0) {
        historyList.innerHTML = '<p style="color: #666; text-align: center; padding: 20px;">まだ計算履歴がありません</p>';
        return;
    }

    let historyHTML = '';
    calculationHistory.forEach((item, index) => {
        let stationInfo = item.stationName ? `<strong>${item.stationName}</strong><br>` : '';
        let time_hours;
        if (item.time < 60) {
            time_hours = '';
        } else {
            time_hours = Math.floor(item.time / 60) + ' 時間 ';
        }
        let time_minutes = item.time % 60;
        historyHTML += `
            <div style="border: 1px solid #ddd; border-radius: 8px; padding: 15px; margin-bottom: 10px; background-color: #fff;">
                <div style="font-size: 0.9em; color: #666; margin-bottom: 5px;">${item.timestamp}</div>
                ${stationInfo}
                <div>備考: ${item.remarks || 'なし'}</div>
                <div>距離: ${item.distance} km　時間: ${time_hours}${time_minutes} 分</div>
                <div style="font-weight: bold; color: #007bff; font-size: 1.1em;">表定速度: ${item.speed.toFixed(2)} km/h</div>
            </div>
        `;
    });

    historyList.innerHTML = historyHTML;
}

// 履歴をクリアする関数
function clearHistory() {
    if (calculationHistory.length === 0) {
        alert('クリアする履歴がありません');
        return;
    }

    if (confirm('計算履歴をすべて削除しますか？')) {
        calculationHistory = [];
        updateHistoryDisplay();
    }
}

// Enterキーで計算実行
document.addEventListener('DOMContentLoaded', function() {
    const inputs = document.querySelectorAll('#distance, #time');
    inputs.forEach(input => {
        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                calculateSpeed();
            }
        });
    });
});
