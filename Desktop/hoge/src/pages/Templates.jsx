import React, { useState, useMemo } from "react";
import {
  Search,
  Plus,
  Edit3,
  Copy,
  Trash2,
  Eye,
  X,
  FileSpreadsheet,
  FileText,
  LayoutTemplate,
  Star,
  CheckCircle2,
  Layers,
} from "lucide-react";

// ====================================================================
// テンプレートデータ
// ====================================================================
const INITIAL_TEMPLATES = [
  {
    id: "T-001",
    name: "標準Excel - 物件一覧（8列）",
    format: "excel",
    category: "標準",
    desc: "1物件1行・基本項目のみ。顧客向け標準フォーマット",
    sections: ["カバーレター", "物件詳細", "費用試算"],
    columns: ["物件名", "所在地", "最寄駅", "賃料", "管理費", "間取り", "面積", "築年数"],
    pages: "可変",
    isDefault: true,
    version: "v2.4",
    usedThisMonth: 18,
    updatedAt: "2026/04/10",
    updatedBy: "サンプル 四郎",
    notes: "もっとも汎用的な提案フォーマット。新規顧客向けにはまずこれ。",
  },
  {
    id: "T-002",
    name: "詳細PDF - 物件カタログ",
    format: "pdf",
    category: "詳細",
    desc: "1物件1ページ・写真・間取り図・周辺マップ付き",
    sections: ["カバーレター", "物件詳細", "比較表", "地図ページ"],
    columns: ["物件名", "賃料", "間取り", "面積", "設備", "築年数", "アクセス"],
    pages: "可変（1物件1ページ）",
    isDefault: true,
    version: "v3.1",
    usedThisMonth: 5,
    updatedAt: "2026/04/15",
    updatedBy: "サンプル 四郎",
    notes: "写真・地図を多用する高品質提案フォーマット。",
  },
  {
    id: "T-003",
    name: "建設業向け - 現場社員寮提案書",
    format: "excel",
    category: "業種別",
    desc: "複数名同時入居前提。距離・台数・備考欄を追加",
    sections: ["カバーレター", "物件詳細"],
    columns: ["物件名", "所在地", "現場距離", "空室数", "賃料", "間取り", "備考"],
    pages: "可変",
    isDefault: false,
    version: "v1.3",
    usedThisMonth: 3,
    updatedAt: "2026/05/12",
    updatedBy: "サンプル",
    notes: "建設業の現場入居案件専用。最寄り現場までの距離・複数名対応可否を可視化。",
  },
  {
    id: "T-004",
    name: "比較重視 - 横並び比較シート",
    format: "excel",
    category: "比較",
    desc: "複数物件を横に並べて条件比較が一目で分かる",
    sections: ["カバーレター", "比較表"],
    columns: ["項目", "候補1", "候補2", "候補3"],
    pages: 1,
    isDefault: false,
    version: "v1.0",
    usedThisMonth: 7,
    updatedAt: "2026/02/18",
    updatedBy: "サンプル 二郎",
    notes: "「ベスト3を一覧で見たい」というご要望に応えるフォーマット。",
  },
  {
    id: "T-005",
    name: "プレミアム - 役員向け短期出張提案",
    format: "pdf",
    category: "プレミアム",
    desc: "ハイグレード物件・写真豊富・コンシェルジュ案内付き",
    sections: ["カバーレター", "物件詳細", "費用試算", "会社案内"],
    columns: ["物件名", "賃料", "面積", "コンシェルジュ", "アクセス"],
    pages: "可変",
    isDefault: false,
    version: "v2.0",
    usedThisMonth: 2,
    updatedAt: "2026/03/22",
    updatedBy: "サンプル 三郎",
    notes: "海外駐在員・役員向け。空港送迎・24時間フロント物件を中心に。",
  },
  {
    id: "T-006",
    name: "シンプル - 即入居・スピード提案",
    format: "pdf",
    category: "短期",
    desc: "即入居可物件に絞った1ページ完結フォーマット",
    sections: ["カバーレター", "物件詳細"],
    columns: ["物件名", "賃料", "間取り", "アクセス", "即入居可否"],
    pages: 1,
    isDefault: false,
    version: "v1.5",
    usedThisMonth: 11,
    updatedAt: "2026/01/20",
    updatedBy: "サンプル 二郎",
    notes: "出張・短期案件用。スピード重視。",
  },
];

