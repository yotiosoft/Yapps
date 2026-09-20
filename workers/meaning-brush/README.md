# 意味ブラシの Jev API（Cloudflare Workers）

GitHub Pages に API キーは置けません。この Worker は `TYPESAFE_API_KEY` を Cloudflare Secret として読み、Jev に問い合わせ、選択範囲だけを返します。画面から送った文章と意味の指定は TypeSafe AI に渡ります。

このリポジトリの GitHub Pages は Jekyll の `_config.yml` で `workers/` を公開対象から除外します。Worker コードは同じリポジトリにコミットできます。Pages の設定を `.nojekyll` または独自の Actions デプロイに変えた場合は、その公開物の作成工程でも `workers/` を除外してください。

## 配置

リポジトリ直下から実行します。Cloudflare のアカウントと TypeSafe AI のキーが必要です。

1. `npm install -D wrangler`（未導入の場合）
2. `npx wrangler login`
3. `npx wrangler secret put TYPESAFE_API_KEY --config workers/meaning-brush/wrangler.jsonc`。対話入力でキーを登録します。ソースやコマンド引数にキーを書かないでください。
4. `npx wrangler deploy --config workers/meaning-brush/wrangler.jsonc`
5. デプロイ結果の `https://...workers.dev` に `/api/meaning-brush` を付け、意味ブラシ画面の `<meta name="meaning-brush-api-url" content="...">` に設定します。

公開サイトの Origin が `https://yapps.yotiosoft.com` 以外なら、`wrangler.jsonc` の `ALLOWED_ORIGIN` をその Origin に変更します。ブラウザーからは Worker に JSON `{"text":"...","meaning":"..."}` を POST します。

ローカルで Worker を動かす場合は `workers/meaning-brush/.dev.vars` に `TYPESAFE_API_KEY=...` を置き、`npx wrangler dev --config workers/meaning-brush/wrangler.jsonc` を実行します。このファイルは Git 管理から除外しています。

入力を 1 万文字・80 文に制限し、Worker のレート制限 binding を 1 分 30 回に設定しています。この制限は拠点ごとの緩い制限です。Origin/CORS は認証ではないので、公開後は TypeSafe の利用量を監視し、必要なら認証や Cloudflare 側の強い制限を追加してください。
