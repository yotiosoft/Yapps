import { test } from 'node:test';
import assert from 'node:assert/strict';
import { simulate, validPlan, migratePlan } from './calculation.js';
const product = (overrides = {}) => ({ name: 'テスト', category: '国内株', initial: 100000, monthly: 10000, rate: 0, ...overrides });
test('legacy category migrates without changing saved inputs or calculation', () => {
    const saved = { years: 20, products: [product({ category: '日本株', name: '保存した商品' }), product({ category: '金' })] };
    const migrated = migratePlan(saved);
    assert.equal(migrated.products[0].category, '国内株');
    assert.equal(migrated.products[0].name, '保存した商品');
    assert.equal(saved.products[0].category, '日本株');
    assert.ok(validPlan(migrated));
    assert.equal(simulate(migrated).final.total, 5000000);
    assert.equal(migratePlan(null), null);
});
test('zero interest and multiple products preserve principal', () => {
    const result = simulate({ years: 20, products: [product(), product()] });
    assert.equal(result.final.total, 5000000);
    assert.equal(result.final.total, result.final.principal);
    assert.equal(result.rows.length, 21);
});
test('effective annual rate and end-of-month contributions match closed form', () => {
    const result = simulate({ years: 10, products: [product({ rate: 5 })] });
    const factor = 1.05 ** (1 / 12);
    const expected = 100000 * 1.05 ** 10 + 10000 * (factor ** 120 - 1) / (factor - 1);
    assert.ok(Math.abs(result.final.total - expected) < 0.001);
});
test('negative rates, total loss and zero investment remain finite', () => {
    assert.equal(simulate({ years: 1, products: [product({ rate: -100 })] }).final.total, 10000);
    assert.ok(simulate({ years: 1, products: [product({ rate: -20 })] }).final.total < 220000);
    assert.equal(simulate({ years: 1, products: [product({ initial: 0, monthly: 0 })] }).final.total, 0);
});
test('invalid saved plans and unsupported input are rejected', () => {
    for (const value of [null, {}, {years: 0, products: [product()]}, {years: 1, products: []}, {years: 1, products: [product({rate: -101})]}, {years: 1, products: [product({monthly: -1})]}, {years: 1, products: [product({initial: Infinity})]}]) assert.ok(!validPlan(value));
});
