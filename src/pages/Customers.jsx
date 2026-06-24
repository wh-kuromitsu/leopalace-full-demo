import React, { useState, useMemo } from "react";
import {
  Search,
  Download,
  Upload,
  Plus,
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
  Mail,
  Phone,
} from "lucide-react";
import PiiFreeBanner, { PiiFreeBadge, PII_FREE_NOTE } from "../components/PiiFreeBanner";
import {
  CUSTOMERS,
  LEGAL_FORMS,
  LISTING_TYPES,
  INDUSTRIES,
  TRADE_STATUSES,
  USE_PURPOSES,
  CONTRACT_TYPES,
  statusBadge,
  getCustomerPortalLinks,
} from "../data/customersData";

// 都道府県（主要のみ）
const PREFECTURES = [
  "北海道", "宮城県", "東京都", "神奈川県", "千葉県", "埼玉県",
  "愛知県", "京都府", "大阪府", "兵庫県", "広島県", "福岡県",
];

// 新規顧客の初期値
const newCustomer = () => ({
  id: `C-${Math.floor(Math.random() * 9000 + 1000)}`,
  // 基本情報
  companyName: "",
  legalForm: "株式会社",
  corporateNumber: "",
  representativeName: "",
  representativeTitle: "代表取締役",
  establishedDate: "",
  // 会社情報
  capitalJpy: "",
  employees: "",
  industry: "電気機器製造業",
  businessDetail: "",
  fiscalMonth: 3,
  listingType: "非上場",
  // 本店所在地・連絡先
  postalCode: "",
  prefecture: "東京都",
  city: "",
  addressLine: "",
  headPhone: "",
  headFax: "",
  website: "",
  // ご担当窓口
  contactDepartment: "",
  contactPerson: "",
  contactTitle: "",
  contactPhone: "",
  contactEmail: "",
  // 取引条件
  tradeStatus: "new",
  usePurpose: "社宅利用",
  contractType: "普通借家",
  standardTerm: "2年",
  guaranteeCompany: "",
  // 緊急連絡先
  emergencyName: "",
  emergencyRelation: "",
  emergencyPhone: "",
  // 取引履歴
  tradeStartDate: "",
  salesOwner: "",
  lastContact: "",
  notes: "",
  // コンプライアンス
  antisocialChecked: false,
  antisocialCheckedAt: "",
  privacyConsent: false,
});

