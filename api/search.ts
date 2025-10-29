import { readFileSync, existsSync } from "fs";
import { join } from "path";
import type { VercelRequest, VercelResponse } from "@vercel/node";

// 1) 起動時にシードを読み込み
const DATA_PATH = join(process.cwd(), "data", "qa.jsonl");
let QA: { q: string; a: string; source?: string }[] = [];
try {
  if (existsSync(DATA_PATH)) {
    const raw = readFileSync(DATA_PATH, "utf8")
      .split("\n")
      .filter(Boolean)
      .map((line) => JSON.parse(line));
    QA = raw;
  } else {
    // ファイルが見つからない場合は空配列のまま（APIは404風の応答を返す）
    console.warn("qa.jsonl not found at:", DATA_PATH);
  }
} catch (e) {
  console.error("QA seed not found or invalid:", e);
  QA = [];
}

// 依存レスなレーベンシュタイン距離
function levenshtein(a: string, b: string): number {
  const s = a.toLowerCase();
  const t = b.toLowerCase();
  const n = s.length;
  const m = t.length;
  if (n === 0) return m;
  if (m === 0) return n;
  const dp = new Array(m + 1);
  for (let j = 0; j <= m; j++) dp[j] = j;
  for (let i = 1; i <= n; i++) {
    let prev = dp[0];
    dp[0] = i;
    for (let j = 1; j <= m; j++) {
      const temp = dp[j];
      dp[j] = Math.min(
        dp[j] + 1, // deletion
        dp[j - 1] + 1, // insertion
        prev + (s[i - 1] === t[j - 1] ? 0 : 1) // substitution
      );
      prev = temp;
    }
  }
  return dp[m];
}

function score(query: string, item: { q: string; a: string }) {
  const q = query.toLowerCase();
  const hay = (item.q + " " + item.a).toLowerCase();
  let s = 0;
  // ブースト（完全一致/部分一致）
  if (item.q === query) s += 20;
  if (hay.includes(q)) s += 8;
  // タイトル単語一致
  for (const token of q.split(/\s+/)) if (token && hay.includes(token)) s += 2;
  // 似てる質問（距離が小さいほど加点）
  const d = levenshtein(q, item.q.toLowerCase());
  s += Math.max(0, 10 - Math.min(10, d));
  return s;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
    if (req.method === "OPTIONS") return res.status(200).end();

    const query = (req.query.q as string) || (req.body && (req.body as any).q) || "";
    if (!query) return res.status(400).json({ error: "q is required" });

    if (!Array.isArray(QA) || QA.length === 0) {
      return res.status(200).json({
        answer: "データが未登録です。管理者にお問い合わせください。",
        source: "-",
        matches: []
      });
    }

    const ranked = QA.map((item) => ({ item, s: score(query, item) }))
      .sort((a, b) => b.s - a.s)
      .slice(0, 3)
      .map((r) => r.item);

    const top = ranked[0];
    const answer = top
      ? { answer: top.a, source: top.source || "-", matches: ranked }
      : { answer: "該当が見つかりませんでした。キーワードを変えて再検索してください。", source: "-", matches: [] };

    // 任意: 匿名ログ（失敗しても無視）
    try {
      const LOG_ENDPOINT = process.env.LOG_ENDPOINT;
      if (LOG_ENDPOINT)
        fetch(LOG_ENDPOINT, { method: "POST", body: JSON.stringify({ q: query, ts: Date.now() }) }).catch(() => {});
    } catch {}

    return res.status(200).json(answer);
  } catch (e: any) {
    console.error("/api/search error:", e?.stack || e);
    return res.status(500).json({ error: "internal_error", message: String(e?.message || e) });
  }
}

