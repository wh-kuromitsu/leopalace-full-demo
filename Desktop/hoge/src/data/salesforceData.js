// ===================================================================
// Salesforce 連携設定（v2予定 - 2027 Q1）
// 認証・セキュリティの詳細表現
// ===================================================================

export const SALESFORCE_STATUS = {
  connected: false,
  plannedGoLive: "2027 Q1",
  // エンドポイント
  endpoint: "https://leopalace21.my.salesforce.com",
  apiVersion: "v60.0",
  // 認証
  authMethod: "OAuth 2.0 + JWT Bearer Flow",
  ipAllowlist: ["10.0.0.0/8 (社内ネットワーク)", "203.0.113.0/24 (本社固定IP)"],
  certificateExpiry: "2027/03/31",
  // 暗号化
  encryptionAtRest: "AES-256（Salesforce Shield）",
  encryptionInTransit: "TLS 1.3",
  // 監査
  auditEnabled: true,
  auditTrail: "全API呼び出しを Azure Sentinel へ転送",
  // 状態
  lastTestConnection: "—",
  lastSyncAt: "—",
};

// 連携対象オブジェクトのマッピング案
export const SF_OBJECT_MAPPING = [
  {
    local: "顧客（customersData）",
    salesforce: "Account",
    fields: 12,
    direction: "双方向",
    status: "未連携",
    piiContains: true,
  },
  {
    local: "案件（casesData）",
    salesforce: "Opportunity",
    fields: 18,
    direction: "ローカル → SF",
    status: "未連携",
    piiContains: false,
  },
  {
    local: "提案物件（candidatesData）",
    salesforce: "Custom: Proposed_Property__c",
    fields: 24,
    direction: "ローカル → SF",
    status: "未連携",
    piiContains: false,
  },
  {
    local: "活動履歴",
    salesforce: "Task / Event",
    fields: 8,
    direction: "ローカル → SF",
    status: "未連携",
    piiContains: false,
  },
];

// 同期履歴（モック）
export const SYNC_HISTORY = [
  { time: "—", type: "テスト接続", status: "未実施", count: 0, executedBy: "—" },
];

// セキュリティ要件チェックリスト
export const SECURITY_CHECKLIST = [
  { item: "OAuth 2.0 + JWT 認証", status: "design_complete", note: "認証フロー設計済み" },
  { item: "IP 制限の適用", status: "design_complete", note: "社内ネットワーク + 本社固定IP" },
  { item: "Salesforce Shield（保管時暗号化）", status: "pending", note: "ライセンス購入予定（2026 Q4）" },
  { item: "MFA 必須化", status: "design_complete", note: "Azure AD 連携で実現" },
  { item: "監査ログ転送", status: "design_complete", note: "Azure Sentinel へ統合" },
  { item: "個人情報マスキング", status: "design_complete", note: "Account の電話・メールは下4桁マスク" },
  { item: "脆弱性診断", status: "pending", note: "本稼働前に第三者監査を実施" },
];
