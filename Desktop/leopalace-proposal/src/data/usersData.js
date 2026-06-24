// ===================================================================
// 社内ユーザー / 認証 / セッション
// 「認証・セキュリティしっかり感」の中核データ
// ===================================================================

// 権限ロール定義（複数種類から選択可能）
export const ROLES = [
  {
    id: "general",
    name: "一般ユーザー",
    description: "案件の作成・提案資料の出力ができます",
    color: "slate",
  },
  {
    id: "sales_manager",
    name: "営業マネージャー",
    description: "一般ユーザーの権限に加え、部下案件の閲覧・承認ができます",
    color: "sky",
  },
  {
    id: "master_admin",
    name: "マスタ管理者",
    description: "顧客マスタ・物件マスタの編集ができます",
    color: "indigo",
  },
  {
    id: "system_admin",
    name: "システム管理者",
    description: "権限変更・全社レポート・テンプレート承認など、システム全体を管理できます",
    color: "purple",
  },
  {
    id: "auditor",
    name: "監査担当",
    description: "操作ログの閲覧のみ可能。データの編集はできません",
    color: "emerald",
  },
];

// Tailwind の動的クラス生成回避のため、ロールIDから完全クラス文字列を返すヘルパー
export const roleBadgeClass = (roleId) => {
  const map = {
    general: "bg-slate-100 text-slate-700",
    sales_manager: "bg-sky-100 text-sky-700",
    master_admin: "bg-indigo-100 text-indigo-700",
    system_admin: "bg-purple-100 text-purple-700",
    auditor: "bg-emerald-100 text-emerald-700",
  };
  return map[roleId] || map.general;
};


// 現在ログイン中ユーザー
export const CURRENT_USER = {
  id: "U-0042",
  name: "サンプル",
  nameRoman: "SAMPLE, Ichiro",
  email: "sample.ichiro@example.com",
  department: "法人営業部",
  office: "東京本社（六本木）",
  role: "一般ユーザー",
  permissions: ["case.read", "case.write", "customer.read", "property.read", "proposal.create"],
  avatar: "サンプル",
  // 認証セキュリティ情報
  sso: {
    provider: "Azure Active Directory",
    tenantName: "sample-tenant.onmicrosoft.com",
    objectId: "a3f9c8e1-2b4d-4e6f-8a1b-9c7d3e5f2a4b",
    upn: "sample.ichiro@example.com",
  },
  mfa: {
    enabled: true,
    method: "Microsoft Authenticator",
    lastVerified: "2026/05/13 09:00:33",
  },
  session: {
    startedAt: "2026/05/13 09:00:33",
    expiresAt: "2026/05/13 17:00:33",
    remainingMinutes: 263, // 13:42時点で残り
    ipAddress: "10.0.12.45",
    device: "Windows 11 / Edge 124",
    location: "東京都港区六本木（社内ネットワーク）",
  },
  lastLogin: {
    previous: "2026/05/12 09:00:14",
    fromIp: "10.0.12.45",
  },
};

// 他の登録ユーザー
export const USERS = [
  {
    id: "U-0042",
    name: "サンプル",
    department: "法人営業部",
    office: "東京本社",
    roleId: "general",
    role: "一般ユーザー",
    mfaEnabled: true,
    activeCases: 8,
    proposalsThisMonth: 24,
    online: true,
    lastActivity: "2分前",
  },
  {
    id: "U-0043",
    name: "サンプル 二郎",
    department: "法人営業部",
    office: "東京本社",
    roleId: "general",
    role: "一般ユーザー",
    mfaEnabled: true,
    activeCases: 5,
    proposalsThisMonth: 18,
    online: true,
    lastActivity: "12分前",
  },
  {
    id: "U-0044",
    name: "サンプル 三郎",
    department: "法人営業部",
    office: "大阪支社",
    roleId: "sales_manager",
    role: "営業マネージャー",
    mfaEnabled: true,
    activeCases: 6,
    proposalsThisMonth: 22,
    online: false,
    lastActivity: "昨日 18:42",
  },
  {
    id: "U-0001",
    name: "サンプル 四郎",
    department: "法人営業部",
    office: "東京本社",
    roleId: "system_admin",
    role: "システム管理者",
    mfaEnabled: true,
    activeCases: 2,
    proposalsThisMonth: 6,
    online: true,
    lastActivity: "30分前",
  },
  {
    id: "U-0021",
    name: "サンプル 五郎",
    department: "情報システム部",
    office: "東京本社",
    roleId: "master_admin",
    role: "マスタ管理者",
    mfaEnabled: true,
    activeCases: 0,
    proposalsThisMonth: 0,
    online: false,
    lastActivity: "本日 08:15",
  },
  {
    id: "U-0009",
    name: "サンプル 六郎",
    department: "内部監査室",
    office: "東京本社",
    roleId: "auditor",
    role: "監査担当",
    mfaEnabled: true,
    activeCases: 0,
    proposalsThisMonth: 0,
    online: true,
    lastActivity: "5分前",
  },
];

// 通知一覧（優先度・AI判定付き）
export const NOTIFICATIONS = [
  {
    id: 1,
    type: "case_received",
    title: "新規依頼を受信しました",
    body: "サンプルD物流様より社宅手配の依頼が届いています。",
    time: "5分前",
    unread: true,
    aiClassified: true,
    priorityByAi: "high",
    requiresAction: true,
  },
  {
    id: 2,
    type: "deadline",
    title: "対応期限が3日後に迫っています",
    body: "REQ-2026-0516-008（サンプルB建設様）の対応期限は2026/05/16です。",
    time: "30分前",
    unread: true,
    aiClassified: true,
    priorityByAi: "high",
    requiresAction: true,
  },
  {
    id: 3,
    type: "verification_needed",
    title: "AI抽出結果の確認をお願いします",
    body: "依頼書_サンプルC商事.pdf から抽出した「予算」項目について、担当者の確認をお願いします。",
    time: "1時間前",
    unread: true,
    aiClassified: true,
    priorityByAi: "medium",
    requiresAction: true,
  },
  {
    id: 4,
    type: "system",
    title: "物件マスタの同期が完了しました",
    body: "569,182件の物件データを最新化しました。差分：+842件 / 更新3,512件。",
    time: "本日 06:00",
    unread: true,
    aiClassified: false,
    priorityByAi: "low",
    requiresAction: false,
  },
  {
    id: 5,
    type: "case_completed",
    title: "成約のお知らせ",
    body: "サンプルE医療様の案件（REQ-2026-0513-031）が成約に至りました。",
    time: "昨日",
    unread: false,
    aiClassified: false,
    priorityByAi: "low",
    requiresAction: false,
  },
  {
    id: 6,
    type: "security",
    title: "セキュリティ：新しい場所からのログインを検出",
    body: "2026/05/12 23:15 / IPアドレス 203.0.113.42（東京都江東区）からのログインを記録しました。心当たりがない場合は管理者へご連絡ください。",
    time: "昨日 23:15",
    unread: false,
    aiClassified: true,
    priorityByAi: "high",
    requiresAction: false,
  },
];
