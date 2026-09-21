# 文脈解析

文章を文単位に分け、各文が自然言語で指定された意味を表すか Jev に判定させます。結果は元の文章の UTF-16 オフセットで返し、画面上で選択・解除、コピー、削除できます。現段階の選択粒度は文単位です。

TypeSafe AI の API キーを環境変数 `TYPESAFE_API_KEY` に設定し、リポジトリ直下で `npm run dev:meaning-brush` を実行します。`http://localhost:4173/meaning-brush/` を開いてください。キーはサーバー側だけで読み込み、ブラウザーへ渡しません。

## GitHub Pages + Cloudflare Workers

Pages は画面だけを配信し、Worker が Jev へのリクエストを代理します。API キーは Worker の Secret にのみ置きます。ブラウザーには返しません。

1. Cloudflare アカウントで Wrangler にログインします。リポジトリ直下で `npx wrangler login` を実行します。Wrangler が未インストールなら `npm install -D wrangler` を先に実行します。
2. `npx wrangler secret put TYPESAFE_API_KEY --config meaning-brush/worker/wrangler.jsonc` を実行し、表示される入力欄に TypeSafe AI のキーを入力します。キーをソースファイルやコマンド引数に書きません。
3. `npx wrangler deploy --config meaning-brush/worker/wrangler.jsonc` を実行します。表示された `https://...workers.dev` の URL を控えます。
4. [`index.html`](./index.html) の `<meta name="meaning-brush-api-url">` の `content` に `https://...workers.dev/api/meaning-brush` を設定して GitHub Pages に公開します。空欄ならローカルの `/api/meaning-brush` を使います。

Worker は `https://yapps.yotiosoft.com` を許可 Origin として指定しています。公開サイトの Origin が違う場合は [`wrangler.jsonc`](./worker/wrangler.jsonc) の `ALLOWED_ORIGIN` を変更してください。API は 1 分に最大 30 リクエスト、文章 1 万文字・80 文までです。レート制限は Cloudflare の拠点ごとの緩い制限で、厳密な料金上限ではありません。CORS と Origin 判定もブラウザーの誤用防止であり、サーバー間からの悪用を認証で防ぐものではありません。公開利用を広げる際は Cloudflare 側の利用状況と TypeSafe 側の費用を監視してください。

ローカルの Worker 検証では `meaning-brush/worker/.dev.vars` に `TYPESAFE_API_KEY=...` を置き、`npx wrangler dev --config meaning-brush/worker/wrangler.jsonc` を実行します。このファイルは Git から除外しています。通常の画面込みローカル検証には上記の Node サーバーを使えます。

TypeSafe API: https://docs.typesafe.ai/introduction/quickstart

Cloudflare Secret: https://developers.cloudflare.com/workers/configuration/secrets/