const FORMATS = [
  { id: "excel", label: "Excel", color: "emerald" },
  { id: "pdf", label: "PDF", color: "rose" },
];

const CATEGORIES = ["標準", "詳細", "業種別", "比較", "プレミアム", "短期", "その他"];

const ALL_SECTIONS = [
  "カバーレター",
  "物件詳細",
  "比較表",
  "地図ページ",
  "費用試算",
  "会社案内",
  "周辺施設",
  "問合せフォーム",
];

const ALL_COLUMNS = [
  "物件名", "所在地", "最寄駅", "賃料", "管理費", "敷金", "礼金",
  "間取り", "専有面積", "築年数", "階数", "向き", "設備", "アクセス",
  "現場距離", "空室数", "備考", "コンシェルジュ", "即入居可否",
];

// 新規テンプレートのデフォルト
const newTemplate = () => ({
  id: `T-${String(Math.floor(Math.random() * 900 + 100))}`,
  name: "",
  format: "excel",
  category: "標準",
  desc: "",
  sections: [],
  columns: [],
  pages: "可変",
  isDefault: false,
  version: "v1.0",
  usedThisMonth: 0,
  updatedAt: new Date().toISOString().slice(0, 10).replaceAll("-", "/"),
  updatedBy: "サンプル",
  notes: "",
});

