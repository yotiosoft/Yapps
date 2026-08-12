(function () {
    'use strict';

    var ZERO_WIDTH_CHARACTERS = {
        '\u00ad': 'ソフトハイフン',
        '\u034f': '結合書記素接合子',
        '\u061c': 'アラビア文字マーク',
        '\u115f': 'ハングル初声フィラー',
        '\u1160': 'ハングル中声フィラー',
        '\u17b4': 'クメール母音固有文字 AQ',
        '\u17b5': 'クメール母音固有文字 AA',
        '\u180e': 'モンゴル語母音区切り',
        '\u200b': 'ゼロ幅スペース',
        '\u200c': 'ゼロ幅非接合子',
        '\u200d': 'ゼロ幅接合子',
        '\u200e': '左から右マーク',
        '\u200f': '右から左マーク',
        '\u202a': '左から右埋め込み',
        '\u202b': '右から左埋め込み',
        '\u202c': '方向書式終了',
        '\u202d': '左から右上書き',
        '\u202e': '右から左上書き',
        '\u2060': '単語結合子',
        '\u2061': '関数適用',
        '\u2062': '不可視の乗算記号',
        '\u2063': '不可視の区切り文字',
        '\u2064': '不可視の加算記号',
        '\u2066': '左から右分離',
        '\u2067': '右から左分離',
        '\u2068': '先頭強方向分離',
        '\u2069': '方向分離終了',
        '\u206a': '対称入れ替え禁止',
        '\u206b': '対称入れ替え有効',
        '\u206c': 'アラビア字形禁止',
        '\u206d': 'アラビア字形有効',
        '\u206e': '国別数字形',
        '\u206f': '名目数字形',
        '\ufeff': 'ゼロ幅ノーブレークスペース（BOM）',
        '\uffa0': '半角ハングルフィラー'
    };

    var input = document.getElementById('input-textarea');
    var summary = document.getElementById('result-summary');
    var list = document.getElementById('result-list');
    var tableWrap = document.getElementById('result-table-wrap');
    var emptyResult = document.getElementById('empty-result');
    var copyButton = document.getElementById('remove-and-copy');
    var copyStatus = document.getElementById('copy-status');

    function codePointLabel(character) {
        return 'U+' + character.codePointAt(0).toString(16).toUpperCase().padStart(4, '0');
    }

    function findCharacters(text) {
        var found = [];
        var line = 1;
        var column = 1;
        var position = 1;

        for (var character of text) {
            if (Object.prototype.hasOwnProperty.call(ZERO_WIDTH_CHARACTERS, character)) {
                found.push({
                    position: position,
                    line: line,
                    column: column,
                    name: ZERO_WIDTH_CHARACTERS[character],
                    code: codePointLabel(character)
                });
            }

            if (character === '\n') {
                line += 1;
                column = 1;
            } else {
                column += 1;
            }
            position += 1;
        }

        return found;
    }

    function removeCharacters(text) {
        return Array.from(text).filter(function (character) {
            return !Object.prototype.hasOwnProperty.call(ZERO_WIDTH_CHARACTERS, character);
        }).join('');
    }

    function addCell(row, value, className) {
        var cell = document.createElement('td');
        if (className) {
            var span = document.createElement('span');
            span.className = className;
            span.textContent = value;
            cell.appendChild(span);
        } else {
            cell.textContent = value;
        }
        row.appendChild(cell);
    }

    function render() {
        var text = input.value;
        var found = findCharacters(text);

        list.textContent = '';
        copyStatus.textContent = '';
        copyStatus.className = 'copy-status';
        copyButton.disabled = found.length === 0;

        if (!text) {
            summary.textContent = 'テキストを入力すると自動で検出します。';
            emptyResult.textContent = '検出結果はここに表示されます。';
            emptyResult.className = 'empty-result';
            emptyResult.hidden = false;
            tableWrap.hidden = true;
            return;
        }

        if (found.length === 0) {
            summary.textContent = '特殊文字は見つかりませんでした。';
            emptyResult.textContent = '✓ ゼロ幅の特殊文字は含まれていません。';
            emptyResult.className = 'empty-result clean';
            emptyResult.hidden = false;
            tableWrap.hidden = true;
            return;
        }

        summary.textContent = found.length + '個の特殊文字が見つかりました。';
        emptyResult.hidden = true;
        tableWrap.hidden = false;

        found.forEach(function (item) {
            var row = document.createElement('tr');
            addCell(row, item.position + '文字目');
            addCell(row, item.line + '行 ' + item.column + '列');
            addCell(row, item.name);
            addCell(row, item.code, 'unicode-code');
            list.appendChild(row);
        });
    }

    function fallbackCopy(text) {
        var temporary = document.createElement('textarea');
        temporary.value = text;
        temporary.setAttribute('readonly', '');
        temporary.style.position = 'fixed';
        temporary.style.opacity = '0';
        document.body.appendChild(temporary);
        temporary.select();
        var copied = document.execCommand('copy');
        document.body.removeChild(temporary);
        return copied ? Promise.resolve() : Promise.reject(new Error('copy failed'));
    }

    input.addEventListener('input', render);
    copyButton.addEventListener('click', function () {
        var cleanedText = removeCharacters(input.value);
        var copy = navigator.clipboard && window.isSecureContext
            ? navigator.clipboard.writeText(cleanedText)
            : fallbackCopy(cleanedText);

        copy.then(function () {
            copyStatus.textContent = '特殊文字を除去したテキストをコピーしました。';
            copyStatus.className = 'copy-status';
        }).catch(function () {
            copyStatus.textContent = 'コピーできませんでした。ブラウザの権限設定をご確認ください。';
            copyStatus.className = 'copy-status error';
        });
    });
}());
