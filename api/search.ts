import { readFileSync } from "fs";
import { join } from "path";
import { distance as levenshtein } from "fast-levenshtein";
import type { VercelRequest, VercelResponse } from "@vercel/node";

// 1) 起動時にシードを読み込み
const DATA_PATH = join(process.cwd(), "data", "qa.jsonl");
let QA: { q: string; a: string; source?: string }[] = [];
try {
  const raw = readFileSync(DATA_PATH, "utf8")
    .split("\n")
    .filter(Boolean)
    .map((line) => JSON.parse(line));
  QA = raw;
} catch (e) {
  console.error("QA seed not found or invalid:", e);
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
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  if (req.method === "OPTIONS") return res.status(200).end();

  const query = (req.query.q as string) || (req.body && req.body.q) || "";
  if (!query) return res.status(400).json({ error: "q is required" });

  const ranked = QA.map((item) => ({ item, s: score(query, item) }))
    .sort((a, b) => b.s - a.s)
    .slice(0, 3)
    .map((r) => r.item);

  // 最上位を回答として返す（出典付き）
  const top = ranked[0];
  const answer = top
    ? { answer: top.a, source: top.source || "-", matches: ranked }
    : { answer: "該当が見つかりませんでした。キーワードを変えて再検索してください。", source: "-", matches: [] };

  // ついでに匿名ログ（任意）
  try {
    const LOG_ENDPOINT = process.env.LOG_ENDPOINT;
    if (LOG_ENDPOINT) fetch(LOG_ENDPOINT, { method: "POST", body: JSON.stringify({ q: query, ts: Date.now() }) });
  } catch {}

  return res.status(200).json(answer);
}

