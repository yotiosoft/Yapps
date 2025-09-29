/**
 * ポイント計算アプリケーション
 */

let tierCounter = 0; // 段階設定のカウンタ

// ページ読み込み時の初期化
document.addEventListener('DOMContentLoaded', function() {
    loadHistory();
});

/**
 * 段階的還元率設定の表示/非表示を切り替える
 */
function toggleTierSettings() {
    const enableTier = document.getElementById('enable-tier');
    const tierSettings = document.getElementById('tier-settings');
    
    if (enableTier.checked) {
        tierSettings.style.display = 'block';
        // 初期段階を1つ追加
        if (document.getElementById('tier-list').children.length === 0) {
            addTierRule();
        }
    } else {
        tierSettings.style.display = 'none';
        // 段階設定をリセット
        document.getElementById('tier-list').innerHTML = '';
        tierCounter = 0;
    }
}

/**
 * 段階的還元率ルールを追加
 */
function addTierRule() {
    const tierList = document.getElementById('tier-list');
    const tierId = 'tier-' + (++tierCounter);
    
    const tierDiv = document.createElement('div');
    tierDiv.id = tierId;
    tierDiv.style.cssText = 'margin: 10px 0; padding: 15px; background-color: #fff; border: 1px solid #ccc; border-radius: 5px;';
    
    tierDiv.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
            <span>利用金額が</span>
            <input type="number" id="${tierId}-min" placeholder="最小金額" class="simple-inputtext" style="width: 100px;" step="1" min="0">
            <span>円以上</span>
            <input type="number" id="${tierId}-max" placeholder="最大金額" class="simple-inputtext" style="width: 100px;" step="1" min="0">
            <span>円以下の場合：還元率</span>
            <input type="number" id="${tierId}-rate" placeholder="還元率" class="simple-inputtext" style="width: 80px;" step="0.1" min="0">
            <span>%</span>
            <button onclick="removeTierRule('${tierId}')" style="background-color: #dc3545; color: white; border: none; padding: 5px 10px; border-radius: 3px; cursor: pointer;">削除</button>
        </div>
    `;
    
    tierList.appendChild(tierDiv);
}

/**
 * 段階的還元率ルールを削除
 */
function removeTierRule(tierId) {
    const tierElement = document.getElementById(tierId);
    if (tierElement) {
        tierElement.remove();
    }
}

/**
 * ポイントを計算
 */
function calculatePoints() {
    // 入力値を取得
    const serviceName = document.getElementById('service-name').value.trim();
    const usageAmount = parseFloat(document.getElementById('usage-amount').value) || 0;
    const usageCount = parseInt(document.getElementById('usage-count').value) || 1;
    const baseRate = parseFloat(document.getElementById('base-rate').value) || 0;
    const enableTier = document.getElementById('enable-tier').checked;
    
    // 必須項目のチェック
    if (!serviceName || usageAmount <= 0 || usageCount < 1 || baseRate < 0) {
        alert('サービス名、利用金額、利用回数、基本還元率を正しく入力してください。');
        return;
    }
    
    // 総利用金額を計算
    const totalAmount = usageAmount * usageCount;
    
    let calculatedPoints = 0;
    let usedRate = baseRate;
    let calculationDetails = [];
    
    if (enableTier) {
        // 段階的還元率の計算
        const tierRules = getTierRules();
        
        if (tierRules.length > 0) {
            // 段階的ルールを適用（総利用金額に対して計算）
            let remainingAmount = totalAmount;
            let currentAmount = 0;
            
            // ルールを最小金額でソート
            tierRules.sort((a, b) => a.min - b.min);
            
            for (let rule of tierRules) {
                if (remainingAmount <= 0) break;
                
                const ruleMin = (rule.min || 0) * usageCount;
                const ruleMax = (rule.max === Infinity || !rule.max) ? Infinity : rule.max * usageCount;
                
                if (currentAmount < ruleMax && totalAmount > ruleMin) {
                    const applicableMin = Math.max(currentAmount, ruleMin);
                    const applicableMax = Math.min(totalAmount, ruleMax);
                    const applicableAmount = applicableMax - applicableMin;
                    
                    if (applicableAmount > 0) {
                        const totalPoints = Math.floor(applicableAmount * rule.rate / 100);
                        calculatedPoints += totalPoints;
                        calculationDetails.push({
                            range: `${applicableMin.toLocaleString()}円 ～ ${applicableMax.toLocaleString()}円`,
                            amount: applicableAmount,
                            rate: rule.rate,
                            points: totalPoints,
                            count: usageCount
                        });
                        currentAmount = applicableMax;
                    }
                }
            }
            
            // 残りの金額は基本還元率を適用
            if (currentAmount < totalAmount) {
                const remainingAmount = totalAmount - currentAmount;
                const totalPoints = Math.floor(remainingAmount * baseRate / 100);
                if (totalPoints > 0) {
                    calculatedPoints += totalPoints;
                    calculationDetails.push({
                        range: `${currentAmount.toLocaleString()}円 ～ ${totalAmount.toLocaleString()}円`,
                        amount: remainingAmount,
                        rate: baseRate,
                        points: totalPoints,
                        count: usageCount
                    });
                }
            }
        } else {
            // 段階的ルールが設定されていない場合は基本還元率を使用
            calculatedPoints = Math.floor(totalAmount * baseRate / 100);
            calculationDetails.push({
                range: `全額`,
                amount: totalAmount,
                rate: baseRate,
                points: calculatedPoints,
                count: usageCount
            });
        }
    } else {
        // 基本還元率のみの計算（総利用金額に対して計算）
        calculatedPoints = Math.floor(totalAmount * baseRate / 100);
        calculationDetails.push({
            range: `全額`,
            amount: totalAmount,
            rate: baseRate,
            points: calculatedPoints,
            count: usageCount
        });
    }
    
    // 結果を表示
    displayResult(serviceName, usageAmount, usageCount, calculatedPoints, calculationDetails);
    
    // 履歴に保存
    saveToHistory({
        serviceName: serviceName,
        usageAmount: usageAmount,
        usageCount: usageCount,
        baseRate: baseRate,
        enableTier: enableTier,
        tierRules: enableTier ? getTierRules() : [],
        calculatedPoints: calculatedPoints,
        calculationDetails: calculationDetails,
        timestamp: new Date().toLocaleString('ja-JP')
    });
}

/**
 * 段階的還元率ルールを取得
 */
function getTierRules() {
    const tierList = document.getElementById('tier-list');
    const tierDivs = tierList.children;
    const rules = [];
    
    for (let div of tierDivs) {
        const tierId = div.id;
        const min = parseFloat(document.getElementById(`${tierId}-min`).value) || 0;
        const max = parseFloat(document.getElementById(`${tierId}-max`).value) || Infinity;
        const rate = parseFloat(document.getElementById(`${tierId}-rate`).value) || 0;
        
        if (rate > 0 && min <= max) {
            rules.push({
                min: min,
                max: max,
                rate: rate
            });
        }
    }
    
    return rules;
}

/**
 * 計算結果を表示
 */
function displayResult(serviceName, usageAmount, usageCount, points, details) {
    const resultDisplay = document.getElementById('result-display');
    const resultContent = document.getElementById('result-content');
    const totalAmount = usageAmount * usageCount;
    
    let detailsHtml = '';
    if (details.length > 1) {
        detailsHtml = '<h4>計算内訳：</h4><ul style="margin: 10px 0; padding-left: 20px;">';
        for (let detail of details) {
            detailsHtml += `<li>${detail.range}：${detail.amount.toLocaleString()}円 × ${detail.rate}% = ${detail.points}ポイント</li>`;
        }
        detailsHtml += '</ul>';
    } else if (usageCount > 1) {
        // 基本還元率のみで複数回利用の場合の説明
        detailsHtml = `<p style="font-size: 14px; color: #666; margin: 10px 0;">計算：${totalAmount.toLocaleString()}円 × ${details[0].rate}%</p>`;
    }
    
    resultContent.innerHTML = `
        <div style="font-size: 16px; line-height: 1.6;">
            <p><strong>サービス名：</strong>${serviceName}</p>
            <p><strong>利用金額：</strong>${usageAmount.toLocaleString()}円 ${usageCount > 1 ? `× ${usageCount}回 = ${totalAmount.toLocaleString()}円` : ''}</p>
            <p style="font-size: 20px; color: #007bff; font-weight: bold; margin: 15px 0;">
                <strong>獲得ポイント：${points.toLocaleString()}ポイント</strong>
            </p>
            ${detailsHtml}
        </div>
    `;
    
    resultDisplay.style.display = 'block';
    
    // 結果エリアまでスクロール
    resultDisplay.scrollIntoView({ behavior: 'smooth' });
}

/**
 * 履歴をLocalStorageに保存
 */
function saveToHistory(data) {
    let history = JSON.parse(localStorage.getItem('pointCalculatorHistory') || '[]');
    history.unshift(data); // 最新を先頭に追加
    
    // 履歴は最大50件まで保存
    if (history.length > 50) {
        history = history.slice(0, 50);
    }
    
    localStorage.setItem('pointCalculatorHistory', JSON.stringify(history));
    loadHistory();
}

/**
 * 履歴をLocalStorageから読み込み
 */
function loadHistory() {
    const historyList = document.getElementById('history-list');
    const history = JSON.parse(localStorage.getItem('pointCalculatorHistory') || '[]');
    
    if (history.length === 0) {
        historyList.innerHTML = '<p style="color: #666; text-align: center; padding: 20px;">まだ計算履歴がありません</p>';
        return;
    }
    
    let historyHtml = '';
    for (let i = 0; i < history.length; i++) {
        const item = history[i];
        let detailsHtml = '';
        
        if (item.calculationDetails && item.calculationDetails.length > 1) {
            detailsHtml = '<div style="font-size: 12px; color: #666; margin-top: 5px;">';
            for (let detail of item.calculationDetails) {
                detailsHtml += `${detail.range}: ${detail.points}pt, `;
            }
            detailsHtml = detailsHtml.slice(0, -2) + '</div>';
        }
        
        const usageCountText = (item.usageCount && item.usageCount > 1) ? ` × ${item.usageCount}回` : '';
        
        historyHtml += `
            <div class="history-item" style="margin: 10px 0; padding: 15px; background-color: #f8f9fa; border: 1px solid #dee2e6; border-radius: 5px;">
                <div style="display: flex; justify-content: between; align-items: start;">
                    <div style="flex: 1;">
                        <div style="font-weight: bold; margin-bottom: 5px;">${item.serviceName}</div>
                        <div style="font-size: 14px; color: #666;">
                            ${item.usageAmount.toLocaleString()}円${usageCountText} → <span style="color: #007bff; font-weight: bold;">${item.calculatedPoints.toLocaleString()}ポイント</span>
                        </div>
                        ${detailsHtml}
                        <div style="font-size: 12px; color: #999; margin-top: 5px;">${item.timestamp}</div>
                    </div>
                    <button onclick="deleteHistoryItem(${i})" style="background-color: #dc3545; color: white; border: none; padding: 5px 8px; border-radius: 3px; cursor: pointer; margin-left: 10px;">削除</button>
                </div>
            </div>
        `;
    }
    
    historyList.innerHTML = historyHtml;
}

/**
 * 履歴アイテムを削除
 */
function deleteHistoryItem(index) {
    let history = JSON.parse(localStorage.getItem('pointCalculatorHistory') || '[]');
    history.splice(index, 1);
    localStorage.setItem('pointCalculatorHistory', JSON.stringify(history));
    loadHistory();
}

/**
 * 履歴をクリア
 */
function clearHistory() {
    if (confirm('本当に履歴をすべて削除しますか？')) {
        localStorage.removeItem('pointCalculatorHistory');
        loadHistory();
    }
}

/**
 * 入力フィールドをリセット
 */
function resetForm() {
    document.getElementById('service-name').value = '';
    document.getElementById('usage-amount').value = '';
    document.getElementById('base-rate').value = '';
    document.getElementById('enable-tier').checked = false;
    document.getElementById('tier-settings').style.display = 'none';
    document.getElementById('tier-list').innerHTML = '';
    document.getElementById('result-display').style.display = 'none';
    tierCounter = 0;
}
