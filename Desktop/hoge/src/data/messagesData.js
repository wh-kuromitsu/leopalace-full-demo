// ===================================================================
// メッセージ受信（メール / LINE / Instagram）集約モックデータ
// 個人差出人は氏名・連絡先を保持せず、リードID＋マスク表示。
// 法人は法人名＋部署。重要度（priorityRank）で上から表示。
// ===================================================================

// カテゴリ定義（rank が小さいほど重要・上位表示）
export const MSG_CATEGORIES = {
  complaint:   { label: "入居者クレーム", rank: 1, color: "bg-rose-100 text-rose-700 border-rose-300", accent: "#e11d48" },
  intent:      { label: "契約意向",       rank: 2, color: "bg-emerald-100 text-emerald-700 border-emerald-300", accent: "#059669" },
  newneed:     { label: "新規のニーズ",   rank: 3, color: "bg-brand-light text-brand-dark border-brand/30", accent: "#003087" },
  delayed:     { label: "返信遅延",       rank: 4, color: "bg-amber-100 text-amber-700 border-amber-300", accent: "#d97706" },
  no_reaction: { label: "提案後 無反応(2日)", rank: 5, color: "bg-violet-100 text-violet-700 border-violet-300", accent: "#7c3aed" },
  normal:      { label: "通常問い合わせ", rank: 6, color: "bg-slate-100 text-slate-600 border-slate-300", accent: "#64748b" },
};

export const MESSAGES = [
  {
    id: "MSG-2001", channel: "line", category: "complaint",
    senderType: "individual", sender: "入居者リード LEAD-2207（マスク）", customerKind: "既存",
    snippet: "エアコンが効きません。今日から暑くて眠れず困っています。至急対応をお願いします。",
    reason: "入居中の設備不具合の訴え。生活影響が大きく最優先対応。",
    receivedAt: "2026/05/25 08:12", ageHours: 1, status: "未対応",
  },
  {
    id: "MSG-2002", channel: "mail", category: "intent",
    senderType: "corp", sender: "サンプルB建設株式会社（管理本部）", customerKind: "既存",
    snippet: "先日ご提案いただいた中台2の件、社内決裁が下りました。契約手続きを進めたいです。",
    reason: "成約直結の契約意向。機会損失を防ぐため即時対応。",
    receivedAt: "2026/05/25 07:40", ageHours: 1, status: "未対応",
  },
  {
    id: "MSG-2003", channel: "insta", category: "newneed",
    senderType: "individual", sender: "見込客 LEAD-2310（マスク）", customerKind: "新規",
    snippet: "板橋区で1Kの家具家電付きを探しています。4月から一人暮らし予定です。予算7万円以内。",
    reason: "新規の具体的ニーズ。初動の速さが成約率に直結。",
    receivedAt: "2026/05/25 06:55", ageHours: 2, status: "未対応",
  },
  {
    id: "MSG-2004", channel: "mail", category: "intent",
    senderType: "corp", sender: "サンプルA株式会社（総務部）", customerKind: "既存",
    snippet: "新卒社宅の件、追加で2名分の申込を進めたく。書類の送付先を教えてください。",
    reason: "追加契約の意向。既存案件の拡大機会。",
    receivedAt: "2026/05/24 18:20", ageHours: 14, status: "対応中",
  },
  {
    id: "MSG-2005", channel: "line", category: "newneed",
    senderType: "individual", sender: "見込客 LEAD-2288（マスク）", customerKind: "新規",
    snippet: "ときわ台駅周辺で短期（3ヶ月）で借りられる物件はありますか？マンスリー希望です。",
    reason: "新規ニーズ（マンスリー）。レオパレス強みと合致し転換見込み高。",
    receivedAt: "2026/05/24 16:05", ageHours: 16, status: "未対応",
  },
  {
    id: "MSG-2006", channel: "mail", category: "delayed",
    senderType: "corp", sender: "サンプルC物流株式会社（人事部）", customerKind: "既存",
    snippet: "先週お送りした条件の件、その後いかがでしょうか。回答をお待ちしています。",
    reason: "通常問い合わせだが当社からの返信が遅延（SLA超過）。信頼維持のため要対応。",
    receivedAt: "2026/05/23 10:30", ageHours: 46, status: "未対応",
  },
  {
    id: "MSG-2007", channel: "mail", category: "no_reaction",
    senderType: "corp", sender: "サンプルD株式会社（総務課）", customerKind: "既存",
    snippet: "（提案資料の共有URLを送付済み。開封3回・お気に入り2件登録あり／返信なし）",
    reason: "提案を3回開封・お気に入り登録あるが2日反応なし。フォロー架電・追客推奨。",
    receivedAt: "2026/05/23 09:00", ageHours: 47, status: "未対応", opened: 3, favorited: 2,
  },
  {
    id: "MSG-2008", channel: "insta", category: "normal",
    senderType: "individual", sender: "見込客 LEAD-2295（マスク）", customerKind: "新規",
    snippet: "レオネットって速度どのくらいですか？在宅勤務でも大丈夫でしょうか。",
    reason: "通常問い合わせ。回答テンプレで対応可。",
    receivedAt: "2026/05/24 21:10", ageHours: 11, status: "未対応",
  },
  {
    id: "MSG-2009", channel: "line", category: "no_reaction",
    senderType: "individual", sender: "見込客 LEAD-2271（マスク）", customerKind: "新規",
    snippet: "（高島平の物件リンクを送付済み。開封2回／2日間 既読のみで返信なし）",
    reason: "提案リンクを既読だが2日反応なし。チャットで軽い後押しを推奨。",
    receivedAt: "2026/05/23 12:40", ageHours: 43, status: "未対応", opened: 2, favorited: 0,
  },
];
