export const categories = [
    '国内株', 'アメリカ株', '全世界株', '欧州株', '中国株', '台湾株', '韓国株',
    '東南アジア株', 'インド株', '先進国株', '新興国株',
    '債券', '国内債券', '先進国債券', '新興国債券',
    'REIT', '国内REIT', '海外REIT', '金', 'その他コモディティ',
    'バランス（固定配分）', 'バランス（可変配分）', '現金・預金', 'その他',
];
export function migratePlan(plan) {
    if (!plan || !Array.isArray(plan.products)) return plan;
    return { ...plan, products: plan.products.map(p => p && p.category === '日本株' ? { ...p, category: '国内株' } : p) };
}
export function validPlan(plan) {
    return plan && Number.isInteger(plan.years) && plan.years >= 1 && plan.years <= 60 &&
        Array.isArray(plan.products) && plan.products.length >= 1 && plan.products.length <= 30 &&
        plan.products.every(p => p && typeof p.name === 'string' && p.name.length <= 80 && categories.includes(p.category) &&
            ['initial', 'monthly'].every(k => Number.isFinite(p[k]) && p[k] >= 0 && p[k] <= 1e9 && Number.isInteger(p[k])) &&
            Number.isFinite(p.rate) && p.rate >= -100 && p.rate <= 100);
}
export function simulate(plan) {
    if (!validPlan(plan)) throw new RangeError('入力値が範囲外です。');
    const balances = plan.products.map(p => p.initial);
    const factors = plan.products.map(p => Math.pow(1 + p.rate / 100, 1 / 12));
    let principal = balances.reduce((a, b) => a + b, 0);
    const monthly = plan.products.reduce((sum, p) => sum + p.monthly, 0);
    const rows = [];
    for (let month = 0; month <= plan.years * 12; month++) {
        if (month) {
            plan.products.forEach((p, i) => { balances[i] = balances[i] * factors[i] + p.monthly; });
            principal += monthly;
        }
        if (month % 12 === 0) rows.push({ year: month / 12, balances: [...balances], principal, total: balances.reduce((a, b) => a + b, 0) });
    }
    return { rows, monthly, final: rows.at(-1) };
}
