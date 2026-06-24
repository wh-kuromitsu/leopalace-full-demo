import React, { useState, useMemo } from "react";
import {
  Search,
  Download,
  Upload,
  Plus,
  Train,
  CheckCircle2,
  Sparkles,
  Edit3,
  Trash2,
  Eye,
  X,
  FileSpreadsheet,
  Building2,
  Info,
  ArrowUpFromLine,
  ExternalLink,
  Layers,
  Copy,
} from "lucide-react";
import { PROPERTIES, getPortalLinks } from "../data/propertiesData";

// 物件種別
const PROPERTY_TYPES = [
  "賃貸マンション",
  "賃貸アパート",
  "賃貸戸建",
  "テラスハウス",
  "メゾネット",
];

// 間取り
const LAYOUTS = [
  "1R", "1K", "1DK", "1LDK",
  "2K", "2DK", "2LDK",
  "3K", "3DK", "3LDK",
  "4LDK以上",
];

// 構造
const STRUCTURES = ["RC（鉄筋コンクリート）", "SRC（鉄骨鉄筋コンクリート）", "鉄骨", "軽量鉄骨", "木造"];

// 都道府県（主要のみ）
const PREFECTURES = ["東京都", "神奈川県", "千葉県", "埼玉県", "大阪府", "京都府", "愛知県", "福岡県", "北海道", "宮城県"];

// 方角
const DIRECTIONS = ["南", "南東", "南西", "東", "西", "北東", "北西", "北"];

// 契約形態
const CONTRACT_TYPES = ["普通借家", "定期借家", "サブリース"];

// 設備（標準的な賃貸物件項目）
const FEATURE_GROUPS = [
  {
    label: "キッチン",
    items: ["システムキッチン", "IHコンロ", "ガスコンロ", "コンロ2口以上", "カウンターキッチン", "独立キッチン"],
  },
  {
    label: "バス・トイレ",
    items: ["バス・トイレ別", "追い焚き機能", "浴室乾燥機", "温水洗浄便座", "独立洗面台"],
  },
  {
    label: "セキュリティ",
    items: ["オートロック", "TVモニター付インターホン", "防犯カメラ", "宅配BOX", "ディンプルキー"],
  },
  {
    label: "室内設備",
    items: ["エアコン", "床暖房", "フローリング", "ウォークインクローゼット", "ロフト", "バルコニー"],
  },
  {
    label: "通信・家電",
    items: ["インターネット無料", "光ファイバー対応", "家具家電付き", "BS/CS対応"],
  },
  {
    label: "その他",
    items: ["駐車場", "駐輪場", "バイク置場", "ペット可", "楽器可", "ルームシェア可", "二人入居可", "外国人可"],
  },
];

// 初期物件オブジェクト（新規登録用）
const newProperty = () => ({
  id: `LP-NEW-${Math.floor(Math.random() * 9000 + 1000)}`,
  // 基本情報
  name: "",
  type: "賃貸マンション",
  // 所在地
  postalCode: "",
  prefecture: "東京都",
  city: "",
  address: "",
  // 交通
  line: "",
  station: "",
  walkMin: "",
  line2: "",
  station2: "",
  walkMin2: "",
  // 部屋
  layout: "1K",
  size: "",
  roomFloor: "",
  totalFloors: "",
  direction: "南",
  roomNo: "",
  // 賃料・初期費用
  rent: "",
  fee: "",
  deposit: "",
  keyMoney: "",
  guarantee: "",
  renewalFee: "",
  brokerage: "",
  keyChange: "",
  fireInsurance: "",
  // 契約条件
  contractType: "普通借家",
  contractTerm: "2年",
  availableFrom: "",
  shortTermPenalty: "",
  // 建物
  builtYearMonth: "",
  structure: "RC（鉄筋コンクリート）",
  totalUnits: "",
  parking: "",
  parkingFee: "",
  // 設備
  features: [],
  // その他
  managementCompany: "レオパレス21",
  available: 1,
  notes: "",
});

// === ステータスバッジ用ヘルパー
const Field = ({ label, required, children, span = 1 }) => (
  <div className={`col-span-${span}`}>
    <label className="text-[10px] text-slate-500 mb-1 block">
      {label}
      {required && <span className="text-rose-500 ml-0.5">*</span>}
    </label>
    {children}
  </div>
);

const Section = ({ title, children, accent }) => {
  const accentColor =
    accent === "money"
      ? "bg-amber-50 border-amber-200 text-amber-800"
      : accent === "feature"
      ? "bg-sky-50 border-sky-200 text-sky-800"
      : "bg-slate-50 border-slate-200 text-slate-800";
  return (
    <section className="mb-5">
      <h3 className={`text-[12px] font-bold px-3 py-1.5 border-l-4 ${accentColor} mb-3 rounded-r`}>
        {title}
      </h3>
      <div className="px-2">{children}</div>
    </section>
  );
};

const txt = "w-full px-2.5 py-1.5 border border-slate-300 rounded text-[12px] focus:outline-none focus:border-brand";

