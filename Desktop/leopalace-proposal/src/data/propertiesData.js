// ===================================================================
// 物件マスタ
// - aiAnalysis: 市場相場比較・空室予測・推薦理由
// - dataSource: データ源泉・最終同期時刻・暗号化方式
// ===================================================================

const BASE_PROPERTIES = [
  {
    id: "LP-13120-0001",
    name: "レオパレスサンプル101",
    address: "東京都江東区門前仲町2-8-3",
    station: "門前仲町駅",
    walkMin: 4,
    rent: 78000,
    fee: 4500,
    layout: "1K",
    size: 23.4,
    age: 8,
    floor: "3階/5階建",
    features: ["家具家電付", "オートロック", "宅配BOX", "Wi-Fi無料", "バストイレ別"],
    available: 4,
    lat: 35.672,
    lng: 139.796,
    recommend: true,
    matched: 92,
    internalNotes: "現状渡し。SK1ヶ月 RK0。即入可。保証会社必須。AD150%（社内）。",  // 社内向け特記（顧客にはS2変換後を提示）
    plan: "賃貸",  // 契約プラン（賃貸 / マンスリー）
    furnished: true,
    furnishings: ['ベッド', 'デスク・チェア', '冷蔵庫', '洗濯機', 'エアコン', 'TV', '電子レンジ', 'IHコンロ', 'カーテン'],  // 家具家電付き（物件により異なる）
    leonet: true,  // レオネット（インターネット/TV）対応
    parking: { available: false, fee: 0, availableFrom: "即時利用可" },  // コアシステム連携・駐車場（利用開始日含む）
    cleaningFee: 41800,  // 退去時 基本清掃料（間取り別。4年以上居住で無料／法人・マンスリーは対象外）
    kodawari: ['家具家電付き', 'インターネット無料(レオネット)', 'バス・トイレ別', 'オートロック', '2階以上', '敷金・礼金なし'],  // こだわり条件タグ
    ecoSystemUrl: "https://eco.leopalace21.internal/bukken/LP-13120-0001",  // エコシステム（社内管理ポータル）
    officialUrl: "https://www.leopalace21.com/properties/chintai/lp-13120-0001",  // 公式HP 物件詳細ページ
    online: true,  // オンライン相談・契約 可
    catchphrase: "ロフト付。室内天井も高くお部屋を広く使えます！",  // 担当者オススメの一言（item11）
    recommendLead: "インターネット使い放題・U-NEXT一般作品見放題プラン有",  // おすすめポイントのリード文
    deposit: 0,  // 敷金 不要（レオパレス）
    brokerage: 0,  // 仲介手数料 不要（レオパレス）
    equipment: { bath: ["浴室乾燥機", "温水洗浄便座", "室内洗濯機置き場"], security: ["防犯カメラ", "TVドアホン", "宅配ボックス", "スマートロック"], network: ["インターネット対応", "LEONET(Life Stick)"], other: ["給湯", "エアコン", "バルコニー", "駐輪場"] },  // 設備（カテゴリ別）
    aiAnalysis: {
      confidence: 0.94,
      recommendReason: "希望条件「駅近・家具家電付」と完全一致。過去5件で平均成約率92%。",
      marketComparison: "周辺相場 -3%（割安）",
      vacancyForecast: "6月末まで4部屋確保見込み",
      pastPerformance: { proposed: 28, contracted: 19, winRate: "68%" },
      lastAnalyzedAt: "2026/05/13 06:15",
    },
  },
  {
    id: "LP-13120-0002",
    name: "レオパレスサンプル102",
    address: "東京都江東区清澄2-15-7",
    station: "清澄白河駅",
    walkMin: 6,
    rent: 82000,
    fee: 5000,
    layout: "1K",
    size: 24.8,
    age: 5,
    floor: "2階/4階建",
    features: ["家具家電付", "オートロック", "宅配BOX", "防犯カメラ"],
    available: 2,
    lat: 35.682,
    lng: 139.795,
    recommend: true,
    matched: 88,
    internalNotes: "原状回復済。即入。要審査。更新料あり。値下げ可（社内）。",  // 社内向け特記（顧客にはS2変換後を提示）
    plan: "賃貸",  // 契約プラン（賃貸 / マンスリー）
    furnished: true,
    furnishings: ['ベッド', 'デスク・チェア', '冷蔵庫', '洗濯機', 'エアコン', 'TV', 'ガスコンロ', 'カーテン'],  // 家具家電付き（物件により異なる）
    leonet: true,  // レオネット（インターネット/TV）対応
    parking: { available: true, fee: 3300, availableFrom: "2026/06/01〜" },  // コアシステム連携・駐車場（利用開始日含む）
    cleaningFee: 41800,  // 退去時 基本清掃料（間取り別。4年以上居住で無料／法人・マンスリーは対象外）
    kodawari: ['家具家電付き', 'インターネット無料(レオネット)', 'バス・トイレ別'],  // こだわり条件タグ
    ecoSystemUrl: "https://eco.leopalace21.internal/bukken/LP-13120-0002",  // エコシステム（社内管理ポータル）
    officialUrl: "https://www.leopalace21.com/properties/chintai/lp-13120-0002",  // 公式HP 物件詳細ページ
    online: true,  // オンライン相談・契約 可
    catchphrase: "バルコニー付きだから外干ししたい方にオススメ！",  // 担当者オススメの一言（item11）
    recommendLead: "インターネット使い放題・U-NEXT一般作品見放題プラン有",  // おすすめポイントのリード文
    deposit: 0,  // 敷金 不要（レオパレス）
    brokerage: 0,  // 仲介手数料 不要（レオパレス）
    equipment: { bath: ["バス・トイレ別", "温水洗浄便座", "室内洗濯機置き場"], security: ["防犯カメラ", "TVモニタ付インターホン", "オートロック"], network: ["インターネット対応", "LEONET(Life Stick)"], other: ["給湯", "エアコン", "ロフト", "駐輪場"] },  // 設備（カテゴリ別）
    aiAnalysis: {
      confidence: 0.89,
      recommendReason: "築浅・防犯設備充実。製造業の新卒社員向け実績多数。",
      marketComparison: "周辺相場 +2%（適正）",
      vacancyForecast: "6/20頃に追加空き予定",
      pastPerformance: { proposed: 22, contracted: 14, winRate: "64%" },
      lastAnalyzedAt: "2026/05/13 06:15",
    },
  },
  {
    id: "LP-13120-0003",
    name: "レオパレスサンプル103",
    address: "東京都江東区豊洲4-3-11",
    station: "豊洲駅",
    walkMin: 9,
    rent: 84500,
    fee: 6000,
    layout: "1K",
    size: 25.1,
    age: 12,
    floor: "5階/8階建",
    features: ["家具家電付", "宅配BOX", "Wi-Fi無料", "エレベーター"],
    available: 1,
    lat: 35.654,
    lng: 139.795,
    recommend: false,
    matched: 84,
    internalNotes: "定借2年。ペット不可。BT別。告知事項あり。",  // 社内向け特記（顧客にはS2変換後を提示）
    plan: "賃貸",  // 契約プラン（賃貸 / マンスリー）
    furnished: true,
    furnishings: ['ベッド', '収納', '冷蔵庫', '洗濯機', 'エアコン', '電子レンジ', 'IHコンロ', 'カーテン'],  // 家具家電付き（物件により異なる）
    leonet: true,  // レオネット（インターネット/TV）対応
    parking: { available: true, fee: 3300, availableFrom: "2026/07/15〜" },  // コアシステム連携・駐車場（利用開始日含む）
    cleaningFee: 41800,  // 退去時 基本清掃料（間取り別。4年以上居住で無料／法人・マンスリーは対象外）
    kodawari: ['家具家電付き', 'インターネット無料(レオネット)', 'バス・トイレ別', 'オートロック'],  // こだわり条件タグ
    ecoSystemUrl: "https://eco.leopalace21.internal/bukken/LP-13120-0003",  // エコシステム（社内管理ポータル）
    officialUrl: "https://www.leopalace21.com/properties/chintai/lp-13120-0003",  // 公式HP 物件詳細ページ
    online: true,  // オンライン相談・契約 可
    catchphrase: "駅徒歩4分の好立地！通勤・通学がラクラクです。",  // 担当者オススメの一言（item11）
    recommendLead: "インターネット使い放題・U-NEXT一般作品見放題プラン有",  // おすすめポイントのリード文
    deposit: 0,  // 敷金 不要（レオパレス）
    brokerage: 0,  // 仲介手数料 不要（レオパレス）
    equipment: { bath: ["浴室乾燥機", "独立洗面台", "室内洗濯機置き場"], security: ["宅配ボックス", "TVドアホン", "スマートロック"], network: ["インターネット対応", "LEONET(Life Stick)"], other: ["給湯", "エアコン", "バルコニー", "バイク置場"] },  // 設備（カテゴリ別）
    aiAnalysis: {
      confidence: 0.78,
      recommendReason: "勤務地（豊洲）至近。ただし築年数が予算帯の中央値より古め。",
      marketComparison: "周辺相場 +1%（適正）",
      vacancyForecast: "残り1部屋のため早期確認推奨",
      pastPerformance: { proposed: 12, contracted: 7, winRate: "58%" },
      lastAnalyzedAt: "2026/05/13 06:15",
    },
  },
  {
    id: "LP-13120-0004",
    name: "レオパレスサンプル104",
    address: "東京都江東区東陽4-6-2",
    station: "東陽町駅",
    walkMin: 3,
    rent: 75000,
    fee: 4000,
    layout: "1K",
    size: 22.1,
    age: 15,
    floor: "1階/3階建",
    features: ["家具家電付", "バストイレ別", "TVモニター付インターホン"],
    available: 3,
    lat: 35.668,
    lng: 139.819,
    recommend: false,
    matched: 79,
    internalNotes: "再募集。オーナーチェンジ。管理委託。SK1 RK1。",  // 社内向け特記（顧客にはS2変換後を提示）
    plan: "マンスリー",  // 契約プラン（賃貸 / マンスリー）
    furnished: true,
    furnishings: ['ベッド', 'デスク・チェア', '冷蔵庫', '洗濯機', 'エアコン', 'TV', '電子レンジ', 'IHコンロ', 'カーテン'],  // 家具家電付き（物件により異なる）
    leonet: true,  // レオネット（インターネット/TV）対応
    parking: { available: false, fee: 0, availableFrom: "空き待ち" },  // コアシステム連携・駐車場（利用開始日含む）
    cleaningFee: 41800,  // 退去時 基本清掃料（間取り別。4年以上居住で無料／法人・マンスリーは対象外）
    kodawari: ['家具家電付き', 'インターネット無料(レオネット)', 'バス・トイレ別', '2階以上', 'マンスリー可'],  // こだわり条件タグ
    ecoSystemUrl: "https://eco.leopalace21.internal/bukken/LP-13120-0004",  // エコシステム（社内管理ポータル）
    officialUrl: "https://www.leopalace21.com/properties/chintai/lp-13120-0004",  // 公式HP 物件詳細ページ
    monthlyDaily: 1666,  // マンスリー日割り目安（水光熱費込）
    online: true,  // オンライン相談・契約 可
    catchphrase: "築浅・防犯設備充実で女性の単身赴任にも安心。",  // 担当者オススメの一言（item11）
    recommendLead: "インターネット使い放題・U-NEXT一般作品見放題プラン有",  // おすすめポイントのリード文
    deposit: 0,  // 敷金 不要（レオパレス）
    brokerage: 0,  // 仲介手数料 不要（レオパレス）
    equipment: { bath: ["浴室乾燥機", "温水洗浄便座", "室内洗濯機置き場"], security: ["防犯カメラ", "TVドアホン", "宅配ボックス", "スマートロック"], network: ["インターネット対応", "LEONET(Life Stick)"], other: ["給湯", "エアコン", "バルコニー", "駐輪場"] },  // 設備（カテゴリ別）
    aiAnalysis: {
      confidence: 0.71,
      recommendReason: "駅徒歩3分は強み。築年数の懸念あり要確認。",
      marketComparison: "周辺相場 -5%（割安）",
      vacancyForecast: "6月末まで3部屋",
      pastPerformance: { proposed: 18, contracted: 8, winRate: "44%" },
      lastAnalyzedAt: "2026/05/13 06:15",
    },
  },
  {
    id: "LP-13120-0005",
    name: "レオパレスサンプル105",
    address: "東京都江東区住吉1-22-4",
    station: "住吉駅",
    walkMin: 7,
    rent: 72000,
    fee: 4500,
    layout: "1K",
    size: 21.6,
    age: 18,
    floor: "2階/3階建",
    features: ["家具家電付", "Wi-Fi無料", "駐輪場"],
    available: 5,
    lat: 35.692,
    lng: 139.816,
    recommend: false,
    matched: 76,
    internalNotes: "現状渡し。敷引あり。要審査。近隣クレーム履歴あり（社内）。",  // 社内向け特記（顧客にはS2変換後を提示）
    plan: "賃貸",  // 契約プラン（賃貸 / マンスリー）
    furnished: true,
    furnishings: ['ベッド', 'デスク・チェア', '冷蔵庫', '洗濯機', 'エアコン', 'TV', 'ガスコンロ', 'カーテン'],  // 家具家電付き（物件により異なる）
    leonet: true,  // レオネット（インターネット/TV）対応
    parking: { available: true, fee: 3300, availableFrom: "即時利用可" },  // コアシステム連携・駐車場（利用開始日含む）
    cleaningFee: 41800,  // 退去時 基本清掃料（間取り別。4年以上居住で無料／法人・マンスリーは対象外）
    kodawari: ['家具家電付き', 'インターネット無料(レオネット)', 'バス・トイレ別', 'オートロック'],  // こだわり条件タグ
    ecoSystemUrl: "https://eco.leopalace21.internal/bukken/LP-13120-0005",  // エコシステム（社内管理ポータル）
    officialUrl: "https://www.leopalace21.com/properties/chintai/lp-13120-0005",  // 公式HP 物件詳細ページ
    online: true,  // オンライン相談・契約 可
    catchphrase: "スーパー徒歩2分・閑静な住宅街で生活利便◎。",  // 担当者オススメの一言（item11）
    recommendLead: "インターネット使い放題・U-NEXT一般作品見放題プラン有",  // おすすめポイントのリード文
    deposit: 0,  // 敷金 不要（レオパレス）
    brokerage: 0,  // 仲介手数料 不要（レオパレス）
    equipment: { bath: ["バス・トイレ別", "温水洗浄便座", "室内洗濯機置き場"], security: ["防犯カメラ", "TVモニタ付インターホン", "オートロック"], network: ["インターネット対応", "LEONET(Life Stick)"], other: ["給湯", "エアコン", "ロフト", "駐輪場"] },  // 設備（カテゴリ別）
    aiAnalysis: {
      confidence: 0.64,
      recommendReason: "予算下限。築18年のため、低予算ケース時のみ推奨。",
      marketComparison: "周辺相場 -7%（割安）",
      vacancyForecast: "6月末まで5部屋・余裕あり",
      pastPerformance: { proposed: 15, contracted: 5, winRate: "33%" },
      lastAnalyzedAt: "2026/05/13 06:15",
    },
  },
  {
    id: "LP-13120-0006",
    name: "レオパレスサンプル106",
    address: "東京都江東区森下3-12-8",
    station: "森下駅",
    walkMin: 5,
    rent: 79500,
    fee: 5500,
    layout: "1K",
    size: 23.9,
    age: 9,
    floor: "4階/4階建",
    features: ["家具家電付", "オートロック", "宅配BOX", "バストイレ別", "Wi-Fi無料"],
    available: 2,
    lat: 35.69,
    lng: 139.798,
    recommend: true,
    matched: 86,
    internalNotes: "現状渡し。SK1ヶ月 RK0。即入可。保証会社必須。AD150%（社内）。",  // 社内向け特記（顧客にはS2変換後を提示）
    plan: "賃貸",  // 契約プラン（賃貸 / マンスリー）
    furnished: true,
    furnishings: ['ベッド', '収納', '冷蔵庫', '洗濯機', 'エアコン', '電子レンジ', 'IHコンロ', 'カーテン'],  // 家具家電付き（物件により異なる）
    leonet: true,  // レオネット（インターネット/TV）対応
    parking: { available: true, fee: 3300, availableFrom: "2026/06/01〜" },  // コアシステム連携・駐車場（利用開始日含む）
    cleaningFee: 41800,  // 退去時 基本清掃料（間取り別。4年以上居住で無料／法人・マンスリーは対象外）
    kodawari: ['家具家電付き', 'インターネット無料(レオネット)', 'バス・トイレ別', '敷金・礼金なし'],  // こだわり条件タグ
    ecoSystemUrl: "https://eco.leopalace21.internal/bukken/LP-13120-0006",  // エコシステム（社内管理ポータル）
    officialUrl: "https://www.leopalace21.com/properties/chintai/lp-13120-0006",  // 公式HP 物件詳細ページ
    online: true,  // オンライン相談・契約 可
    catchphrase: "高速ICまで車5分。社用車での移動が多い方に。",  // 担当者オススメの一言（item11）
    recommendLead: "インターネット使い放題・U-NEXT一般作品見放題プラン有",  // おすすめポイントのリード文
    deposit: 0,  // 敷金 不要（レオパレス）
    brokerage: 0,  // 仲介手数料 不要（レオパレス）
    equipment: { bath: ["浴室乾燥機", "独立洗面台", "室内洗濯機置き場"], security: ["宅配ボックス", "TVドアホン", "スマートロック"], network: ["インターネット対応", "LEONET(Life Stick)"], other: ["給湯", "エアコン", "バルコニー", "バイク置場"] },  // 設備（カテゴリ別）
    aiAnalysis: {
      confidence: 0.87,
      recommendReason: "設備充実・築浅。同条件の過去案件で高い満足度。",
      marketComparison: "周辺相場 +1%（適正）",
      vacancyForecast: "6/15頃から空き予定",
      pastPerformance: { proposed: 19, contracted: 13, winRate: "68%" },
      lastAnalyzedAt: "2026/05/13 06:15",
    },
  },
];
// ── 検索結果のボリューム再現用：板橋区・東武東上線の物件を自動生成（モック） ──
function generateMoreProperties() {
  const towns = [
    { town: "四葉", station: "下赤塚", walk: 17, lat: 35.787, lng: 139.654 },
    { town: "中台", station: "上板橋", walk: 12, lat: 35.769, lng: 139.671 },
    { town: "常盤台", station: "ときわ台", walk: 6, lat: 35.774, lng: 139.685 },
    { town: "東新町", station: "上板橋", walk: 9, lat: 35.766, lng: 139.678 },
    { town: "南常盤台", station: "ときわ台", walk: 4, lat: 35.770, lng: 139.689 },
    { town: "向原", station: "小竹向原", walk: 8, lat: 35.756, lng: 139.683 },
    { town: "高島平", station: "高島平", walk: 11, lat: 35.793, lng: 139.667 },
    { town: "志村坂上", station: "志村坂上", walk: 7, lat: 35.787, lng: 139.690 },
    { town: "蓮根", station: "蓮根", walk: 10, lat: 35.792, lng: 139.681 },
  ];
  const layouts = ["1K", "1K", "1DK", "1R", "1LDK"];
  const catches = [
    "ロフト付。室内天井も高くお部屋を広く使えます！",
    "バルコニー付きだから外干ししたい方にオススメ！",
    "駅徒歩◯分の好立地！通勤・通学がラクラクです。",
    "スーパーまで徒歩2分・閑静な住宅街で生活利便◎。",
    "新築同様の築浅。防犯設備も充実で安心です。",
    "南向きで日当たり良好。お部屋が明るいと好評です。",
    "高速ICまで車5分。社用車での移動が多い方に。",
    "独立洗面台付き。朝の身支度がスムーズです。",
  ];
  const equipPool = {
    bath: [["浴室乾燥機","温水洗浄便座","室内洗濯機置き場"],["バス・トイレ別","温水洗浄便座","室内洗濯機置き場"],["浴室乾燥機","独立洗面台","室内洗濯機置き場"]],
    security: [["防犯カメラ","TVドアホン","宅配ボックス","スマートロック"],["防犯カメラ","モニター付インターホン","オートロック"],["宅配ボックス","TVドアホン","スマートロック"]],
    network: [["インターネット対応","LEONET(Life Stick)"]],
    other: [["給湯","エアコン","バルコニー","駐輪場"],["給湯","エアコン","ロフト","駐輪場"],["給湯","エアコン","バルコニー","バイク置場"]],
  };
  const out = [];
  for (let i = 0; i < 18; i++) {
    const t = towns[i % towns.length];
    const layout = layouts[i % layouts.length];
    const rent = 55000 + (i % 9) * 4000;
    const age = [2, 5, 8, 12, 18, 25, 32][i % 7];
    const plan = i % 5 === 4 ? "マンスリー" : "賃貸";
    const walk = Math.max(2, t.walk - (i % 5));
    const parkAv = i % 3 !== 0;
    const num = String(i + 7).padStart(4, "0");
    const id = `LP-13119-${num}`;
    const eq = {
      bath: equipPool.bath[i % 3], security: equipPool.security[i % 3],
      network: equipPool.network[0], other: equipPool.other[i % 3],
    };
    const kodawari = ["家具・家電付き", "インターネット対応", "敷金不要"];
    if (i % 2 === 0) kodawari.push("スマートロック");
    if (i % 3 === 0) kodawari.push("浴室乾燥機");
    if (age <= 8) kodawari.push("築浅");
    if (walk <= 5) kodawari.push("駅近");
    out.push({
      id, name: `レオパレスサンプル${201 + i}`,
      address: `東京都板橋区${t.town}${(i % 9) + 1}-${(i % 20) + 1}-${(i % 15) + 1}`,
      station: t.station, line: "東武東上線", walkMin: walk,
      rent, fee: 4000 + (i % 4) * 500, layout, size: 19 + (i % 10) * 1.3, age,
      floor: `${(i % 3) + 1}階/${(i % 3) + 3}階建`,
      features: ["家具・家電付き", "インターネット対応", "エアコン", "宅配ボックス"],
      available: (i % 4) + 1, lat: t.lat + (i % 5) * 0.002 - 0.004, lng: t.lng + (i % 5) * 0.002 - 0.004,
      recommend: i % 4 === 0, matched: 70 + (i % 25),
      internalNotes: ["現状渡し。SK0 RK0。即入可。", "原状回復済。即入。要審査。", "再募集。管理委託。", "定借2年。ペット不可。"][i % 4],
      online: true, catchphrase: catches[i % catches.length].replace("◯", String(walk)),
      recommendLead: "インターネット使い放題・U-NEXT一般作品見放題プラン有",
      deposit: 0, brokerage: 0, keyMoney: i % 3 === 0 ? rent : 0,
      plan, furnished: true,
      furnishings: ["ベッド","デスク・チェア","冷蔵庫","洗濯機","エアコン","TV","電子レンジ","カーテン"],
      leonet: true,
      parking: { available: parkAv, fee: parkAv ? 3300 : 0, availableFrom: ["即時利用可","2026/06/01〜","2026/07/15〜","空き待ち"][i % 4] },
      cleaningFee: { "1R": 38500, "1K": 41800, "1DK": 44000, "1LDK": 52800 }[layout] || 41800,
      kodawari, equipment: eq,
      ecoSystemUrl: `https://eco.leopalace21.internal/bukken/${id}`,
      officialUrl: `https://www.leopalace21.com/properties/chintai/${id.toLowerCase()}`,
      aiAnalysis: {
        confidence: 0.7 + (i % 25) / 100,
        recommendReason: "希望条件との適合度が高く、近隣相場と比較しても妥当な価格帯。",
        marketComparison: ["周辺相場 -3%（割安）","周辺相場 +2%（適正）","周辺相場 同等"][i % 3],
        vacancyForecast: "当月内に内見手配可能",
        pastPerformance: { proposed: 10 + (i % 20), contracted: 5 + (i % 12), winRate: `${55 + (i % 30)}%` },
        lastAnalyzedAt: "2026/05/20 06:15",
      },
    });
  }
  return out;
}

