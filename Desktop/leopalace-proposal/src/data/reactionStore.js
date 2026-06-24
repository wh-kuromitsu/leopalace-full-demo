// ===================================================================
// 反響システム連携ストア（セッション内モック）
// 提案メール送信などで作成された案件レコードと進捗ステータスを保持。
// 個人情報は保持しない（案件ID・顧客名・物件・ステータスのみ）。
// ===================================================================

const STATUSES = ["新規反響登録", "提案中", "成約済み"];

let _records = [
  { id: "HK-2026-0512", caseId: "CASE-2026-0510-001", customerName: "サンプルA株式会社", status: "提案中", properties: 3, contractedProperty: null, updatedAt: "2026/05/20 14:30", note: "社宅3名分の提案を送付済み" },
  { id: "HK-2026-0498", caseId: "CASE-2026-0505-007", customerName: "サンプルB建設株式会社", status: "成約済み", properties: 5, contractedProperty: "レオパレスサンプル202", updatedAt: "2026/05/18 10:05", note: "現場寮5室で成約" },
  { id: "HK-2026-0470", caseId: "CASE-2026-0428-013", customerName: "サンプルC物流株式会社", status: "新規反響登録", properties: 0, contractedProperty: null, updatedAt: "2026/05/12 09:40", note: "受付直後・条件ヒアリング中" },
];
const _subs = new Set();
const notify = () => _subs.forEach((fn) => fn([..._records]));

export const REACTION_STATUSES = STATUSES;
export function getReactionRecords() { return [..._records]; }
export function subscribeReactions(fn) { _subs.add(fn); return () => _subs.delete(fn); }

export function addReactionRecord(rec) {
  const id = `HK-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9000) + 1000)}`;
  _records = [{ id, status: "提案中", contractedProperty: null, updatedAt: new Date().toLocaleString("ja-JP"), ...rec }, ..._records];
  notify();
  return id;
}

export function updateReactionStatus(id, status, contractedProperty) {
  _records = _records.map((r) => (r.id === id ? { ...r, status, contractedProperty: contractedProperty ?? r.contractedProperty, updatedAt: new Date().toLocaleString("ja-JP") } : r));
  notify();
}