// ====================================================================
// 物件登録/編集 ダイアログ
// ====================================================================
function PropertyFormDialog({ open, initial, mode = "new", onSave, onClose }) {
  const [form, setForm] = useState(initial || newProperty());

  React.useEffect(() => {
    setForm(initial || newProperty());
  }, [initial, open]);

  if (!open) return null;

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));
  const toggleFeature = (f) =>
    setForm((p) => ({
      ...p,
      features: p.features.includes(f)
        ? p.features.filter((x) => x !== f)
        : [...p.features, f],
    }));

  // モード別のラベル
  const labels = {
    new: { title: "新規物件の登録", sub: "新たに物件を登録します", button: "物件を登録" },
    edit: { title: "物件情報の編集", sub: "既存物件の情報を更新します", button: "変更を保存" },
    copy: { title: "物件をコピーして登録", sub: "既存物件の情報をベースに新規登録します", button: "コピーして登録" },
  };
  const L = labels[mode] || labels.new;

  const handleSave = () => {
    if (!form.name.trim() || !form.rent || !form.station) {
      alert("必須項目（物件名・最寄駅・賃料）を入力してください");
      return;
    }
    onSave(form);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-md shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* ヘッダ */}
        <div className="px-5 py-3 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-[15px] font-bold text-slate-900 flex items-center gap-2">
              {mode === "copy" && <Copy className="w-4 h-4 text-brand" />}
              {L.title}
            </h2>
            <p className="text-[10px] text-slate-500 mt-0.5">
              {L.sub} ／ <span className="text-rose-500">*</span> は必須項目です
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 inline-flex items-center justify-center rounded hover:bg-slate-100 text-slate-500"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* スクロール可能なボディ */}
        <div className="flex-1 overflow-y-auto p-5">
          {/* 基本情報 */}
          <Section title="基本情報">
            <div className="grid grid-cols-6 gap-3">
              <Field label="物件名" required span={4}>
                <input
                  value={form.name}
                  onChange={(e) => set("name", e.target.value)}
                  placeholder="例：レオパレス○○ステーション"
                  className={txt}
                />
              </Field>
              <Field label="物件種別" required span={2}>
                <select
                  value={form.type}
                  onChange={(e) => set("type", e.target.value)}
                  className={txt}
                >
                  {PROPERTY_TYPES.map((t) => <option key={t}>{t}</option>)}
                </select>
              </Field>
            </div>
          </Section>

          {/* 所在地 */}
          <Section title="所在地">
            <div className="grid grid-cols-6 gap-3">
              <Field label="郵便番号" span={1}>
                <input
                  value={form.postalCode}
                  onChange={(e) => set("postalCode", e.target.value)}
                  placeholder="135-0048"
                  className={`${txt} font-mono`}
                />
              </Field>
              <Field label="都道府県" required span={1}>
                <select
                  value={form.prefecture}
                  onChange={(e) => set("prefecture", e.target.value)}
                  className={txt}
                >
                  {PREFECTURES.map((p) => <option key={p}>{p}</option>)}
                </select>
              </Field>
              <Field label="市区町村" required span={2}>
                <input
                  value={form.city}
                  onChange={(e) => set("city", e.target.value)}
                  placeholder="江東区"
                  className={txt}
                />
              </Field>
              <Field label="番地以下・建物名" required span={2}>
                <input
                  value={form.address}
                  onChange={(e) => set("address", e.target.value)}
                  placeholder="門前仲町2-8-3"
                  className={txt}
                />
              </Field>
            </div>
          </Section>

          {/* 交通 */}
          <Section title="交通">
            <div className="grid grid-cols-6 gap-3">
              <Field label="路線" span={2}>
                <input
                  value={form.line}
                  onChange={(e) => set("line", e.target.value)}
                  placeholder="東京メトロ東西線"
                  className={txt}
                />
              </Field>
              <Field label="最寄駅" required span={2}>
                <input
                  value={form.station}
                  onChange={(e) => set("station", e.target.value)}
                  placeholder="門前仲町"
                  className={txt}
                />
              </Field>
              <Field label="駅徒歩(分)" required span={1}>
                <input
                  type="number"
                  value={form.walkMin}
                  onChange={(e) => set("walkMin", e.target.value)}
                  placeholder="4"
                  className={`${txt} text-right`}
                />
              </Field>
              <div className="col-span-1" />
              <Field label="路線(第2)" span={2}>
                <input
                  value={form.line2}
                  onChange={(e) => set("line2", e.target.value)}
                  className={txt}
                />
              </Field>
              <Field label="駅(第2)" span={2}>
                <input
                  value={form.station2}
                  onChange={(e) => set("station2", e.target.value)}
                  className={txt}
                />
              </Field>
              <Field label="徒歩(第2)" span={1}>
                <input
                  type="number"
                  value={form.walkMin2}
                  onChange={(e) => set("walkMin2", e.target.value)}
                  className={`${txt} text-right`}
                />
              </Field>
            </div>
          </Section>

          {/* 部屋情報 */}
          <Section title="部屋情報">
            <div className="grid grid-cols-6 gap-3">
              <Field label="間取り" required span={1}>
                <select
                  value={form.layout}
                  onChange={(e) => set("layout", e.target.value)}
                  className={txt}
                >
                  {LAYOUTS.map((l) => <option key={l}>{l}</option>)}
                </select>
              </Field>
              <Field label="専有面積(㎡)" required span={1}>
                <input
                  type="number"
                  step="0.1"
                  value={form.size}
                  onChange={(e) => set("size", e.target.value)}
                  placeholder="23.4"
                  className={`${txt} text-right`}
                />
              </Field>
              <Field label="部屋階" span={1}>
                <input
                  type="number"
                  value={form.roomFloor}
                  onChange={(e) => set("roomFloor", e.target.value)}
                  placeholder="3"
                  className={`${txt} text-right`}
                />
              </Field>
              <Field label="建物総階数" span={1}>
                <input
                  type="number"
                  value={form.totalFloors}
                  onChange={(e) => set("totalFloors", e.target.value)}
                  placeholder="5"
                  className={`${txt} text-right`}
                />
              </Field>
              <Field label="向き" span={1}>
                <select
                  value={form.direction}
                  onChange={(e) => set("direction", e.target.value)}
                  className={txt}
                >
                  {DIRECTIONS.map((d) => <option key={d}>{d}</option>)}
                </select>
              </Field>
              <Field label="部屋番号" span={1}>
                <input
                  value={form.roomNo}
                  onChange={(e) => set("roomNo", e.target.value)}
                  placeholder="305"
                  className={txt}
                />
              </Field>
            </div>
          </Section>

          {/* 賃料・初期費用 */}
          <Section title="賃料・初期費用" accent="money">
            <div className="grid grid-cols-6 gap-3">
              <Field label="賃料(円/月)" required span={2}>
                <input
                  type="number"
                  value={form.rent}
                  onChange={(e) => set("rent", e.target.value)}
                  placeholder="78000"
                  className={`${txt} text-right font-bold`}
                />
              </Field>
              <Field label="管理費・共益費(円)" span={2}>
                <input
                  type="number"
                  value={form.fee}
                  onChange={(e) => set("fee", e.target.value)}
                  placeholder="4500"
                  className={`${txt} text-right`}
                />
              </Field>
              <Field label="敷金" span={1}>
                <input
                  value={form.deposit}
                  onChange={(e) => set("deposit", e.target.value)}
                  placeholder="1ヶ月"
                  className={txt}
                />
              </Field>
              <Field label="礼金" span={1}>
                <input
                  value={form.keyMoney}
                  onChange={(e) => set("keyMoney", e.target.value)}
                  placeholder="1ヶ月"
                  className={txt}
                />
              </Field>
              <Field label="保証金" span={1}>
                <input
                  value={form.guarantee}
                  onChange={(e) => set("guarantee", e.target.value)}
                  placeholder="なし"
                  className={txt}
                />
              </Field>
              <Field label="更新料" span={1}>
                <input
                  value={form.renewalFee}
                  onChange={(e) => set("renewalFee", e.target.value)}
                  placeholder="新賃料1ヶ月"
                  className={txt}
                />
              </Field>
              <Field label="仲介手数料" span={2}>
                <input
                  value={form.brokerage}
                  onChange={(e) => set("brokerage", e.target.value)}
                  placeholder="賃料の0.5ヶ月+消費税"
                  className={txt}
                />
              </Field>
              <Field label="鍵交換代(円)" span={1}>
                <input
                  type="number"
                  value={form.keyChange}
                  onChange={(e) => set("keyChange", e.target.value)}
                  placeholder="22000"
                  className={`${txt} text-right`}
                />
              </Field>
              <Field label="火災保険料(円)" span={1}>
                <input
                  type="number"
                  value={form.fireInsurance}
                  onChange={(e) => set("fireInsurance", e.target.value)}
                  placeholder="20000"
                  className={`${txt} text-right`}
                />
              </Field>
            </div>
          </Section>

          {/* 契約条件 */}
          <Section title="契約条件">
            <div className="grid grid-cols-6 gap-3">
              <Field label="契約形態" span={2}>
                <select
                  value={form.contractType}
                  onChange={(e) => set("contractType", e.target.value)}
                  className={txt}
                >
                  {CONTRACT_TYPES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </Field>
              <Field label="契約期間" span={2}>
                <input
                  value={form.contractTerm}
                  onChange={(e) => set("contractTerm", e.target.value)}
                  placeholder="2年"
                  className={txt}
                />
              </Field>
              <Field label="入居可能日" span={2}>
                <input
                  value={form.availableFrom}
                  onChange={(e) => set("availableFrom", e.target.value)}
                  placeholder="即入居可 / 2026/07/01"
                  className={txt}
                />
              </Field>
              <Field label="短期解約違約金" span={6}>
                <input
                  value={form.shortTermPenalty}
                  onChange={(e) => set("shortTermPenalty", e.target.value)}
                  placeholder="1年未満解約時：賃料1ヶ月分"
                  className={txt}
                />
              </Field>
            </div>
          </Section>

          {/* 建物情報 */}
          <Section title="建物情報">
            <div className="grid grid-cols-6 gap-3">
              <Field label="築年月" span={2}>
                <input
                  type="month"
                  value={form.builtYearMonth}
                  onChange={(e) => set("builtYearMonth", e.target.value)}
                  className={txt}
                />
              </Field>
              <Field label="構造" span={2}>
                <select
                  value={form.structure}
                  onChange={(e) => set("structure", e.target.value)}
                  className={txt}
                >
                  {STRUCTURES.map((s) => <option key={s}>{s}</option>)}
                </select>
              </Field>
              <Field label="総戸数" span={2}>
                <input
                  type="number"
                  value={form.totalUnits}
                  onChange={(e) => set("totalUnits", e.target.value)}
                  placeholder="42"
                  className={`${txt} text-right`}
                />
              </Field>
              <Field label="駐車場" span={3}>
                <input
                  value={typeof form.parking === "object" && form.parking !== null
                    ? (form.parking.available ? "あり" : "空き待ち")
                    : (form.parking || "")}
                  onChange={(e) => set("parking", e.target.value)}
                  placeholder="あり（敷地内 / 機械式）"
                  className={txt}
                />
              </Field>
              <Field label="駐車場月額(円)" span={3}>
                <input
                  type="number"
                  value={form.parkingFee}
                  onChange={(e) => set("parkingFee", e.target.value)}
                  placeholder="18000"
                  className={`${txt} text-right`}
                />
              </Field>
            </div>
          </Section>

          {/* 設備 */}
          <Section title="設備・条件" accent="feature">
            {FEATURE_GROUPS.map((g) => (
              <div key={g.label} className="mb-3">
                <div className="text-[11px] font-bold text-slate-700 mb-1.5">
                  {g.label}
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                  {g.items.map((f) => (
                    <label
                      key={f}
                      className={`flex items-center gap-2 px-2.5 py-1.5 border rounded cursor-pointer text-[11px] ${
                        form.features.includes(f)
                          ? "border-sky-400 bg-sky-50 text-sky-700 font-medium"
                          : "border-slate-200 hover:bg-slate-50 text-slate-700"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={form.features.includes(f)}
                        onChange={() => toggleFeature(f)}
                        className="rounded text-sky-500"
                      />
                      {f}
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </Section>

          {/* その他 */}
          <Section title="その他">
            <div className="grid grid-cols-6 gap-3">
              <Field label="取扱不動産会社" span={3}>
                <input
                  value={form.managementCompany}
                  onChange={(e) => set("managementCompany", e.target.value)}
                  className={txt}
                />
              </Field>
              <Field label="空室数" span={3}>
                <input
                  type="number"
                  value={form.available}
                  onChange={(e) => set("available", Number(e.target.value))}
                  className={`${txt} text-right`}
                />
              </Field>
              <Field label="備考" span={6}>
                <textarea
                  value={form.notes}
                  onChange={(e) => set("notes", e.target.value)}
                  rows={2}
                  placeholder="特記事項・営業時の補足など"
                  className={txt}
                />
              </Field>
            </div>
          </Section>
        </div>

        {/* フッタ */}
        <div className="px-5 py-3 border-t border-slate-200 flex items-center justify-end gap-2 bg-slate-50">
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-[12px] border border-slate-300 rounded text-slate-700 hover:bg-slate-50"
          >
            キャンセル
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-1.5 text-[12px] font-bold text-white rounded bg-brand hover:bg-brand-dark"
          >
            {L.button}
          </button>
        </div>
      </div>
    </div>
  );
}

// ====================================================================
// 物件詳細 ダイアログ
// ====================================================================
function PropertyDetailDialog({ open, property, onEdit, onClose }) {
  if (!open || !property) return null;
  const p = property;

  const Row = ({ label, value }) => (
    <div className="flex py-1.5 border-b border-slate-100 last:border-b-0">
      <span className="w-32 flex-shrink-0 text-[11px] text-slate-500">
        {label}
      </span>
      <span className="text-[12px] text-slate-800 flex-1">
        {value || <span className="text-slate-300">-</span>}
      </span>
    </div>
  );

  const SectionTitle = ({ children }) => (
    <h4 className="text-[12px] font-bold text-slate-700 mt-4 mb-2 pb-1 border-b-2 border-brand inline-block pr-4">
      {children}
    </h4>
  );

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-md shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        {/* ヘッダ */}
        <div className="px-5 py-4 border-b border-slate-200 bg-gradient-to-r from-sky-50 to-white">
          <div className="flex items-start justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-mono text-slate-500">{p.id}</span>
                {p.recommend && (
                  <span className="inline-flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 bg-ai-light text-ai-dark border border-ai/20 rounded">
                    <Sparkles className="w-2.5 h-2.5" />
                    AI推薦
                  </span>
                )}
              </div>
              <h2 className="text-[18px] font-bold text-slate-900">{p.name}</h2>
              <div className="text-[12px] text-slate-600 mt-1">
                {p.prefecture || ""}{p.city || ""}{p.address || p.addressLine || ""}
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => onEdit(p)}
                className="px-3 py-1.5 text-[11px] font-bold text-white rounded bg-brand hover:bg-brand-dark inline-flex items-center gap-1"
              >
                <Edit3 className="w-3 h-3" />
                編集
              </button>
              <button
                onClick={onClose}
                className="w-8 h-8 inline-flex items-center justify-center rounded hover:bg-slate-100 text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
          {/* 価格バー */}
          <div className="flex items-baseline gap-3 mt-3">
            <span className="text-[26px] font-bold text-rose-600">
              ¥{Number(p.rent || 0).toLocaleString()}
            </span>
            <span className="text-[12px] text-slate-600">
              /月（管理費 ¥{Number(p.fee || 0).toLocaleString()}）
            </span>
            <span className="ml-auto inline-flex items-center gap-1 text-[11px] text-emerald-700 font-bold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              空室 {p.available ?? 0} 部屋
            </span>
          </div>
        </div>

        {/* ボディ */}
        <div className="flex-1 overflow-y-auto p-5">
          <SectionTitle>基本情報</SectionTitle>
          <div>
            <Row label="物件種別" value={p.type} />
            <Row label="間取り" value={p.layout} />
            <Row label="専有面積" value={p.size ? `${p.size} ㎡` : null} />
            <Row label="階数" value={p.roomFloor && p.totalFloors ? `${p.roomFloor}階 / ${p.totalFloors}階建` : p.floor} />
            <Row label="向き" value={p.direction} />
            <Row label="部屋番号" value={p.roomNo} />
          </div>

          <SectionTitle>所在地・交通</SectionTitle>
          <div>
            <Row label="郵便番号" value={p.postalCode} />
            <Row label="住所" value={p.address} />
            <Row label="第1の最寄駅" value={(p.line || "") + (p.station ? ` ${p.station}駅 徒歩${p.walkMin}分` : p.station)} />
            {p.station2 && (
              <Row label="第2の最寄駅" value={`${p.line2 || ""} ${p.station2}駅 徒歩${p.walkMin2}分`} />
            )}
          </div>

          <SectionTitle>賃料・初期費用</SectionTitle>
          <div>
            <Row label="賃料" value={p.rent ? `¥${Number(p.rent).toLocaleString()} / 月` : null} />
            <Row label="管理費・共益費" value={p.fee ? `¥${Number(p.fee).toLocaleString()}` : null} />
            <Row label="敷金" value={p.deposit} />
            <Row label="礼金" value={p.keyMoney} />
            <Row label="保証金" value={p.guarantee} />
            <Row label="更新料" value={p.renewalFee} />
            <Row label="仲介手数料" value={p.brokerage} />
            <Row label="鍵交換代" value={p.keyChange ? `¥${Number(p.keyChange).toLocaleString()}` : null} />
            <Row label="火災保険料" value={p.fireInsurance ? `¥${Number(p.fireInsurance).toLocaleString()}` : null} />
          </div>

          <SectionTitle>契約条件</SectionTitle>
          <div>
            <Row label="契約形態" value={p.contractType} />
            <Row label="契約期間" value={p.contractTerm} />
            <Row label="入居可能日" value={p.availableFrom} />
            <Row label="短期解約違約金" value={p.shortTermPenalty} />
          </div>

          <SectionTitle>建物</SectionTitle>
          <div>
            <Row label="築年月" value={p.builtYearMonth || (p.age ? `築${p.age}年` : null)} />
            <Row label="構造" value={p.structure} />
            <Row label="総戸数" value={p.totalUnits} />
            <Row label="駐車場" value={typeof p.parking === "object" && p.parking !== null
              ? `${p.parking.available ? "あり" : "空き待ち"}${p.parking.fee ? `（¥${Number(p.parking.fee).toLocaleString()}/月）` : ""}・利用開始 ${p.parking.availableFrom || "—"}`
              : p.parking} />
            <Row label="駐車場月額" value={p.parkingFee ? `¥${Number(p.parkingFee).toLocaleString()}` : null} />
          </div>

          <SectionTitle>設備</SectionTitle>
          <div className="flex flex-wrap gap-1.5 py-2">
            {(p.features || []).length > 0 ? (
              p.features.map((f) => (
                <span
                  key={f}
                  className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 bg-sky-50 text-sky-700 border border-sky-200 rounded-full"
                >
                  <CheckCircle2 className="w-2.5 h-2.5" />
                  {f}
                </span>
              ))
            ) : (
              <span className="text-[11px] text-slate-400">登録なし</span>
            )}
          </div>

          {(p.notes || p.managementCompany) && (
            <>
              <SectionTitle>その他</SectionTitle>
              <Row label="取扱不動産会社" value={p.managementCompany} />
              <Row label="備考" value={p.notes} />
            </>
          )}

          {/* 連携している社内ツール */}
          <SectionTitle>連携している社内ツール</SectionTitle>
          <div className="text-[10px] text-slate-500 mb-2">
            この物件は以下の社内ツールにも登録されています。各ツールの詳細ページを新規タブで開けます。
          </div>
          <div className="grid grid-cols-2 gap-2">
            {getPortalLinks(p.id).map((link) => (
              <a
                key={link.key}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center justify-between px-3 py-2.5 rounded border transition group ${
                  link.primary
                    ? "border-brand bg-brand-light hover:bg-brand-light/70"
                    : "border-slate-200 hover:border-slate-400 hover:bg-slate-50"
                }`}
              >
                <div className="min-w-0">
                  <div className={`text-[12px] font-bold ${link.primary ? "text-brand-dark" : "text-slate-800"}`}>
                    {link.name}
                  </div>
                  <div className="text-[9px] text-slate-500 font-mono truncate">
                    {link.url}
                  </div>
                </div>
                <ExternalLink className={`w-3.5 h-3.5 flex-shrink-0 ml-2 ${
                  link.primary ? "text-brand" : "text-slate-400 group-hover:text-slate-700"
                }`} />
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ====================================================================
// CSV取込 ダイアログ
// ====================================================================
function ImportCsvDialog({ open, onClose, onImport }) {
  const [file, setFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);

  if (!open) return null;

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) setFile(f);
  };

  const handleSelect = (e) => {
    const f = e.target.files?.[0];
    if (f) setFile(f);
  };

  const handleImport = () => {
    if (!file) {
      alert("CSVファイルを選択してください");
      return;
    }
    onImport(file);
  };

  const downloadTemplate = () => {
    const headers = [
      "物件名", "物件種別", "郵便番号", "都道府県", "市区町村", "番地・建物名",
      "路線", "最寄駅", "駅徒歩(分)",
      "間取り", "専有面積(㎡)", "部屋階", "建物総階数", "向き",
      "賃料", "管理費・共益費", "敷金", "礼金", "保証金", "更新料",
      "契約形態", "契約期間", "入居可能日",
      "築年月", "構造", "総戸数", "駐車場", "駐車場月額",
      "設備（半角カンマ区切）", "空室数", "備考"
    ];
    const sample = [
      "レオパレス○○ステーション", "賃貸マンション", "135-0048", "東京都", "江東区", "門前仲町2-8-3",
      "東京メトロ東西線", "門前仲町", "4",
      "1K", "23.4", "3", "5", "南",
      "78000", "4500", "1ヶ月", "1ヶ月", "なし", "新賃料1ヶ月",
      "普通借家", "2年", "即入居可",
      "2018-04", "RC（鉄筋コンクリート）", "42", "あり（敷地内）", "18000",
      "オートロック,宅配BOX,家具家電付き", "4", ""
    ];
    const csv = headers.join(",") + "\n" + sample.map((s) => `"${s}"`).join(",");
    const bom = "\uFEFF";
    const blob = new Blob([bom + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "leopalace_property_template.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-md shadow-xl w-full max-w-xl">
        <div className="px-5 py-3 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-[15px] font-bold text-slate-900 flex items-center gap-2">
            <ArrowUpFromLine className="w-4 h-4 text-brand" />
            CSV ファイルで物件を一括取込
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 inline-flex items-center justify-center rounded hover:bg-slate-100 text-slate-500"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* テンプレ案内 */}
          <div className="bg-sky-50 border border-sky-200 rounded p-3 flex items-start gap-2">
            <Info className="w-4 h-4 text-sky-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1 text-[11px] text-sky-900">
              <div className="font-bold mb-0.5">取込前にテンプレートをダウンロード</div>
              <div>列ヘッダの順序を保ったまま、行を追加してアップロードしてください。</div>
            </div>
            <button
              onClick={downloadTemplate}
              className="text-[11px] px-2 py-1 bg-white border border-sky-300 text-sky-700 rounded hover:bg-sky-50 inline-flex items-center gap-1 flex-shrink-0"
            >
              <Download className="w-3 h-3" />
              テンプレートDL
            </button>
          </div>

          {/* ドロップゾーン */}
          <label
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            className={`block border-2 border-dashed rounded-md p-8 text-center cursor-pointer transition ${
              dragOver
                ? "border-brand bg-brand-light"
                : file
                ? "border-emerald-300 bg-emerald-50"
                : "border-slate-300 bg-slate-50 hover:border-brand hover:bg-brand-light/30"
            }`}
          >
            <input type="file" accept=".csv" onChange={handleSelect} className="hidden" />
            {file ? (
              <>
                <FileSpreadsheet className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
                <div className="text-[13px] font-bold text-slate-900">{file.name}</div>
                <div className="text-[10px] text-slate-500 mt-1">
                  {(file.size / 1024).toFixed(1)} KB
                </div>
                <button
                  onClick={(e) => { e.preventDefault(); setFile(null); }}
                  className="mt-2 text-[10px] text-rose-600 hover:underline"
                >
                  別のファイルを選択
                </button>
              </>
            ) : (
              <>
                <Upload className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                <div className="text-[13px] font-bold text-slate-700">
                  CSV ファイルをドロップ
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  または<span className="text-brand font-medium underline">クリックして選択</span>
                </div>
                <div className="text-[9px] text-slate-400 mt-2">
                  UTF-8（BOM付き）/ 最大 10MB
                </div>
              </>
            )}
          </label>

          {/* オプション */}
          <div className="text-[11px] space-y-1.5">
            <label className="flex items-center gap-2">
              <input type="checkbox" defaultChecked className="rounded text-brand" />
              <span className="text-slate-700">既存物件はスキップ（重複ID）</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" className="rounded text-brand" />
              <span className="text-slate-700">取込結果をメールで通知</span>
            </label>
          </div>
        </div>

        <div className="px-5 py-3 border-t border-slate-200 flex items-center justify-end gap-2 bg-slate-50">
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-[12px] border border-slate-300 rounded text-slate-700 hover:bg-slate-50"
          >
            キャンセル
          </button>
          <button
            onClick={handleImport}
            disabled={!file}
            className="px-4 py-1.5 text-[12px] font-bold text-white rounded bg-brand hover:bg-brand-dark disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-1"
          >
            <Upload className="w-3 h-3" />
            取込開始
          </button>
        </div>
      </div>
    </div>
  );
}

// ====================================================================
// メイン
// ====================================================================
export default function Properties() {
  const [properties, setProperties] = useState(PROPERTIES);
  const [query, setQuery] = useState("");
  const [showImport, setShowImport] = useState(false);
  const [editing, setEditing] = useState(null); // 編集/コピー対象 or null（新規）
  const [formMode, setFormMode] = useState("new"); // "new" | "edit" | "copy"
  const [showForm, setShowForm] = useState(false);
  const [detail, setDetail] = useState(null);
  const [page, setPage] = useState(1);
  const pageSize = 5;

  const filtered = useMemo(() => {
    if (!query) return properties;
    const q = query.toLowerCase();
    return properties.filter(
      (p) =>
        p.name?.toLowerCase().includes(q) ||
        p.id?.toLowerCase().includes(q) ||
        p.address?.toLowerCase().includes(q) ||
        p.station?.toLowerCase().includes(q)
    );
  }, [query, properties]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paged = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // 検索やデータ変更時にページを1に戻す
  React.useEffect(() => {
    setPage(1);
  }, [query, properties.length]);

  const openNew = () => {
    setEditing(null);
    setFormMode("new");
    setShowForm(true);
  };

  const openEdit = (p) => {
    setEditing(p);
    setFormMode("edit");
    setShowForm(true);
  };

  const openCopy = (p) => {
    // 既存物件をベースに新規IDで複製
    const copied = {
      ...p,
      id: `LP-${Math.floor(Math.random() * 90000 + 10000)}`,
      name: `${p.name}（コピー）`,
    };
    setEditing(copied);
    setFormMode("copy");
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditing(null);
  };

  const handleSave = (form) => {
    if (formMode === "edit") {
      // 編集：既存IDで上書き
      setProperties((prev) => prev.map((p) => (p.id === form.id ? { ...p, ...form } : p)));
    } else {
      // 新規 or コピー：新規追加
      setProperties((prev) => [form, ...prev]);
    }
    closeForm();
  };

  const handleDelete = (id) => {
    if (window.confirm("この物件を削除しますか？")) {
      setProperties((prev) => prev.filter((p) => p.id !== id));
      setDetail(null);
    }
  };

  const handleImport = (file) => {
    alert(`「${file.name}」を取込キューに登録しました。\n処理完了後、通知でお知らせします。`);
    setShowImport(false);
  };

  return (
    <div className="p-5 space-y-3">
      {/* 物件マスタの価値説明バナー（顧客目線） */}
      <div className="bg-gradient-to-r from-brand-light to-white border border-brand/20 rounded-md px-4 py-3 flex items-start gap-3">
        <div className="w-9 h-9 rounded bg-brand/10 flex items-center justify-center flex-shrink-0">
          <Layers className="w-4 h-4 text-brand-dark" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[13px] font-bold text-slate-900">
            社内の複数の物件管理ツールに散在する同じ物件を、物件マスタとして一元管理しています
          </div>
          <div className="text-[11px] text-slate-600 mt-1 leading-relaxed">
            物件管理システム (PMS)・賃貸管理システム (RMS)・設備管理システム・営業支援システム (SFA) など、
            社内の各ツールに別々に登録される同じ物件情報を、
            <span className="font-bold text-brand-dark">重複排除されたユニークなマスタ</span>
            としてここで管理しています。提案時には、各ツールに分散する最新かつ正確な物件情報をご利用いただけます。
            各物件の社内ツール上の詳細ページへのリンクは、行末のリンクボタン、または詳細表示から開けます。
          </div>
        </div>
      </div>

      {/* ツールバー */}
      <div className="bg-white border border-slate-200 rounded-md px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="物件名・住所・最寄駅・物件IDで検索"
              className="w-80 pl-8 pr-3 py-1.5 text-[12px] bg-slate-50 border border-slate-200 rounded"
            />
          </div>
          <select className="text-[11px] border border-slate-300 rounded px-2 py-1.5">
            <option>全エリア</option>
            <option>東京都</option>
            <option>神奈川県</option>
          </select>
          <select className="text-[11px] border border-slate-300 rounded px-2 py-1.5">
            <option>全間取り</option>
            <option>1R / 1K</option>
            <option>1DK / 1LDK</option>
            <option>2K以上</option>
          </select>
          <div className="text-[11px] text-slate-500 ml-2">
            <span className="font-bold text-slate-900">{filtered.length}</span> / {properties.length} 件
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowImport(true)}
            className="px-3 py-1.5 text-[12px] border border-slate-300 rounded text-slate-700 hover:bg-slate-50 inline-flex items-center gap-1"
          >
            <ArrowUpFromLine className="w-3.5 h-3.5" />
            CSV取込
          </button>
          <button
            className="px-3 py-1.5 text-[12px] border border-slate-300 rounded text-slate-700 hover:bg-slate-50 inline-flex items-center gap-1"
          >
            <Download className="w-3.5 h-3.5" />
            CSV出力
          </button>
          <button
            onClick={openNew}
            className="px-3 py-1.5 text-[12px] font-bold text-white rounded bg-brand hover:bg-brand-dark inline-flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            新規物件
          </button>
        </div>
      </div>

      {/* 一覧テーブル */}
      <div className="bg-white border border-slate-200 rounded-md overflow-hidden">
        <table className="w-full text-[12px]">
          <thead className="bg-slate-50">
            <tr className="text-left text-slate-600 border-b border-slate-200">
              <th className="px-4 py-2.5 font-medium">物件名</th>
              <th className="px-4 py-2.5 font-medium">所在地</th>
              <th className="px-4 py-2.5 font-medium">最寄駅</th>
              <th className="px-4 py-2.5 font-medium">間取り</th>
              <th className="px-4 py-2.5 font-medium text-right">賃料</th>
              <th className="px-4 py-2.5 font-medium text-right">面積</th>
              <th className="px-4 py-2.5 font-medium text-right">空室</th>
              <th className="px-4 py-2.5 font-medium w-44">操作</th>
            </tr>
          </thead>
          <tbody>
            {paged.map((p) => (
              <tr
                key={p.id}
                className="border-b border-slate-100 hover:bg-slate-50"
              >
                <td className="px-4 py-3">
                  <div className="font-bold text-slate-900">
                    {p.name}
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono">{p.id}</div>
                </td>
                <td className="px-4 py-3 text-slate-700">{p.address}</td>
                <td className="px-4 py-3 text-slate-700">
                  <Train className="w-3 h-3 inline mr-1" />
                  {p.station} 徒歩{p.walkMin}分
                </td>
                <td className="px-4 py-3 text-slate-700">{p.layout} / {p.size}㎡</td>
                <td className="px-4 py-3 text-right text-rose-600 font-bold">
                  ¥{Number(p.rent || 0).toLocaleString()}
                </td>
                <td className="px-4 py-3 text-right text-slate-700">{p.size}㎡</td>
                <td className="px-4 py-3 text-right">
                  <span className="text-[11px] text-emerald-700 font-bold">
                    <CheckCircle2 className="w-3 h-3 inline" />
                    {p.available ?? 0}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setDetail(p)}
                      className="w-7 h-7 inline-flex items-center justify-center rounded hover:bg-sky-50 text-slate-500 hover:text-sky-600"
                      title="詳細"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => openEdit(p)}
                      className="w-7 h-7 inline-flex items-center justify-center rounded hover:bg-amber-50 text-slate-500 hover:text-amber-600"
                      title="編集"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => openCopy(p)}
                      className="w-7 h-7 inline-flex items-center justify-center rounded hover:bg-indigo-50 text-slate-500 hover:text-indigo-600"
                      title="この物件をコピーして新規登録"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    {/* 外部リンク（ホバーで4サイト表示） */}
                    <div className="relative group">
                      <a
                        href={getPortalLinks(p.id)[0].url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="w-7 h-7 inline-flex items-center justify-center rounded hover:bg-emerald-50 text-slate-500 hover:text-emerald-600"
                        title="社内ツールの詳細ページを開く（クリックで物件管理システム、ホバーで全ツール）"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                      <div className="absolute right-0 top-full mt-1 w-52 bg-white border border-slate-200 rounded-md shadow-lg hidden group-hover:block z-20">
                        <div className="px-3 py-2 border-b border-slate-100 text-[10px] font-bold text-slate-500">
                          連携している社内ツール
                        </div>
                        {getPortalLinks(p.id).map((link) => (
                          <a
                            key={link.key}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className={`flex items-center justify-between px-3 py-1.5 text-[11px] hover:bg-slate-50 ${
                              link.primary ? "font-bold text-brand-dark" : "text-slate-700"
                            }`}
                          >
                            <span>{link.name}</span>
                            <ExternalLink className="w-3 h-3 text-slate-400" />
                          </a>
                        ))}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(p.id)}
                      className="w-7 h-7 inline-flex items-center justify-center rounded hover:bg-rose-50 text-slate-500 hover:text-rose-600"
                      title="削除"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="px-4 py-12 text-center text-[12px] text-slate-400">
            <Building2 className="w-8 h-8 mx-auto mb-2 text-slate-300" />
            該当する物件はありません
          </div>
        )}

        {/* ページネーション */}
        {filtered.length > 0 && (
          <div className="px-4 py-3 flex items-center justify-between border-t border-slate-100 text-[11px]">
            <div className="text-slate-500">
              <span className="font-medium text-slate-700">
                {(currentPage - 1) * pageSize + 1}
                {" "}-{" "}
                {Math.min(currentPage * pageSize, filtered.length)}
              </span>
              <span className="mx-1">/</span>
              <span>{filtered.length} 件</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(1)}
                disabled={currentPage === 1}
                className="px-2 py-1 border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                «
              </button>
              <button
                onClick={() => setPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-2 py-1 border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                ‹
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`min-w-[28px] px-2 py-1 border rounded font-medium ${
                    p === currentPage
                      ? "bg-brand text-white border-brand"
                      : "border-slate-200 text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-2 py-1 border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                ›
              </button>
              <button
                onClick={() => setPage(totalPages)}
                disabled={currentPage === totalPages}
                className="px-2 py-1 border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                »
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ダイアログ群 */}
      <PropertyFormDialog
        open={showForm}
        initial={editing}
        mode={formMode}
        onSave={handleSave}
        onClose={closeForm}
      />
      <PropertyDetailDialog
        open={Boolean(detail)}
        property={detail}
        onEdit={(p) => { setDetail(null); openEdit(p); }}
        onClose={() => setDetail(null)}
      />
      <ImportCsvDialog
        open={showImport}
        onClose={() => setShowImport(false)}
        onImport={handleImport}
      />
    </div>
  );
}
