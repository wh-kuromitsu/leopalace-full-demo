// ===================================================================
// 法人規定マスタ
// - 各項目に「AIが自動的に検索条件へ反映可能か」のフラグ
// - 確信度（解釈精度）
// - 変更履歴・承認者
// ===================================================================

export const REGULATIONS = {
  "C-0001": {
    customerId: "C-0001",
    customerName: "サンプルA株式会社",
    documentName: "社宅規定_2025年度版.pdf",
    updatedAt: "2025/04/01",
    version: "v3.2",
    approvedBy: "サンプル 四郎（管理者）",
    aiInterpretationOverall: 0.91, // 全体の解釈確信度
    items: [
      { label: "家賃上限", value: "85,000円/月", aiInterpreted: true, confidence: 0.98, autoApply: true },
      { label: "敷金礼金", value: "会社負担可（上限2ヶ月）", aiInterpreted: true, confidence: 0.94, autoApply: true },
      { label: "築年数", value: "20年以内", aiInterpreted: true, confidence: 0.96, autoApply: true },
      { label: "面積下限", value: "20㎡以上", aiInterpreted: true, confidence: 0.97, autoApply: true },
      { label: "通勤時間", value: "勤務地から60分以内", aiInterpreted: true, confidence: 0.89, autoApply: true },
      { label: "備考", value: "ペット可物件は対象外", aiInterpreted: false, confidence: 0.62, autoApply: false, humanReviewNeeded: true },
    ],
    changeHistory: [
      { date: "2025/04/01", by: "サンプル 四郎", change: "v3.2 へ更新（家賃上限を 80,000 → 85,000 へ）" },
      { date: "2024/04/01", by: "サンプル 四郎", change: "v3.1 へ更新（築年数を 25年 → 20年 へ）" },
      { date: "2023/10/15", by: "サンプル 四郎", change: "v3.0 へ更新（規定書の全面改訂）" },
    ],
  },
  "C-0003": {
    customerId: "C-0003",
    customerName: "サンプルB建設株式会社",
    documentName: "現場社員寮基準_2025.pdf",
    updatedAt: "2025/10/15",
    version: "v2.1",
    approvedBy: "サンプル 四郎（管理者）",
    aiInterpretationOverall: 0.86,
    items: [
      { label: "家賃上限", value: "70,000円/月", aiInterpreted: true, confidence: 0.96, autoApply: true },
      { label: "敷金礼金", value: "個人負担", aiInterpreted: true, confidence: 0.92, autoApply: true },
      { label: "築年数", value: "制限なし", aiInterpreted: true, confidence: 0.95, autoApply: true },
      { label: "面積下限", value: "18㎡以上", aiInterpreted: true, confidence: 0.93, autoApply: true },
      { label: "備考", value: "複数名同時入居可の物件優先", aiInterpreted: false, confidence: 0.58, autoApply: false, humanReviewNeeded: true },
    ],
    changeHistory: [
      { date: "2025/10/15", by: "サンプル 四郎", change: "v2.1 へ更新（家賃上限を 65,000 → 70,000）" },
    ],
  },
  "C-0002": {
    customerId: "C-0002",
    customerName: "サンプルC商事株式会社",
    documentName: "海外駐在員向け短期社宅規程.pdf",
    updatedAt: "2025/12/20",
    version: "v1.4",
    approvedBy: "サンプル 四郎（管理者）",
    aiInterpretationOverall: 0.95,
    items: [
      { label: "家賃上限", value: "120,000円/月", aiInterpreted: true, confidence: 0.97, autoApply: true },
      { label: "敷金礼金", value: "会社全額負担", aiInterpreted: true, confidence: 0.96, autoApply: true },
      { label: "築年数", value: "10年以内", aiInterpreted: true, confidence: 0.95, autoApply: true },
      { label: "面積下限", value: "25㎡以上", aiInterpreted: true, confidence: 0.93, autoApply: true },
      { label: "駅徒歩", value: "5分以内", aiInterpreted: true, confidence: 0.94, autoApply: true },
    ],
    changeHistory: [
      { date: "2025/12/20", by: "サンプル 四郎", change: "v1.4 へ更新" },
    ],
  },
};