export const PROPERTIES = [...BASE_PROPERTIES, ...generateMoreProperties()];


// 物件マスタのデータソース情報（セキュリティ表現用）
export const PROPERTIES_META = {
  totalCount: 569182,
  vacantCount: 128403,
  lastSyncAt: "2026/05/13 06:00:02",
  syncMethod: "全社CSV日次連携",
  encryption: "AES-256 (at rest) / TLS 1.3 (in transit)",
  classification: "社外秘 / Internal Use Only",
  custodian: "情報システム部 物件管理ワーキンググループ",
  syncSuccessRate30d: "100% (30/30)",
  retentionPolicy: "差分履歴 365 日",
};

// 地図上の駅マーカー
export const STATION_MARKERS = [
  { name: "門前仲町", left: "30%", top: "45%" },
  { name: "清澄白河", left: "32%", top: "30%" },
  { name: "豊洲", left: "32%", top: "75%" },
  { name: "東陽町", left: "78%", top: "55%" },
  { name: "住吉", left: "76%", top: "20%" },
];

// 物件IDから、レオパレス21社内の各物件管理ツールにおける詳細ページURLを生成。
// この物件マスタは、社内に複数存在する物件管理ツールに登録される
// 同じ物件情報を、重複排除されたマスタとして一元管理しています。
export const getPortalLinks = (propertyId) => {
  const cleanId = (propertyId || "").replace(/[^A-Z0-9-]/gi, "");
  return [
    {
      key: "pms",
      name: "物件管理システム (PMS)",
      shortName: "物件管理",
      primary: true,
      url: `https://pms.leopalace21.internal/properties/${cleanId}`,
    },
    {
      key: "rms",
      name: "賃貸管理システム (RMS)",
      shortName: "賃貸管理",
      url: `https://rms.leopalace21.internal/rooms/${cleanId}`,
    },
    {
      key: "facility",
      name: "設備・建物管理システム",
      shortName: "設備管理",
      url: `https://facility.leopalace21.internal/buildings/${cleanId}`,
    },
    {
      key: "sfa",
      name: "営業支援システム (SFA)",
      shortName: "SFA",
      url: `https://sfa.leopalace21.internal/properties/${cleanId}`,
    },
  ];
};
