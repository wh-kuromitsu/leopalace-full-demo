// ===================================================================
// マルチテナント定義
// レオパレス21の支社・関連会社・部門で切替可能。
// 同じ画面構成・ワークフローを各テナントで利用しつつ、
// データは論理的に分離して管理されるイメージ。
// ===================================================================

export const TENANTS = [
  {
    id: "leopalace21-hq",
    name: "レオパレス21 本社",
    shortName: "本社",
    description: "法人営業本部・全社統括",
    color: "#003087", // ブランド濃紺
    iconText: "L",
    region: "東京",
  },
  {
    id: "leopalace21-east",
    name: "レオパレス21 関東エリア",
    shortName: "関東",
    description: "東京・神奈川・千葉・埼玉・茨城・栃木・群馬",
    color: "#0066c8",
    iconText: "東",
    region: "東京",
  },
  {
    id: "leopalace21-central",
    name: "レオパレス21 中部エリア",
    shortName: "中部",
    description: "愛知・岐阜・三重・静岡",
    color: "#f39800",
    iconText: "中",
    region: "名古屋",
  },
  {
    id: "leopalace21-west",
    name: "レオパレス21 関西エリア",
    shortName: "関西",
    description: "大阪・京都・兵庫・奈良・滋賀・和歌山",
    color: "#9333ea",
    iconText: "西",
    region: "大阪",
  },
  {
    id: "leopalace21-kyushu",
    name: "レオパレス21 九州エリア",
    shortName: "九州",
    description: "福岡・熊本・鹿児島ほか",
    color: "#059669",
    iconText: "九",
    region: "福岡",
  },
  {
    id: "leopalace-power",
    name: "レオパレス・パワー",
    shortName: "Power",
    description: "電力小売・関連サービス",
    color: "#e60012",
    iconText: "P",
    region: "東京",
  },
];

export const DEFAULT_TENANT_ID = "leopalace21-hq";