// ====================================================================
// テンプレート登録 / 編集 / コピー ダイアログ
// ====================================================================
function TemplateFormDialog({ open, initial, mode = "new", onSave, onClose }) {
  const [form, setForm] = useState(initial || newTemplate());

  React.useEffect(() => {
    setForm(initial || newTemplate());
  }, [initial, open]);

  if (!open) return null;

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));
  const toggleIn = (key, value) => {
    setForm((p) => {
      const arr = p[key] || [];
      return { ...p, [key]: arr.includes(value) ? arr.filter((x) => x !== value) : [...arr, value] };
    });
  };

  const labels = {
    new: { title: "テンプレートを新規作成", button: "テンプレートを登録" },
    edit: { title: "テンプレートを編集", button: "変更を保存" },
    copy: { title: "テンプレートをコピーして作成", button: "コピーして登録" },
  };
  const L = labels[mode] || labels.new;

  const handleSave = () => {
    if (!form.name.trim()) {
      alert("テンプレート名は必須です");
      return;
    }
    onSave(form);
  };

  const txt = "w-full px-2.5 py-1.5 border border-slate-300 rounded text-[12px] focus:outline-none focus:border-brand";

  const Field = ({ label, required, children, span = 1 }) => (
    <div className={`col-span-${span}`}>
      <label className="text-[10px] text-slate-500 mb-1 block">
        {label}{required && <span className="text-rose-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-md shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        <div className="px-5 py-3 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-[15px] font-bold text-slate-900 flex items-center gap-2">
              {mode === "copy" && <Copy className="w-4 h-4 text-brand" />}
              {L.title}
            </h2>
            <p className="text-[10px] text-slate-500 mt-0.5">
              提案資料の構成・列・推奨用途を定義します
            </p>
          </div>
          <button onClick={onClose} className="w-8 h-8 inline-flex items-center justify-center rounded hover:bg-slate-100 text-slate-500">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* 基本情報 */}
          <section>
            <h3 className="text-[12px] font-bold px-3 py-1.5 border-l-4 border-slate-200 bg-slate-50 text-slate-800 mb-3 rounded-r">
              基本情報
            </h3>
            <div className="px-2 grid grid-cols-6 gap-3">
              <Field label="テンプレート名" required span={4}>
                <input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="標準Excel - 物件一覧" className={txt} />
              </Field>
              <Field label="テンプレートID" span={2}>
                <input value={form.id} onChange={(e) => set("id", e.target.value)} className={`${txt} font-mono text-[11px]`} />
              </Field>
              <Field label="出力形式" required span={2}>
                <select value={form.format} onChange={(e) => set("format", e.target.value)} className={txt}>
                  {FORMATS.map((f) => <option key={f.id} value={f.id}>{f.label}</option>)}
                </select>
              </Field>
              <Field label="カテゴリ" span={2}>
                <select value={form.category} onChange={(e) => set("category", e.target.value)} className={txt}>
                  {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </Field>
              <Field label="ページ数" span={2}>
                <input value={form.pages} onChange={(e) => set("pages", e.target.value)} placeholder="可変 / 1 / 2" className={txt} />
              </Field>
              <Field label="バージョン" span={2}>
                <input value={form.version} onChange={(e) => set("version", e.target.value)} className={txt} />
              </Field>
              <Field label="作成・更新者" span={2}>
                <input value={form.updatedBy} onChange={(e) => set("updatedBy", e.target.value)} className={txt} />
              </Field>
              <Field label="デフォルト" span={2}>
                <label className="flex items-center gap-2 px-2 py-1.5 border border-slate-300 rounded cursor-pointer">
                  <input type="checkbox" checked={form.isDefault} onChange={(e) => set("isDefault", e.target.checked)} className="rounded text-brand" />
                  <span className="text-[12px]">既定テンプレートとして登録</span>
                </label>
              </Field>
              <Field label="概要・推奨用途" span={6}>
                <textarea value={form.desc} onChange={(e) => set("desc", e.target.value)} rows={2} placeholder="どんな案件で使うべきテンプレートか" className={txt} />
              </Field>
            </div>
          </section>

          {/* 構成セクション */}
          <section>
            <h3 className="text-[12px] font-bold px-3 py-1.5 border-l-4 border-brand bg-brand-light text-brand-dark mb-3 rounded-r">
              含めるセクション
            </h3>
            <div className="px-2 grid grid-cols-4 gap-2">
              {ALL_SECTIONS.map((s) => (
                <label key={s} className={`text-[11px] px-2 py-1.5 border rounded cursor-pointer ${
                  form.sections.includes(s) ? "border-brand bg-brand-light text-brand-dark font-bold" : "border-slate-200 text-slate-700 hover:bg-slate-50"
                }`}>
                  <input type="checkbox" checked={form.sections.includes(s)} onChange={() => toggleIn("sections", s)} className="hidden" />
                  {s}
                </label>
              ))}
            </div>
          </section>

          {/* 出力カラム */}
          <section>
            <h3 className="text-[12px] font-bold px-3 py-1.5 border-l-4 border-brand bg-brand-light text-brand-dark mb-3 rounded-r">
              出力カラム
            </h3>
            <div className="px-2 grid grid-cols-4 gap-2">
              {ALL_COLUMNS.map((c) => (
                <label key={c} className={`text-[11px] px-2 py-1.5 border rounded cursor-pointer ${
                  form.columns.includes(c) ? "border-brand bg-brand-light text-brand-dark font-bold" : "border-slate-200 text-slate-700 hover:bg-slate-50"
                }`}>
                  <input type="checkbox" checked={form.columns.includes(c)} onChange={() => toggleIn("columns", c)} className="hidden" />
                  {c}
                </label>
              ))}
            </div>
          </section>

          {/* メモ */}
          <section>
            <h3 className="text-[12px] font-bold px-3 py-1.5 border-l-4 border-slate-200 bg-slate-50 text-slate-800 mb-3 rounded-r">
              メモ・備考
            </h3>
            <div className="px-2">
              <textarea value={form.notes} onChange={(e) => set("notes", e.target.value)} rows={3} placeholder="運用上の注意・編集履歴メモなど" className={txt} />
            </div>
          </section>
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
// テンプレート詳細ダイアログ
// ====================================================================
function TemplateDetailDialog({ open, template, onEdit, onClose }) {
  if (!open || !template) return null;
  const fmt = FORMATS.find((f) => f.id === template.format);
  const FmtIcon = template.format === "excel" ? FileSpreadsheet : FileText;

  const Row = ({ label, value }) => (
    <div className="flex py-1.5 border-b border-slate-100 last:border-b-0">
      <span className="w-28 flex-shrink-0 text-[11px] text-slate-500">{label}</span>
      <span className="text-[12px] text-slate-800 flex-1">{value || <span className="text-slate-300">-</span>}</span>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-md shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="px-5 py-4 border-b border-slate-200 bg-gradient-to-r from-brand-light/50 to-white">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 min-w-0">
              <div className={`w-10 h-10 rounded flex items-center justify-center flex-shrink-0 ${
                template.format === "excel" ? "bg-emerald-50" : "bg-rose-50"
              }`}>
                <FmtIcon className={`w-5 h-5 ${template.format === "excel" ? "text-emerald-600" : "text-rose-600"}`} />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="text-[10px] font-mono text-slate-500">{template.id}</span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                    template.format === "excel" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-rose-50 text-rose-700 border-rose-200"
                  }`}>{fmt?.label}</span>
                  <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                    {template.category}
                  </span>
                  {template.isDefault && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 inline-flex items-center gap-0.5">
                      <Star className="w-2.5 h-2.5 fill-current" />
                      既定
                    </span>
                  )}
                </div>
                <h2 className="text-[16px] font-bold text-slate-900">{template.name}</h2>
                <div className="text-[11px] text-slate-600 mt-1">{template.desc}</div>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button onClick={() => onEdit(template)} className="px-3 py-1.5 text-[11px] font-bold text-white rounded bg-brand hover:bg-brand-dark inline-flex items-center gap-1">
                <Edit3 className="w-3 h-3" />
                編集
              </button>
              <button onClick={onClose} className="w-8 h-8 inline-flex items-center justify-center rounded hover:bg-slate-100 text-slate-500">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* 基本情報 */}
          <section>
            <h4 className="text-[12px] font-bold text-slate-700 mb-2 pb-1 border-b-2 border-brand inline-block pr-4">基本情報</h4>
            <div>
              <Row label="テンプレートID" value={<span className="font-mono text-[11px]">{template.id}</span>} />
              <Row label="出力形式" value={fmt?.label} />
              <Row label="カテゴリ" value={template.category} />
              <Row label="ページ数" value={template.pages} />
              <Row label="バージョン" value={template.version} />
              <Row label="今月の使用" value={`${template.usedThisMonth} 件`} />
              <Row label="更新日" value={template.updatedAt} />
              <Row label="更新者" value={template.updatedBy} />
            </div>
          </section>

          {/* セクション */}
          <section>
            <h4 className="text-[12px] font-bold text-slate-700 mb-2 pb-1 border-b-2 border-brand inline-block pr-4">含まれるセクション</h4>
            {(template.sections || []).length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {template.sections.map((s) => (
                  <span key={s} className="text-[11px] px-2 py-1 bg-brand-light text-brand-dark rounded border border-brand/20 inline-flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    {s}
                  </span>
                ))}
              </div>
            ) : (
              <div className="text-[11px] text-slate-400">セクション未設定</div>
            )}
          </section>

          {/* カラム */}
          <section>
            <h4 className="text-[12px] font-bold text-slate-700 mb-2 pb-1 border-b-2 border-brand inline-block pr-4">出力カラム</h4>
            {(template.columns || []).length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {template.columns.map((c, i) => (
                  <span key={c} className="text-[11px] px-2 py-1 bg-slate-100 text-slate-700 rounded border border-slate-200">
                    <span className="text-slate-400 mr-1">{i + 1}.</span>{c}
                  </span>
                ))}
              </div>
            ) : (
              <div className="text-[11px] text-slate-400">カラム未設定</div>
            )}
          </section>

          {/* メモ */}
          {template.notes && (
            <section>
              <h4 className="text-[12px] font-bold text-slate-700 mb-2 pb-1 border-b-2 border-brand inline-block pr-4">メモ・備考</h4>
              <p className="text-[11px] text-slate-700 leading-relaxed whitespace-pre-wrap">{template.notes}</p>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

// ====================================================================
// メイン
// ====================================================================
export default function Templates() {
  const [templates, setTemplates] = useState(INITIAL_TEMPLATES);
  const [query, setQuery] = useState("");
  const [formatFilter, setFormatFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const [editing, setEditing] = useState(null);
  const [formMode, setFormMode] = useState("new");
  const [showForm, setShowForm] = useState(false);
  const [detail, setDetail] = useState(null);
  const [page, setPage] = useState(1);
  const pageSize = 5;

  const filtered = useMemo(() => {
    return templates.filter((t) => {
      if (formatFilter !== "all" && t.format !== formatFilter) return false;
      if (categoryFilter !== "all" && t.category !== categoryFilter) return false;
      if (query) {
        const q = query.toLowerCase();
        if (
          !t.name?.toLowerCase().includes(q) &&
          !t.id?.toLowerCase().includes(q.toUpperCase()) &&
          !t.desc?.toLowerCase().includes(q)
        ) return false;
      }
      return true;
    });
  }, [templates, query, formatFilter, categoryFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paged = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  React.useEffect(() => {
    setPage(1);
  }, [query, formatFilter, categoryFilter, templates.length]);

  const openNew = () => { setEditing(null); setFormMode("new"); setShowForm(true); };
  const openEdit = (t) => { setEditing(t); setFormMode("edit"); setShowForm(true); };
  const openCopy = (t) => {
    const copied = {
      ...t,
      id: `T-${String(Math.floor(Math.random() * 900 + 100))}`,
      name: `${t.name}（コピー）`,
      isDefault: false,
      version: "v1.0",
      usedThisMonth: 0,
      updatedAt: new Date().toISOString().slice(0, 10).replaceAll("-", "/"),
      updatedBy: "サンプル",
    };
    setEditing(copied); setFormMode("copy"); setShowForm(true);
  };
  const closeForm = () => { setShowForm(false); setEditing(null); };

  const handleSave = (form) => {
    if (formMode === "edit") {
      setTemplates((prev) => prev.map((t) => (t.id === form.id ? form : t)));
    } else {
      setTemplates((prev) => [form, ...prev]);
    }
    closeForm();
  };

  const handleDelete = (id) => {
    if (window.confirm("このテンプレートを削除しますか？")) {
      setTemplates((prev) => prev.filter((t) => t.id !== id));
      setDetail(null);
    }
  };

  return (
    <div className="p-5 space-y-3">
      {/* 価値説明バナー */}
      <div className="bg-gradient-to-r from-brand-light to-white border border-brand/20 rounded-md px-4 py-3 flex items-start gap-3">
        <div className="w-9 h-9 rounded bg-brand/10 flex items-center justify-center flex-shrink-0">
          <LayoutTemplate className="w-4 h-4 text-brand-dark" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[13px] font-bold text-slate-900">
            提案テンプレートを一元管理し、案件に応じて使い分けます
          </div>
          <div className="text-[11px] text-slate-600 mt-1 leading-relaxed">
            業種・利用目的・出力形式（Excel / PDF）ごとに最適なテンプレートを用意し、提案作成時に選択するだけで一貫した品質の提案資料が作成できます。
          </div>
        </div>
      </div>

      {/* ツールバー */}
      <div className="bg-white border border-slate-200 rounded-md px-4 py-3 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="テンプレートID・名称・概要で検索"
              className="w-72 pl-8 pr-3 py-1.5 text-[12px] bg-slate-50 border border-slate-200 rounded"
            />
          </div>
          <select value={formatFilter} onChange={(e) => setFormatFilter(e.target.value)} className="text-[11px] border border-slate-300 rounded px-2 py-1.5">
            <option value="all">全形式</option>
            {FORMATS.map((f) => <option key={f.id} value={f.id}>{f.label}</option>)}
          </select>
          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="text-[11px] border border-slate-300 rounded px-2 py-1.5">
            <option value="all">全カテゴリ</option>
            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
          <div className="text-[11px] text-slate-500 ml-2">
            <span className="font-bold text-slate-900">{filtered.length}</span> / {templates.length} 件
          </div>
        </div>
        <button
          onClick={openNew}
          className="px-3 py-1.5 text-[12px] font-bold text-white rounded bg-brand hover:bg-brand-dark inline-flex items-center gap-1"
        >
          <Plus className="w-3.5 h-3.5" />
          テンプレートを新規作成
        </button>
      </div>

      {/* テーブル */}
      <div className="bg-white border border-slate-200 rounded-md overflow-hidden">
        <table className="w-full text-[12px]">
          <thead className="bg-slate-50">
            <tr className="text-left text-slate-600 border-b border-slate-200">
              <th className="px-4 py-2.5 font-medium">テンプレートID</th>
              <th className="px-4 py-2.5 font-medium">名称</th>
              <th className="px-4 py-2.5 font-medium">形式</th>
              <th className="px-4 py-2.5 font-medium">カテゴリ</th>
              <th className="px-4 py-2.5 font-medium text-right">今月使用</th>
              <th className="px-4 py-2.5 font-medium">更新</th>
              <th className="px-4 py-2.5 font-medium w-32">操作</th>
            </tr>
          </thead>
          <tbody>
            {paged.map((t) => {
              const FmtIcon = t.format === "excel" ? FileSpreadsheet : FileText;
              return (
                <tr key={t.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="px-4 py-3 font-mono text-[11px] text-slate-600">{t.id}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <FmtIcon className={`w-3.5 h-3.5 flex-shrink-0 ${t.format === "excel" ? "text-emerald-600" : "text-rose-600"}`} />
                      <div className="min-w-0">
                        <div className="font-bold text-slate-900 flex items-center gap-1 flex-wrap">
                          {t.name}
                          {t.isDefault && (
                            <span className="text-[9px] font-bold px-1 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 inline-flex items-center gap-0.5">
                              <Star className="w-2 h-2 fill-current" />
                              既定
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-500 truncate max-w-md">{t.desc}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                      t.format === "excel" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-rose-50 text-rose-700 border-rose-200"
                    }`}>
                      {t.format.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-700 text-[11px]">{t.category}</td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-[12px] font-bold text-slate-900">{t.usedThisMonth}</span>
                    <span className="text-[10px] text-slate-500"> 件</span>
                  </td>
                  <td className="px-4 py-3 text-[10px] text-slate-600">
                    <div>{t.updatedAt}</div>
                    <div className="text-slate-500">{t.updatedBy}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => setDetail(t)} className="w-7 h-7 inline-flex items-center justify-center rounded hover:bg-sky-50 text-slate-500 hover:text-sky-600" title="詳細">
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => openEdit(t)} className="w-7 h-7 inline-flex items-center justify-center rounded hover:bg-amber-50 text-slate-500 hover:text-amber-600" title="編集">
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => openCopy(t)} className="w-7 h-7 inline-flex items-center justify-center rounded hover:bg-indigo-50 text-slate-500 hover:text-indigo-600" title="このテンプレートをコピーして新規作成">
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleDelete(t.id)} className="w-7 h-7 inline-flex items-center justify-center rounded hover:bg-rose-50 text-slate-500 hover:text-rose-600" title="削除">
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
            <Layers className="w-8 h-8 mx-auto mb-2 text-slate-300" />
            該当するテンプレートはありません
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

      {/* ダイアログ */}
      <TemplateFormDialog
        open={showForm}
        initial={editing}
        mode={formMode}
        onSave={handleSave}
        onClose={closeForm}
      />
      <TemplateDetailDialog
        open={Boolean(detail)}
        template={detail}
        onEdit={(t) => { setDetail(null); openEdit(t); }}
        onClose={() => setDetail(null)}
      />
    </div>
  );
}