// ============= UI Primitives =============
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
    accent === "compliance"
      ? "bg-rose-50 border-rose-200 text-rose-800"
      : accent === "contact"
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
// 法人登録/編集/コピー ダイアログ
// ====================================================================
function CustomerFormDialog({ open, initial, mode = "new", onSave, onClose }) {
  const [form, setForm] = useState(initial || newCustomer());

  React.useEffect(() => {
    setForm(initial || newCustomer());
  }, [initial, open]);

  if (!open) return null;

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const labels = {
    new: { title: "新規顧客の登録", sub: "新たに顧客を登録します", button: "顧客を登録" },
    edit: { title: "顧客情報の編集", sub: "既存顧客の情報を更新します", button: "変更を保存" },
    copy: { title: "法人をコピーして登録", sub: "既存法人の情報をベースに新規登録します", button: "コピーして登録" },
  };
  const L = labels[mode] || labels.new;

  const handleSave = () => {
    if (!form.companyName.trim() || !form.industry) {
      alert("必須項目（法人名 / 顧客名・業種）を入力してください");
      return;
    }
    onSave(form);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-md shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
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

        <div className="flex-1 overflow-y-auto p-5">
          {/* 基本情報 */}
          <Section title="基本情報">
            <div className="grid grid-cols-6 gap-3">
              <Field label="法人名 / 顧客名" required span={4}>
                <input value={form.companyName} onChange={(e) => set("companyName", e.target.value)} placeholder="株式会社○○ または 顧客名" className={txt} />
              </Field>
              <Field label="法人形態" span={2}>
                <select value={form.legalForm} onChange={(e) => set("legalForm", e.target.value)} className={txt}>
                  {LEGAL_FORMS.map((f) => <option key={f}>{f}</option>)}
                </select>
              </Field>
              <Field label="代表者役職" span={2}>
                <input value={form.representativeTitle} onChange={(e) => set("representativeTitle", e.target.value)} placeholder="代表取締役社長" className={txt} />
              </Field>
              <Field label="業種" required span={2}>
                <select value={form.industry} onChange={(e) => set("industry", e.target.value)} className={txt}>
                  {INDUSTRIES.map((i) => <option key={i}>{i}</option>)}
                </select>
              </Field>
            </div>
          </Section>

          {/* 会社情報 */}
          <Section title="会社情報">
            <div className="grid grid-cols-6 gap-3">
              <Field label="資本金（円）" span={2}>
                <input type="number" value={form.capitalJpy} onChange={(e) => set("capitalJpy", e.target.value)} placeholder="100000000" className={`${txt} text-right`} />
              </Field>
              <Field label="従業員数" span={2}>
                <input type="number" value={form.employees} onChange={(e) => set("employees", e.target.value)} placeholder="1200" className={`${txt} text-right`} />
              </Field>
              <Field label="上場区分" span={2}>
                <select value={form.listingType} onChange={(e) => set("listingType", e.target.value)} className={txt}>
                  {LISTING_TYPES.map((l) => <option key={l}>{l}</option>)}
                </select>
              </Field>
            </div>
          </Section>

          {/* 所在地・連絡先 */}
          <Section title="所在地・連絡先" accent="contact">
            <div className="grid grid-cols-6 gap-3">
              <Field label="郵便番号" span={1}>
                <input value={form.postalCode} onChange={(e) => set("postalCode", e.target.value)} placeholder="100-0001" className={`${txt} font-mono`} />
              </Field>
              <Field label="都道府県" required span={1}>
                <select value={form.prefecture} onChange={(e) => set("prefecture", e.target.value)} className={txt}>
                  {PREFECTURES.map((p) => <option key={p}>{p}</option>)}
                </select>
              </Field>
              <Field label="市区町村" required span={2}>
                <input value={form.city} onChange={(e) => set("city", e.target.value)} placeholder="千代田区" className={txt} />
              </Field>
              <Field label="番地・建物名" required span={2}>
                <input value={form.addressLine} onChange={(e) => set("addressLine", e.target.value)} placeholder="千代田1-1 ○○ビル12F" className={txt} />
              </Field>
              <Field label="代表電話" span={3}>
                <input value={form.headPhone} onChange={(e) => set("headPhone", e.target.value)} placeholder="03-1234-5678" className={txt} />
              </Field>
              <Field label="公式サイトURL" span={3}>
                <input value={form.website} onChange={(e) => set("website", e.target.value)} placeholder="https://example.co.jp" className={txt} />
              </Field>
            </div>
          </Section>

          {/* ご担当窓口（部署・役職のみ。個人情報は保持しません） */}
          <Section title="ご担当窓口" accent="contact">
            <div className="grid grid-cols-6 gap-3">
              <Field label="担当部署" span={3}>
                <input value={form.contactDepartment} onChange={(e) => set("contactDepartment", e.target.value)} placeholder="総務部" className={txt} />
              </Field>
              <Field label="担当役職" span={3}>
                <input value={form.contactTitle} onChange={(e) => set("contactTitle", e.target.value)} placeholder="部長" className={txt} />
              </Field>
            </div>
            <p className="text-[10px] text-slate-400 mt-2">※ 担当者の氏名・個人電話・個人メールは本システムでは保持しません。</p>
          </Section>

          {/* 取引情報 */}
          <Section title="取引情報">
            <div className="grid grid-cols-6 gap-3">
              <Field label="取引ステータス" span={2}>
                <select value={form.tradeStatus} onChange={(e) => set("tradeStatus", e.target.value)} className={txt}>
                  {TRADE_STATUSES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
                </select>
              </Field>
              <Field label="主な利用目的" span={2}>
                <select value={form.usePurpose} onChange={(e) => set("usePurpose", e.target.value)} className={txt}>
                  {USE_PURPOSES.map((u) => <option key={u}>{u}</option>)}
                </select>
              </Field>
              <Field label="担当営業" span={2}>
                <input value={form.salesOwner} onChange={(e) => set("salesOwner", e.target.value)} placeholder="サンプル" className={txt} />
              </Field>
              <Field label="最終接触日" span={2}>
                <input type="date" value={form.lastContact} onChange={(e) => set("lastContact", e.target.value)} className={txt} />
              </Field>
              <Field label="備考" span={6}>
                <textarea value={form.notes} onChange={(e) => set("notes", e.target.value)} rows={2} placeholder="特記事項・営業時の補足など" className={txt} />
              </Field>
            </div>
          </Section>
        </div>

        <div className="px-5 py-3 border-t border-slate-200 flex items-center justify-end gap-2 bg-slate-50">
          <button onClick={onClose} className="px-3 py-1.5 text-[12px] border border-slate-300 rounded text-slate-700 hover:bg-slate-50">
            キャンセル
          </button>
          <button onClick={handleSave} className="px-4 py-1.5 text-[12px] font-bold text-white rounded bg-brand hover:bg-brand-dark">
            {L.button}
          </button>
        </div>
      </div>
    </div>
  );
}

// ====================================================================
// 法人詳細ダイアログ
// ====================================================================
function CustomerDetailDialog({ open, customer, onEdit, onClose }) {
  if (!open || !customer) return null;
  const c = customer;
  const status = TRADE_STATUSES.find((s) => s.id === c.tradeStatus);

  const Row = ({ label, value }) => (
    <div className="flex py-1.5 border-b border-slate-100 last:border-b-0">
      <span className="w-36 flex-shrink-0 text-[11px] text-slate-500">{label}</span>
      <span className="text-[12px] text-slate-800 flex-1 break-words">{value || <span className="text-slate-300">-</span>}</span>
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
        <div className="px-5 py-4 border-b border-slate-200 bg-gradient-to-r from-brand-light/50 to-white">
          <div className="flex items-start justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="text-[10px] font-mono text-slate-500">{c.id}</span>
                <span className="text-[10px] px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded">{c.legalForm}</span>
                {status && (
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${statusBadge(c.tradeStatus)}`}>
                    {status.label}
                  </span>
                )}
              </div>
              <h2 className="text-[18px] font-bold text-slate-900">{c.companyName}</h2>
              <div className="text-[11px] text-slate-600 mt-1">
                {c.industry || "—"}
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button onClick={() => onEdit(c)} className="px-3 py-1.5 text-[11px] font-bold text-white rounded bg-brand hover:bg-brand-dark inline-flex items-center gap-1">
                <Edit3 className="w-3 h-3" />
                編集
              </button>
              <button onClick={onClose} className="w-8 h-8 inline-flex items-center justify-center rounded hover:bg-slate-100 text-slate-500">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          <SectionTitle>基本情報</SectionTitle>
          <div>
            <Row label="法人形態" value={c.legalForm} />
            <Row label="代表者役職" value={c.representativeTitle} />
            <Row label="業種" value={c.industry} />
          </div>

          <SectionTitle>会社情報</SectionTitle>
          <div>
            <Row label="資本金" value={c.capitalJpy ? `¥${Number(c.capitalJpy).toLocaleString()}` : null} />
            <Row label="従業員数" value={c.employees ? `${Number(c.employees).toLocaleString()} 名` : null} />
            <Row label="上場区分" value={c.listingType} />
          </div>

          <SectionTitle>所在地・連絡先</SectionTitle>
          <div>
            <Row label="郵便番号" value={c.postalCode} />
            <Row label="住所" value={c.postalCode ? `〒${c.postalCode} ${c.prefecture}${c.city}${c.addressLine}` : `${c.prefecture || ""}${c.city || ""}${c.addressLine || ""}`} />
            <Row label="代表電話" value={c.headPhone} />
            <Row label="公式サイト" value={c.website ? <a href={c.website} target="_blank" rel="noopener noreferrer" className="text-brand hover:underline inline-flex items-center gap-1">{c.website}<ExternalLink className="w-3 h-3" /></a> : null} />
          </div>

          <SectionTitle>ご担当窓口</SectionTitle>
          <div>
            <Row label="担当部署" value={c.contactDepartment} />
            <Row label="担当役職" value={c.contactTitle} />
            <Row label="担当者個人情報" value={<span className="text-secure">{PII_FREE_NOTE}</span>} />
          </div>

          <SectionTitle>取引情報</SectionTitle>
          <div>
            <Row label="取引ステータス" value={status?.label} />
            <Row label="利用目的" value={c.usePurpose} />
            <Row label="担当営業" value={c.salesOwner} />
            <Row label="最終接触日" value={c.lastContact} />
            <Row label="備考" value={c.notes} />
          </div>

          {/* 連携している社内ツール */}
          <SectionTitle>連携している社内ツール</SectionTitle>
          <div className="text-[10px] text-slate-500 mb-2">
            この顧客は以下の社内ツールにも登録されています。各ツールの詳細ページを新規タブで開けます。
          </div>
          <div className="grid grid-cols-2 gap-2">
            {getCustomerPortalLinks(c.id).map((link) => (
              <a
                key={link.key}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center justify-between px-3 py-2.5 rounded border transition group ${
                  link.primary ? "border-brand bg-brand-light hover:bg-brand-light/70" : "border-slate-200 hover:border-slate-400 hover:bg-slate-50"
                }`}
              >
                <div className="min-w-0">
                  <div className={`text-[12px] font-bold ${link.primary ? "text-brand-dark" : "text-slate-800"}`}>
                    {link.name}
                  </div>
                  <div className="text-[9px] text-slate-500 font-mono truncate">{link.url}</div>
                </div>
                <ExternalLink className={`w-3.5 h-3.5 flex-shrink-0 ml-2 ${link.primary ? "text-brand" : "text-slate-400 group-hover:text-slate-700"}`} />
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

  const downloadTemplate = () => {
    const headers = [
      "法人名", "法人形態", "法人番号", "代表者役職", "設立年月日",
      "資本金", "従業員数", "業種", "主な事業内容", "決算月", "上場区分",
      "郵便番号", "都道府県", "市区町村", "番地・建物名",
      "代表電話", "FAX", "公式サイトURL",
      "担当部署", "担当役職",
      "取引ステータス", "利用目的", "契約形態", "標準入居期間", "連帯保証会社",
      "取引開始日", "備考",
      "反社確認済", "反社確認日"
    ];
    const sample = [
      "サンプルA株式会社", "株式会社", "1234567890123", "代表取締役社長", "1985-04-01",
      "100000000", "1200", "電気機器製造業", "産業用電気機器の製造・販売", "3", "東証プライム",
      "100-0001", "東京都", "千代田区", "千代田1-1 千代田ビル12F",
      "03-1234-5678", "03-1234-5679", "https://sunrise-denki.example.co.jp",
      "総務部", "部長",
      "active", "社宅利用", "普通借家", "2年", "全国賃貸保証株式会社",
      "2018-04-01", "新卒社員向け社宅手配を毎年依頼",
      "TRUE", "2024-04-01"
    ];
    const csv = headers.join(",") + "\n" + sample.map((s) => `"${s}"`).join(",");
    const bom = "\uFEFF";
    const blob = new Blob([bom + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "leopalace_customer_template.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-md shadow-xl w-full max-w-xl">
        <div className="px-5 py-3 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-[15px] font-bold text-slate-900 flex items-center gap-2">
            <ArrowUpFromLine className="w-4 h-4 text-brand" />
            CSV ファイルで法人を一括取込
          </h2>
          <button onClick={onClose} className="w-8 h-8 inline-flex items-center justify-center rounded hover:bg-slate-100 text-slate-500">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="bg-sky-50 border border-sky-200 rounded p-3 flex items-start gap-2">
            <Info className="w-4 h-4 text-sky-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1 text-[11px] text-sky-900">
              <div className="font-bold mb-0.5">取込前にテンプレートをダウンロード</div>
              <div>法人契約に必要な全項目（37列）が含まれています。列ヘッダの順序を保ったまま、行を追加してアップロードしてください。</div>
            </div>
            <button onClick={downloadTemplate} className="text-[11px] px-2 py-1 bg-white border border-sky-300 text-sky-700 rounded hover:bg-sky-50 inline-flex items-center gap-1 flex-shrink-0">
              <Download className="w-3 h-3" />
              テンプレートDL
            </button>
          </div>

          <label
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            className={`block border-2 border-dashed rounded-md p-8 text-center cursor-pointer transition ${
              dragOver ? "border-brand bg-brand-light" : file ? "border-emerald-300 bg-emerald-50" : "border-slate-300 bg-slate-50 hover:border-brand hover:bg-brand-light/30"
            }`}
          >
            <input type="file" accept=".csv" onChange={(e) => { const f = e.target.files?.[0]; if (f) setFile(f); }} className="hidden" />
            {file ? (
              <>
                <FileSpreadsheet className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
                <div className="text-[13px] font-bold text-slate-900">{file.name}</div>
                <div className="text-[10px] text-slate-500 mt-1">{(file.size / 1024).toFixed(1)} KB</div>
                <button onClick={(e) => { e.preventDefault(); setFile(null); }} className="mt-2 text-[10px] text-rose-600 hover:underline">
                  別のファイルを選択
                </button>
              </>
            ) : (
              <>
                <Upload className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                <div className="text-[13px] font-bold text-slate-700">CSV ファイルをドロップ</div>
                <div className="text-[11px] text-slate-500 mt-1">または<span className="text-brand font-medium underline">クリックして選択</span></div>
                <div className="text-[9px] text-slate-400 mt-2">UTF-8（BOM付き）/ 最大 10MB</div>
              </>
            )}
          </label>

          <div className="text-[11px] space-y-1.5">
            <label className="flex items-center gap-2">
              <input type="checkbox" defaultChecked className="rounded text-brand" />
              <span className="text-slate-700">既存法人はスキップ（重複ID）</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" className="rounded text-brand" />
              <span className="text-slate-700">取込結果をメールで通知</span>
            </label>
          </div>
        </div>

        <div className="px-5 py-3 border-t border-slate-200 flex items-center justify-end gap-2 bg-slate-50">
          <button onClick={onClose} className="px-3 py-1.5 text-[12px] border border-slate-300 rounded text-slate-700 hover:bg-slate-50">
            キャンセル
          </button>
          <button onClick={() => { if (!file) { alert("CSVファイルを選択してください"); return; } onImport(file); }} disabled={!file} className="px-4 py-1.5 text-[12px] font-bold text-white rounded bg-brand hover:bg-brand-dark disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-1">
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
export default function Customers() {
  const [customers, setCustomers] = useState(CUSTOMERS);
  const [query, setQuery] = useState("");
  const [industryFilter, setIndustryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [purposeFilter, setPurposeFilter] = useState("all");

  const [showImport, setShowImport] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formMode, setFormMode] = useState("new");
  const [showForm, setShowForm] = useState(false);
  const [detail, setDetail] = useState(null);
  const [page, setPage] = useState(1);
  const pageSize = 5;

  const filtered = useMemo(() => {
    return customers.filter((c) => {
      if (query) {
        const q = query.toLowerCase();
        if (
          !c.companyName?.toLowerCase().includes(q) &&
          !c.id?.toLowerCase().includes(q) &&
          !c.industry?.toLowerCase().includes(q)
        ) return false;
      }
      if (industryFilter !== "all" && c.industry !== industryFilter) return false;
      if (statusFilter !== "all" && c.tradeStatus !== statusFilter) return false;
      if (purposeFilter !== "all" && c.usePurpose !== purposeFilter) return false;
      return true;
    });
  }, [query, industryFilter, statusFilter, purposeFilter, customers]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paged = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  React.useEffect(() => {
    setPage(1);
  }, [query, industryFilter, statusFilter, purposeFilter, customers.length]);

  const openNew = () => { setEditing(null); setFormMode("new"); setShowForm(true); };
  const openEdit = (c) => { setEditing(c); setFormMode("edit"); setShowForm(true); };
  const openCopy = (c) => {
    const copied = {
      ...c,
      id: `C-${Math.floor(Math.random() * 9000 + 1000)}`,
      companyName: `${c.companyName}（コピー）`,
    };
    setEditing(copied); setFormMode("copy"); setShowForm(true);
  };
  const closeForm = () => { setShowForm(false); setEditing(null); };

  const handleSave = (form) => {
    if (formMode === "edit") {
      setCustomers((prev) => prev.map((c) => (c.id === form.id ? { ...c, ...form } : c)));
    } else {
      setCustomers((prev) => [form, ...prev]);
    }
    closeForm();
  };

  const handleDelete = (id) => {
    if (window.confirm("この法人を削除しますか？")) {
      setCustomers((prev) => prev.filter((c) => c.id !== id));
      setDetail(null);
    }
  };

  const handleImport = (file) => {
    alert(`「${file.name}」を取込キューに登録しました。\n処理完了後、通知でお知らせします。`);
    setShowImport(false);
  };

  return (
    <div className="p-5 space-y-3">
      {/* 価値説明バナー */}
      <div className="bg-gradient-to-r from-brand-light to-white border border-brand/20 rounded-md px-4 py-3 flex items-start gap-3">
        <div className="w-9 h-9 rounded bg-brand/10 flex items-center justify-center flex-shrink-0">
          <Layers className="w-4 h-4 text-brand-dark" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[13px] font-bold text-slate-900">
            社内の複数の顧客管理ツールに散在する情報を、顧客マスタとして一元管理しています
          </div>
          <div className="text-[11px] text-slate-600 mt-1 leading-relaxed">
            顧客管理システム (CRM)・営業支援システム (SFA)・契約管理システム・請求/経理システムなど、
            社内の各ツールに別々に登録される同じ情報を、
            <span className="font-bold text-brand-dark">重複排除されたユニークなマスタ</span>
            としてここで管理しています。各社内ツールの詳細ページへのリンクは、行末のリンクボタン、または詳細表示から開けます。
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
              placeholder="法人名 / 顧客名・業種・顧客IDで検索"
              className="w-72 pl-8 pr-3 py-1.5 text-[12px] bg-slate-50 border border-slate-200 rounded"
            />
          </div>
          <select value={industryFilter} onChange={(e) => setIndustryFilter(e.target.value)} className="text-[11px] border border-slate-300 rounded px-2 py-1.5">
            <option value="all">全業種</option>
            {INDUSTRIES.map((i) => <option key={i} value={i}>{i}</option>)}
          </select>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="text-[11px] border border-slate-300 rounded px-2 py-1.5">
            <option value="all">全ステータス</option>
            {TRADE_STATUSES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>
          <select value={purposeFilter} onChange={(e) => setPurposeFilter(e.target.value)} className="text-[11px] border border-slate-300 rounded px-2 py-1.5">
            <option value="all">全利用目的</option>
            {USE_PURPOSES.map((u) => <option key={u} value={u}>{u}</option>)}
          </select>
          <div className="text-[11px] text-slate-500 ml-2">
            <span className="font-bold text-slate-900">{filtered.length}</span> / {customers.length} 件
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowImport(true)} className="px-3 py-1.5 text-[12px] border border-slate-300 rounded text-slate-700 hover:bg-slate-50 inline-flex items-center gap-1">
            <ArrowUpFromLine className="w-3.5 h-3.5" />
            CSV取込
          </button>
          <button className="px-3 py-1.5 text-[12px] border border-slate-300 rounded text-slate-700 hover:bg-slate-50 inline-flex items-center gap-1">
            <Download className="w-3.5 h-3.5" />
            CSV出力
          </button>
          <button onClick={openNew} className="px-3 py-1.5 text-[12px] font-bold text-white rounded bg-brand hover:bg-brand-dark inline-flex items-center gap-1">
            <Plus className="w-3.5 h-3.5" />
            顧客を追加
          </button>
        </div>
      </div>

      {/* 一覧テーブル */}
      <div className="bg-white border border-slate-200 rounded-md overflow-hidden">
        <table className="w-full text-[12px]">
          <thead className="bg-slate-50">
            <tr className="text-left text-slate-600 border-b border-slate-200">
              <th className="px-4 py-2.5 font-medium">法人名 / 顧客名</th>
              <th className="px-4 py-2.5 font-medium">業種</th>
              <th className="px-4 py-2.5 font-medium">本社所在地</th>
              <th className="px-4 py-2.5 font-medium">ステータス</th>
              <th className="px-4 py-2.5 font-medium">利用目的</th>
              <th className="px-4 py-2.5 font-medium">担当部署</th>
              <th className="px-4 py-2.5 font-medium">担当営業</th>
              <th className="px-4 py-2.5 font-medium">最終接触</th>
              <th className="px-4 py-2.5 font-medium w-44">操作</th>
            </tr>
          </thead>
          <tbody>
            {paged.map((c) => {
              const status = TRADE_STATUSES.find((s) => s.id === c.tradeStatus);
              return (
                <tr key={c.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <div className="font-bold text-slate-900">{c.companyName}</div>
                    <div className="text-[10px] text-slate-500 font-mono">{c.id} / {c.legalForm}</div>
                  </td>
                  <td className="px-4 py-3 text-slate-700">{c.industry}</td>
                  <td className="px-4 py-3 text-slate-700 text-[11px]">
                    {c.prefecture}{c.city}
                  </td>
                  <td className="px-4 py-3">
                    {status && (
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${statusBadge(c.tradeStatus)}`}>
                        {status.label}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-700 text-[11px]">{c.usePurpose}</td>
                  <td className="px-4 py-3 text-slate-700">
                    <div className="text-[12px]">{c.contactDepartment || "—"}</div>
                  </td>
                  <td className="px-4 py-3 text-slate-700">{c.salesOwner}</td>
                  <td className="px-4 py-3 text-slate-700 text-[11px]">{c.lastContact}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => setDetail(c)} className="w-7 h-7 inline-flex items-center justify-center rounded hover:bg-sky-50 text-slate-500 hover:text-sky-600" title="詳細">
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => openEdit(c)} className="w-7 h-7 inline-flex items-center justify-center rounded hover:bg-amber-50 text-slate-500 hover:text-amber-600" title="編集">
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => openCopy(c)} className="w-7 h-7 inline-flex items-center justify-center rounded hover:bg-indigo-50 text-slate-500 hover:text-indigo-600" title="この法人をコピーして新規登録">
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <div className="relative group">
                        <a href={getCustomerPortalLinks(c.id)[0].url} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="w-7 h-7 inline-flex items-center justify-center rounded hover:bg-emerald-50 text-slate-500 hover:text-emerald-600" title="社内ツールの詳細ページを開く（クリックでCRM、ホバーで全ツール）">
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                        <div className="absolute right-0 top-full mt-1 w-52 bg-white border border-slate-200 rounded-md shadow-lg hidden group-hover:block z-20">
                          <div className="px-3 py-2 border-b border-slate-100 text-[10px] font-bold text-slate-500">
                            連携している社内ツール
                          </div>
                          {getCustomerPortalLinks(c.id).map((link) => (
                            <a key={link.key} href={link.url} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className={`flex items-center justify-between px-3 py-1.5 text-[11px] hover:bg-slate-50 ${link.primary ? "font-bold text-brand-dark" : "text-slate-700"}`}>
                              <span>{link.name}</span>
                              <ExternalLink className="w-3 h-3 text-slate-400" />
                            </a>
                          ))}
                        </div>
                      </div>
                      <button onClick={() => handleDelete(c.id)} className="w-7 h-7 inline-flex items-center justify-center rounded hover:bg-rose-50 text-slate-500 hover:text-rose-600" title="削除">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="px-4 py-12 text-center text-[12px] text-slate-400">
            <Building2 className="w-8 h-8 mx-auto mb-2 text-slate-300" />
            該当する顧客はありません
          </div>
        )}

        {/* ページネーション */}
        {filtered.length > 0 && (
          <div className="px-4 py-3 flex items-center justify-between border-t border-slate-100 text-[11px]">
            <div className="text-slate-500">
              <span className="font-medium text-slate-700">
                {(currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, filtered.length)}
              </span>
              <span className="mx-1">/</span>
              <span>{filtered.length} 件</span>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage(1)} disabled={currentPage === 1} className="px-2 py-1 border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed">«</button>
              <button onClick={() => setPage(currentPage - 1)} disabled={currentPage === 1} className="px-2 py-1 border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed">‹</button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button key={p} onClick={() => setPage(p)} className={`min-w-[28px] px-2 py-1 border rounded font-medium ${p === currentPage ? "bg-brand text-white border-brand" : "border-slate-200 text-slate-700 hover:bg-slate-50"}`}>{p}</button>
              ))}
              <button onClick={() => setPage(currentPage + 1)} disabled={currentPage === totalPages} className="px-2 py-1 border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed">›</button>
              <button onClick={() => setPage(totalPages)} disabled={currentPage === totalPages} className="px-2 py-1 border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed">»</button>
            </div>
          </div>
        )}
      </div>

      {/* ダイアログ群 */}
      <CustomerFormDialog
        open={showForm}
        initial={editing}
        mode={formMode}
        onSave={handleSave}
        onClose={closeForm}
      />
      <CustomerDetailDialog
        open={Boolean(detail)}
        customer={detail}
        onEdit={(c) => { setDetail(null); openEdit(c); }}
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
