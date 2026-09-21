# 乱数生成 API（Cloudflare Workers）

ブラウザーはこの Worker の `/api/random/{distribution}` だけに GET します。主系・代替系の URL や応答ヘッダー、エラー本文はブラウザーへ返しません。`workers/` は既存の `_config.yml` により GitHub Pages の公開対象外です。公開リポジトリのソース自体を秘密にする仕組みではありません。

## 配置

リポジトリ直下で実行します。

```sh
npm install
npx wrangler login
npx wrangler deploy --config workers/random/wrangler.jsonc
```

デプロイ先が `https://yapps-random-api.ytani0323.workers.dev` と異なる場合、`random/index.html` の `random-api-url` を、実際の URL に `/api/random` を付けた値へ変更してください。Worker を先にデプロイしてからフロントエンドを公開します。

## 制限と接続切り替え

- Origin が `https://yapps.yotiosoft.com` と完全一致するリクエストのみ許可します。Origin がないリクエストも拒否します。
- `meaning-brush` と同様、固定キーで全利用者共通の毎分30回制限を適用し、超過時は HTTP 429 と `Retry-After: 60` を返します。namespace ID は独立した `31702` です。
- [Cloudflare の Rate Limiting binding](https://developers.cloudflare.com/workers/runtime-apis/bindings/rate-limit/) は拠点ごとの緩い制限で、全世界合計の厳密な上限ではありません。Origin/CORS は認証ではなく、非ブラウザークライアントによる Origin 偽装は防げません。既存の上流 API への直接アクセスを禁止するには、上流側にも認証・アクセス制御が必要です。
- 6種類の既存分布だけを受け付け、試行回数は1〜10000回、余分なパラメータや不正な数値を拒否します。接続先はリクエストで変更できません。
- 主系 `https://r.yotio.jp/yapps-random` を3秒でタイムアウトさせ、接続失敗・HTTPエラー・不正なJSON/結果の場合は `https://yapps-random-api.onrender.com` に切り替えます。代替系は起動待ちを考慮して30秒です。タイムアウトには本文の読み取りも含みます。
- フォールバックは1回の受付内で行うため追加の制限枠を消費しません。両方失敗すると接続先情報を含まない HTTP 502 を返します。リダイレクトは追跡しません。
- ページ読み込み時のウォームアップは廃止し、生成操作だけが制限枠を消費します。ブラウザーは最大40秒待機します。

## 検証

```sh
npm run test:random
npx wrangler deploy --dry-run --config workers/random/wrangler.jsonc
```

ローカル起動は `npx wrangler dev --config workers/random/wrangler.jsonc`。テストする場合も許可 Origin が必要です（例: `curl -H 'Origin: https://yapps.yotiosoft.com' 'http://localhost:8787/api/random/uniform?type=int&trials=5&min=0&max=100'`）。

`random/js/random.min.js` は `random.js` から esbuild で生成しています。
