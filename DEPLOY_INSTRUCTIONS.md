# 🚀 デプロイ手順（マニュアル）

## Step 1: GitHubリポジトリ作成

```
1. https://github.com/new にアクセス
2. リポジトリ名: tsuku2-bot
3. Public を選択
4. Create repository
```

## Step 2: ファイルをpush

```bash
cd C:\TriHexPhi\bots\tsuku2-bot

git init
git add .
git commit -m "Initial commit - Vercelデプロイ準備完了"

git branch -M main
git remote add origin https://github.com/your-username/tsuku2-bot.git
git push -u origin main
```

※ `your-username` をあなたのGitHubユーザー名に変更

## Step 3: VercelにDeploy

```
1. https://vercel.com/new にアクセス
2. 「Import Git Repository」を選択
3. tsuku2-bot リポジトリを選択
4. 「Deploy」をクリック
```

## Step 4: 完成！

```
自動で以下のURLが生成されます:
https://tsuku2-bot.vercel.app
```

## 🎁 QRコード生成

```
Google検索: "QRコード作成 オンライン"
→ URL: https://tsuku2-bot.vercel.app
→ QRコード生成
```

---

🔱💎✨ **これでプレゼント配布準備完了！** ✨💎🔱

