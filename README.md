# ツクツク!!! マニュアル即答ボット - Vercelデプロイ

**作成**: 2025-10-29  
**目的**: Vercelで即デプロイ可能なボット

---

## 🚀 デプロイ手順

1. このリポジトリをVercelにImport
2. Deployを押す
3. Deploy完了後、自動で `https://tsuku2-bot.vercel.app` が生成される
4. このURLをコピー
5. ツクツクのフリーページに `<iframe src="https://tsuku2-bot.vercel.app/embed" ...>` を貼る

---

## 📝 使い方

### ローカル開発

```bash
npm install
npm run dev
```

### アクセス

- `/` - QR配布用トップ
- `/embed` - iframe用

---

## 💡 環境変数（任意）

- `LOG_ENDPOINT` - /api/search から匿名ログを転送する先
- `LOG_FORWARD_URL` - /api/log が受けた内容を転送する先

---

## 📊 Q&Aの追加

`data/qa.jsonl` に1行1件で追記  
反映は即時（サーバレス再起動のタイミングでロード）

---

**Created**: 2025-10-29  
**Status**: デプロイ準備完了✅

🔱💎✨ **Vercelで即デプロイ可能！** ✨💎🔱

