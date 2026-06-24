// ===================================================================
// 社内表現 → 顧客向け表現 変換マッピング（モック）
// コアシステムの特記など「社内向け表現」を、顧客向けの分かりやすい
// 表現へ置換するための辞書。生成AIは不要で、単純置換で動作する。
//  - internal : 社内表現（原文に現れる語）
//  - customer : 顧客向け表現
//  - note     : 変換意図（なぜこう変えるか）
//  - confidence : 変換の確からしさ（低いものは要確認表示）
// 個人情報は変換対象に含めない。
// ===================================================================

export const EXPRESSION_MAP = [
  { internal: "現状渡し", customer: "設備は現状のままでのお引渡しとなります", note: "社内略語を顧客向けに補足", confidence: 0.98 },
  { internal: "再募集", customer: "ただいま空室・ご案内可能です", note: "ネガティブ語を避ける", confidence: 0.97 },
  { internal: "client都合キャンセル", customer: "前のご契約者様のご都合により解約", note: "社内表現を中立化", confidence: 0.9 },
  { internal: "AD", customer: "（表示しない：社内広告料情報）", note: "社内向け費用情報のため非表示", confidence: 0.99 },
  { internal: "BT", customer: "浴室", note: "略語展開", confidence: 0.99 },
  { internal: "オーナーチェンジ", customer: "オーナー変更に伴うご案内", note: "補足説明を付与", confidence: 0.95 },
  { internal: "原状回復済", customer: "クリーニング・補修済みのきれいなお部屋です", note: "前向き表現に", confidence: 0.96 },
  { internal: "告知事項あり", customer: "重要事項として別途ご説明いたします", note: "詳細は口頭/書面でとし誤解を防ぐ", confidence: 0.82 },
  { internal: "定借", customer: "定期借家契約（期間満了で終了）", note: "略語展開＋補足", confidence: 0.98 },
  { internal: "SK", customer: "敷金", note: "略語展開", confidence: 0.99 },
  { internal: "RK", customer: "礼金", note: "略語展開", confidence: 0.99 },
  { internal: "保証会社必須", customer: "家賃保証会社のご利用が必要です", note: "丁寧表現に", confidence: 0.98 },
  { internal: "ペット不可", customer: "ペットの飼育はご遠慮いただいております", note: "丁寧表現に", confidence: 0.97 },
  { internal: "即入", customer: "即日ご入居いただけます", note: "略語展開", confidence: 0.97 },
  { internal: "要審査", customer: "ご入居にあたり所定の審査がございます", note: "丁寧表現に", confidence: 0.96 },
  { internal: "値下げ可", customer: "（表示しない：社内交渉余地情報）", note: "社内向け交渉情報のため非表示", confidence: 0.99 },
  { internal: "近隣クレーム履歴あり", customer: "（表示しない：社内管理情報）", note: "顧客提示に不適切なため非表示", confidence: 0.85 },
  { internal: "管理委託", customer: "管理会社による建物管理を行っています", note: "補足説明", confidence: 0.94 },
  { internal: "更新料あり", customer: "契約更新時に更新料を申し受けます", note: "丁寧表現に", confidence: 0.97 },
  { internal: "敷引あり", customer: "退去時に敷引（敷金の一部充当）がございます", note: "補足説明", confidence: 0.83 },
];

// 原文テキストを走査し、マッチした置換の一覧を返す（単純置換モック）
export function convertExpressions(text = "") {
  if (!text) return { converted: "", matches: [] };
  let converted = text;
  const matches = [];
  EXPRESSION_MAP.forEach((m) => {
    if (converted.includes(m.internal)) {
      matches.push(m);
      converted = converted.split(m.internal).join(m.customer);
    }
  });
  return { converted, matches };
}
