// ===================================================================
// 送付側 → 受取側に渡す「共有ペイロード」の簡易ストア（セッション内）
// ブラウザストレージは使わず、SPA セッション中のみ保持するモック。
// 個人情報は含めない（物件・条件・初期表示形式のみ）。
// ===================================================================

let _shared = null;
const _subs = new Set();

export function setSharedProposal(payload) {
  _shared = payload;
  _subs.forEach((fn) => fn(_shared));
}

export function getSharedProposal() {
  return _shared;
}

export function subscribeSharedProposal(fn) {
  _subs.add(fn);
  return () => _subs.delete(fn);
}
