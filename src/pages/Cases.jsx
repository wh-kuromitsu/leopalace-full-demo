import React, { useState, useMemo, useRef } from "react";
import {
  Search,
  Plus,
  Download,
  Edit3,
  Trash2,
  Eye,
  X,
  Copy,
  CheckCircle2,
  Circle,
  Clock,
  AlertCircle,
  PauseCircle,
  Layers,
  Building2,
  Paperclip,
  Upload,
  FileText,
  FileSpreadsheet,
  FileImage,
  File as FileIcon,
} from "lucide-react";
import {
  CASES,
  WORKFLOW_STEPS,
  STEP_STATUSES,
  CASE_STATUSES,
  CASE_PURPOSES,
  INTAKE_CHANNELS,
  ATTACHMENT_CATEGORIES,
  attachmentCategoryBadge,
  stepStatusBadge,
  caseStatusBadge,
  defaultWorkflow,
} from "../data/casesData";
import { CUSTOMERS } from "../data/customersData";
import { USERS, CURRENT_USER } from "../data/usersData";

// 担当者選択肢（USERSから氏名のみ）
const ASSIGNEE_OPTIONS = USERS.map((u) => u.name);

// ファイル拡張子からアイコン・色を返す
const getFileIcon = (filename = "") => {
  const ext = filename.split(".").pop()?.toLowerCase();
  if (ext === "pdf") return { Icon: FileText, color: "text-rose-600", bg: "bg-rose-50" };
  if (["xlsx", "xls", "csv"].includes(ext)) return { Icon: FileSpreadsheet, color: "text-emerald-600", bg: "bg-emerald-50" };
  if (["docx", "doc"].includes(ext)) return { Icon: FileText, color: "text-sky-600", bg: "bg-sky-50" };
  if (["png", "jpg", "jpeg", "gif", "webp"].includes(ext)) return { Icon: FileImage, color: "text-purple-600", bg: "bg-purple-50" };
  return { Icon: FileIcon, color: "text-slate-500", bg: "bg-slate-100" };
};

// バイト数をフォーマット
const formatSize = (bytes) => {
  if (!bytes && bytes !== 0) return "-";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

// 現在日時を「YYYY/MM/DD HH:MM」形式で返す
const nowString = () => {
  const d = new Date();
  return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
};

// 新規案件の初期値
const newCase = () => ({
  id: `REQ-2026-${String(Math.floor(Math.random() * 9000 + 1000))}-001`,
  customerId: "",
  customerName: "",
  contact: "",
  purpose: "社宅利用（長期）",
  startDate: "",
  duration: "",
  occupant: "",
  occupantCount: 1,
  workplace: "",
  preferredArea: [],
  budgetMin: "",
  budgetMax: "",
  notes: "",
  status: "active",
  receivedAt: new Date().toISOString().slice(0, 16).replace("T", " "),
  channel: "メール添付（PDF）",
  mainAssignee: ASSIGNEE_OPTIONS[0] || "",
  deadline: "",
  candidatesCount: 0,
  currentStepKey: "intake",
  progressPct: 0,
  workflow: defaultWorkflow(),
  attachments: [],
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
    accent === "workflow"
      ? "bg-brand-light border-brand text-brand-dark"
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

// 進捗バー（10ステップを%で）
const ProgressBar = ({ pct }) => (
  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
    <div
      className={`h-full transition-all ${pct >= 100 ? "bg-emerald-500" : pct >= 50 ? "bg-brand" : "bg-sky-400"}`}
      style={{ width: `${pct}%` }}
    />
  </div>
);

// ステップアイコン
function StepIcon({ status, size = "w-4 h-4" }) {
  const config = {
    done: { Icon: CheckCircle2, color: "text-emerald-500" },
    in_progress: { Icon: Clock, color: "text-sky-500" },
    blocked: { Icon: AlertCircle, color: "text-rose-500" },
    skipped: { Icon: PauseCircle, color: "text-amber-500" },
    not_started: { Icon: Circle, color: "text-slate-300" },
  };
  const c = config[status] || config.not_started;
  const Ic = c.Icon;
  return <Ic className={`${size} ${c.color}`} />;
}

// ====================================================================
// 案件 登録/編集/コピー ダイアログ
// ====================================================================
function CaseFormDialog({ open, initial, mode = "new", onSave, onClose }) {
  const [form, setForm] = useState(initial || newCase());

  React.useEffect(() => {
    setForm(initial || newCase());
  }, [initial, open]);

  if (!open) return null;

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));
  const setWorkflow = (idx, field, value) => {
    setForm((p) => ({
      ...p,
      workflow: p.workflow.map((w, i) => (i === idx ? { ...w, [field]: value } : w)),
    }));
  };

  const labels = {
    new: { title: "新規案件の登録", sub: "新たに物件契約案件を登録します", button: "案件を登録" },
    edit: { title: "案件情報の編集", sub: "既存案件の情報・進捗を更新します", button: "変更を保存" },
    copy: { title: "案件をコピーして登録", sub: "既存案件の情報をベースに新規登録します", button: "コピーして登録" },
  };
  const L = labels[mode] || labels.new;

  const handleSave = () => {
    if (!form.customerName.trim() || !form.purpose || !form.mainAssignee) {
      alert("必須項目（顧客名・利用目的・主担当者）を入力してください");
      return;
    }
    onSave(form);
  };

  // 顧客select変更時に customerName/contact も同期
  const handleCustomerChange = (id) => {
    const c = CUSTOMERS.find((x) => x.id === id);
    if (c) {
      setForm((p) => ({
        ...p,
        customerId: c.id,
        customerName: c.companyName,
        contact: `${c.contactDepartment || ""} ご担当窓口`.trim(),
      }));
    }
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
          <button onClick={onClose} className="w-8 h-8 inline-flex items-center justify-center rounded hover:bg-slate-100 text-slate-500">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {/* 案件基本情報 */}
          <Section title="案件基本情報">
            <div className="grid grid-cols-6 gap-3">
              <Field label="顧客" required span={4}>
                <select value={form.customerId} onChange={(e) => handleCustomerChange(e.target.value)} className={txt}>
                  <option value="">-- 顧客を選択 --</option>
                  {CUSTOMERS.map((c) => (
                    <option key={c.id} value={c.id}>{c.companyName}（{c.id}）</option>
                  ))}
                </select>
              </Field>
              <Field label="案件ID" span={2}>
                <input value={form.id} onChange={(e) => set("id", e.target.value)} className={`${txt} font-mono text-[11px]`} />
              </Field>
              <Field label="ご担当窓口" span={3}>
                <input value={form.contact} onChange={(e) => set("contact", e.target.value)} placeholder="総務部 サンプル 太郎" className={txt} />
              </Field>
              <Field label="受領チャネル" span={3}>
                <select value={form.channel} onChange={(e) => set("channel", e.target.value)} className={txt}>
                  {INTAKE_CHANNELS.map((c) => <option key={c}>{c}</option>)}
                </select>
              </Field>
              <Field label="利用目的" required span={3}>
                <select value={form.purpose} onChange={(e) => set("purpose", e.target.value)} className={txt}>
                  {CASE_PURPOSES.map((p) => <option key={p}>{p}</option>)}
                </select>
              </Field>
              <Field label="入居者" span={2}>
                <input value={form.occupant} onChange={(e) => set("occupant", e.target.value)} placeholder="新卒社員 3名" className={txt} />
              </Field>
              <Field label="人数" span={1}>
                <input type="number" value={form.occupantCount} onChange={(e) => set("occupantCount", Number(e.target.value))} className={`${txt} text-right`} />
              </Field>
            </div>
          </Section>

          {/* 条件 */}
          <Section title="希望条件">
            <div className="grid grid-cols-6 gap-3">
              <Field label="勤務地" span={3}>
                <input value={form.workplace} onChange={(e) => set("workplace", e.target.value)} placeholder="東京都江東区豊洲3-1-1" className={txt} />
              </Field>
              <Field label="希望エリア（カンマ区切り）" span={3}>
                <input
                  value={(form.preferredArea || []).join(", ")}
                  onChange={(e) => set("preferredArea", e.target.value.split(",").map((s) => s.trim()).filter(Boolean))}
                  placeholder="江東区, 墨田区, 中央区"
                  className={txt}
                />
              </Field>
              <Field label="利用開始" span={2}>
                <input type="date" value={form.startDate ? form.startDate.replaceAll("/", "-") : ""} onChange={(e) => set("startDate", e.target.value.replaceAll("-", "/"))} className={txt} />
              </Field>
              <Field label="利用期間" span={2}>
                <input value={form.duration} onChange={(e) => set("duration", e.target.value)} placeholder="2年間" className={txt} />
              </Field>
              <Field label="予算下限(円)" span={1}>
                <input type="number" value={form.budgetMin} onChange={(e) => set("budgetMin", e.target.value)} className={`${txt} text-right`} />
              </Field>
              <Field label="予算上限(円)" span={1}>
                <input type="number" value={form.budgetMax} onChange={(e) => set("budgetMax", e.target.value)} className={`${txt} text-right`} />
              </Field>
              <Field label="備考・特記事項" span={6}>
                <textarea value={form.notes} onChange={(e) => set("notes", e.target.value)} rows={2} className={txt} />
              </Field>
            </div>
          </Section>

          {/* 担当・期限 */}
          <Section title="担当・期限">
            <div className="grid grid-cols-6 gap-3">
              <Field label="主担当者" required span={2}>
                <select value={form.mainAssignee} onChange={(e) => set("mainAssignee", e.target.value)} className={txt}>
                  <option value="">-- 主担当を選択 --</option>
                  {ASSIGNEE_OPTIONS.map((a) => <option key={a}>{a}</option>)}
                </select>
              </Field>
              <Field label="対応期限" span={2}>
                <input type="date" value={form.deadline ? form.deadline.replaceAll("/", "-") : ""} onChange={(e) => set("deadline", e.target.value.replaceAll("-", "/"))} className={txt} />
              </Field>
              <Field label="案件ステータス" span={2}>
                <select value={form.status} onChange={(e) => set("status", e.target.value)} className={txt}>
                  {CASE_STATUSES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
                </select>
              </Field>
            </div>
          </Section>

          {/* 添付書類 */}
          <Section title="添付書類（PDF・Word・Excel・画像など）" accent="workflow">
            <AttachmentsEditor
              attachments={form.attachments || []}
              onChange={(att) => set("attachments", att)}
            />
          </Section>

          {/* ワークフロー（10ステップ） */}
          <Section title="ワークフロー:物件契約 10 ステップ管理" accent="workflow">
            <div className="text-[10px] text-slate-500 mb-2">
              各ステップの状態・担当者・開始日・完了日を細かく管理できます。担当者はシングル選択です。
            </div>
            <div className="space-y-2">
              {form.workflow.map((w, idx) => {
                const stepDef = WORKFLOW_STEPS.find((s) => s.key === w.stepKey);
                return (
                  <div key={w.stepKey} className="border border-slate-200 rounded p-2.5 bg-white">
                    <div className="flex items-center gap-2 mb-2">
                      <StepIcon status={w.status} size="w-4 h-4" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline gap-2">
                          <span className="text-[10px] font-mono text-slate-400">STEP {idx + 1}</span>
                          <span className="text-[13px] font-bold text-slate-800">{stepDef?.name}</span>
                        </div>
                        <div className="text-[10px] text-slate-500">{stepDef?.description}</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-12 gap-2 items-end">
                      <Field label="状態" span={3}>
                        <select value={w.status} onChange={(e) => setWorkflow(idx, "status", e.target.value)} className={txt}>
                          {STEP_STATUSES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
                        </select>
                      </Field>
                      <Field label="担当者" span={3}>
                        <select value={w.assignee} onChange={(e) => setWorkflow(idx, "assignee", e.target.value)} className={txt}>
                          <option value="">-- 未割当 --</option>
                          {ASSIGNEE_OPTIONS.map((a) => <option key={a}>{a}</option>)}
                        </select>
                      </Field>
                      <Field label="開始日" span={2}>
                        <input
                          type="date"
                          value={w.startedAt ? w.startedAt.replaceAll("/", "-") : ""}
                          onChange={(e) => setWorkflow(idx, "startedAt", e.target.value.replaceAll("-", "/"))}
                          className={txt}
                        />
                      </Field>
                      <Field label="完了日" span={2}>
                        <input
                          type="date"
                          value={w.completedAt ? w.completedAt.replaceAll("/", "-") : ""}
                          onChange={(e) => setWorkflow(idx, "completedAt", e.target.value.replaceAll("-", "/"))}
                          className={txt}
                        />
                      </Field>
                      <Field label="メモ" span={2}>
                        <input value={w.notes} onChange={(e) => setWorkflow(idx, "notes", e.target.value)} className={txt} />
                      </Field>
                    </div>
                  </div>
                );
              })}
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
// 案件 詳細ダイアログ
// ====================================================================
function CaseDetailDialog({ open, caseData, onEdit, onClose }) {
  if (!open || !caseData) return null;
  const c = caseData;
  const status = CASE_STATUSES.find((s) => s.id === c.status);
  const currentStep = WORKFLOW_STEPS.find((s) => s.key === c.currentStepKey);

  const Row = ({ label, value }) => (
    <div className="flex py-1.5 border-b border-slate-100 last:border-b-0">
      <span className="w-32 flex-shrink-0 text-[11px] text-slate-500">{label}</span>
      <span className="text-[12px] text-slate-800 flex-1">{value || <span className="text-slate-300">-</span>}</span>
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
                {status && (
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${caseStatusBadge(c.status)}`}>
                    {status.label}
                  </span>
                )}
                {currentStep && (
                  <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-brand text-white">
                    STEP {currentStep.order} / 10：{currentStep.name}
                  </span>
                )}
              </div>
              <h2 className="text-[18px] font-bold text-slate-900">{c.customerName}</h2>
              <div className="text-[12px] text-slate-600 mt-1">
                {c.purpose} ／ {c.occupant} ／ 期限: {c.deadline}
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
          {/* 進捗バー */}
          <div className="mt-3">
            <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1">
              <span>全体進捗</span>
              <span className="font-bold text-slate-800">{c.progressPct}%</span>
            </div>
            <ProgressBar pct={c.progressPct} />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {/* 案件情報 */}
          <SectionTitle>案件情報</SectionTitle>
          <div>
            <Row label="ご担当窓口" value={c.contact} />
            <Row label="利用目的" value={c.purpose} />
            <Row label="入居者" value={c.occupant} />
            <Row label="勤務地" value={c.workplace} />
            <Row label="希望エリア" value={(c.preferredArea || []).join(", ")} />
            <Row label="利用開始" value={c.startDate} />
            <Row label="利用期間" value={c.duration} />
            <Row label="予算" value={c.budgetMin && c.budgetMax ? `¥${Number(c.budgetMin).toLocaleString()} 〜 ¥${Number(c.budgetMax).toLocaleString()}` : null} />
            <Row label="主担当者" value={c.mainAssignee} />
            <Row label="対応期限" value={c.deadline} />
            <Row label="受領チャネル" value={c.channel} />
            <Row label="受領日時" value={c.receivedAt} />
            <Row label="備考" value={c.notes} />
          </div>

          {/* 添付書類 */}
          <SectionTitle>
            <span className="inline-flex items-center gap-1">
              <Paperclip className="w-3 h-3" />
              添付書類（{(c.attachments || []).length}）
            </span>
          </SectionTitle>
          {(c.attachments || []).length > 0 ? (
            <ul className="space-y-1.5 mb-3">
              {c.attachments.map((a) => {
                const fi = getFileIcon(a.name);
                const FIcon = fi.Icon;
                const cat = ATTACHMENT_CATEGORIES.find((x) => x.id === a.category);
                return (
                  <li key={a.id} className="flex items-center gap-2 p-2 border border-slate-200 rounded hover:bg-slate-50">
                    <div className={`w-9 h-9 rounded flex items-center justify-center flex-shrink-0 ${fi.bg}`}>
                      <FIcon className={`w-4 h-4 ${fi.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[12px] font-medium text-slate-900 truncate">{a.name}</div>
                      <div className="text-[10px] text-slate-500 flex items-center gap-1.5 flex-wrap mt-0.5">
                        {cat && (
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${attachmentCategoryBadge(a.category)}`}>
                            {cat.label}
                          </span>
                        )}
                        <span>{formatSize(a.size)}</span>
                        <span>·</span>
                        <span>{a.uploadedBy}</span>
                        <span>·</span>
                        <span>{a.uploadedAt}</span>
                      </div>
                      {a.notes && (
                        <div className="text-[10px] text-slate-600 mt-0.5 italic">📝 {a.notes}</div>
                      )}
                    </div>
                    <button
                      onClick={() => alert(`「${a.name}」をダウンロードします（モック）`)}
                      className="w-7 h-7 inline-flex items-center justify-center rounded hover:bg-sky-50 text-slate-500 hover:text-sky-600"
                      title="ダウンロード"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="text-center py-4 text-[11px] text-slate-400 mb-3 border border-dashed border-slate-200 rounded">
              <Paperclip className="w-6 h-6 mx-auto mb-1 text-slate-300" />
              添付書類はありません（編集画面から追加できます）
            </div>
          )}

          {/* ワークフロータイムライン */}
          <SectionTitle>ワークフロー進捗（10ステップ）</SectionTitle>
          <div className="text-[10px] text-slate-500 mb-3">
            各ステップの状態・担当者・日付を細かく管理しています。「編集」から状態や担当者を変更できます。
          </div>
          <ol className="relative">
            {/* 縦線 */}
            <span className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-slate-200" aria-hidden />
            {c.workflow.map((w, idx) => {
              const stepDef = WORKFLOW_STEPS.find((s) => s.key === w.stepKey);
              const stStatus = STEP_STATUSES.find((s) => s.id === w.status);
              const isCurrent = c.currentStepKey === w.stepKey;
              return (
                <li key={w.stepKey} className="relative pl-8 pb-3 last:pb-0">
                  <span className={`absolute left-0 top-0 w-6 h-6 rounded-full flex items-center justify-center ${
                    w.status === "done" ? "bg-emerald-500" :
                    w.status === "in_progress" ? "bg-sky-500" :
                    w.status === "blocked" ? "bg-rose-500" :
                    w.status === "skipped" ? "bg-amber-500" :
                    "bg-slate-200"
                  }`}>
                    {w.status === "done" ? <CheckCircle2 className="w-3.5 h-3.5 text-white" /> :
                     w.status === "in_progress" ? <Clock className="w-3.5 h-3.5 text-white" /> :
                     w.status === "blocked" ? <AlertCircle className="w-3.5 h-3.5 text-white" /> :
                     w.status === "skipped" ? <PauseCircle className="w-3.5 h-3.5 text-white" /> :
                     <span className="text-[10px] font-bold text-slate-500">{idx + 1}</span>}
                  </span>
                  <div className={`p-2.5 rounded border ${
                    isCurrent ? "border-brand bg-brand-light/40" : "border-slate-200 bg-white"
                  }`}>
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] font-mono text-slate-400">STEP {idx + 1}</span>
                          <span className="text-[13px] font-bold text-slate-900">{stepDef?.name}</span>
                          {stStatus && (
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${stepStatusBadge(w.status)}`}>
                              {stStatus.label}
                            </span>
                          )}
                          {isCurrent && (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-brand text-white">現在</span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-500 mt-0.5">{stepDef?.description}</div>
                      </div>
                    </div>
                    <div className="mt-2 grid grid-cols-3 gap-x-3 gap-y-1 text-[11px]">
                      <div className="flex gap-1">
                        <span className="text-slate-500">担当：</span>
                        <span className="font-medium text-slate-800">{w.assignee || <span className="text-slate-300">未割当</span>}</span>
                      </div>
                      <div className="flex gap-1">
                        <span className="text-slate-500">開始：</span>
                        <span className="text-slate-800">{w.startedAt || <span className="text-slate-300">-</span>}</span>
                      </div>
                      <div className="flex gap-1">
                        <span className="text-slate-500">完了：</span>
                        <span className="text-slate-800">{w.completedAt || <span className="text-slate-300">-</span>}</span>
                      </div>
                      {w.notes && (
                        <div className="col-span-3 text-[10px] text-slate-600 bg-slate-50 px-2 py-1 rounded mt-1">
                          📝 {w.notes}
                        </div>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </div>
  );
}

// ====================================================================
// メイン
// ====================================================================
export default function Cases({ setCurrent }) {
  const [cases, setCases] = useState(CASES);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [stepFilter, setStepFilter] = useState("all");
  const [assigneeFilter, setAssigneeFilter] = useState("all");

  const [editing, setEditing] = useState(null);
  const [formMode, setFormMode] = useState("new");
  const [showForm, setShowForm] = useState(false);
  const [detail, setDetail] = useState(null);
  const [page, setPage] = useState(1);
  const pageSize = 5;

  const filtered = useMemo(() => {
    return cases.filter((c) => {
      if (query) {
        const q = query.toLowerCase();
        if (
          !c.customerName?.toLowerCase().includes(q) &&
          !c.id?.toLowerCase().includes(q.toUpperCase()) &&
          !c.contact?.toLowerCase().includes(q)
        ) return false;
      }
      if (statusFilter !== "all" && c.status !== statusFilter) return false;
      if (stepFilter !== "all" && c.currentStepKey !== stepFilter) return false;
      if (assigneeFilter !== "all" && c.mainAssignee !== assigneeFilter) return false;
      return true;
    });
  }, [query, statusFilter, stepFilter, assigneeFilter, cases]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paged = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  React.useEffect(() => {
    setPage(1);
  }, [query, statusFilter, stepFilter, assigneeFilter, cases.length]);

  const openNew = () => { setEditing(null); setFormMode("new"); setShowForm(true); };
  const openEdit = (c) => { setEditing(c); setFormMode("edit"); setShowForm(true); };
  const openCopy = (c) => {
    const copied = {
      ...c,
      id: `REQ-2026-${String(Math.floor(Math.random() * 9000 + 1000))}-001`,
      customerName: `${c.customerName}（コピー）`,
      status: "active",
      currentStepKey: "intake",
      progressPct: 0,
      workflow: defaultWorkflow().map((w, i) => ({
        ...w,
        assignee: c.workflow?.[i]?.assignee || "",
      })),
      attachments: [], // コピー時は添付書類は引き継がない
    };
    setEditing(copied); setFormMode("copy"); setShowForm(true);
  };
  const closeForm = () => { setShowForm(false); setEditing(null); };

  const handleSave = (form) => {
    if (formMode === "edit") {
      setCases((prev) => prev.map((c) => (c.id === form.id ? { ...c, ...form } : c)));
    } else {
      setCases((prev) => [form, ...prev]);
    }
    closeForm();
  };

  const handleDelete = (id) => {
    if (window.confirm("この案件を削除しますか？")) {
      setCases((prev) => prev.filter((c) => c.id !== id));
      setDetail(null);
    }
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
            物件契約案件を10ステップで細かく進捗・担当管理しています
          </div>
          <div className="text-[11px] text-slate-600 mt-1 leading-relaxed">
            依頼受領 → 要件確認 → 提案準備 → 提案送付 → 検討中 → 内見 → 申込・審査 → 重説・契約 → 入居完了 → クローズ。
            各ステップに <span className="font-bold text-brand-dark">担当者・状態・開始日・完了日</span>
            を紐づけ、案件の進捗を一元管理します。詳細表示でワークフロータイムラインを確認できます。
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
              placeholder="案件ID・顧客名・担当者で検索"
              className="w-64 pl-8 pr-3 py-1.5 text-[12px] bg-slate-50 border border-slate-200 rounded"
            />
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="text-[11px] border border-slate-300 rounded px-2 py-1.5">
            <option value="all">全ステータス</option>
            {CASE_STATUSES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>
          <select value={stepFilter} onChange={(e) => setStepFilter(e.target.value)} className="text-[11px] border border-slate-300 rounded px-2 py-1.5">
            <option value="all">全ステップ</option>
            {WORKFLOW_STEPS.map((s) => <option key={s.key} value={s.key}>STEP {s.order}：{s.name}</option>)}
          </select>
          <select value={assigneeFilter} onChange={(e) => setAssigneeFilter(e.target.value)} className="text-[11px] border border-slate-300 rounded px-2 py-1.5">
            <option value="all">全担当者</option>
            {ASSIGNEE_OPTIONS.map((a) => <option key={a} value={a}>{a}</option>)}
          </select>
          <div className="text-[11px] text-slate-500 ml-2">
            <span className="font-bold text-slate-900">{filtered.length}</span> / {cases.length} 件
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="px-3 py-1.5 text-[11px] border border-slate-300 rounded text-slate-700 hover:bg-slate-50 inline-flex items-center gap-1">
            <Download className="w-3 h-3" />
            CSV
          </button>
          <button
            onClick={openNew}
            className="px-3 py-1.5 text-[12px] font-bold text-white rounded bg-brand hover:bg-brand-dark inline-flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            新規案件
          </button>
        </div>
      </div>

      {/* テーブル */}
      <div className="bg-white border border-slate-200 rounded-md overflow-hidden">
        <table className="w-full text-[12px]">
          <thead className="bg-slate-50">
            <tr className="text-left text-slate-600 border-b border-slate-200">
              <th className="px-4 py-2.5 font-medium">案件ID</th>
              <th className="px-4 py-2.5 font-medium">顧客</th>
              <th className="px-4 py-2.5 font-medium">利用目的</th>
              <th className="px-4 py-2.5 font-medium">現在のステップ</th>
              <th className="px-4 py-2.5 font-medium">進捗</th>
              <th className="px-4 py-2.5 font-medium">主担当</th>
              <th className="px-4 py-2.5 font-medium">期限</th>
              <th className="px-4 py-2.5 font-medium">ステータス</th>
              <th className="px-4 py-2.5 font-medium w-32">操作</th>
            </tr>
          </thead>
          <tbody>
            {paged.map((c) => {
              const status = CASE_STATUSES.find((s) => s.id === c.status);
              const currentStep = WORKFLOW_STEPS.find((s) => s.key === c.currentStepKey);
              return (
                <tr key={c.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="px-4 py-3 font-mono text-[11px] text-slate-600">{c.id}</td>
                  <td className="px-4 py-3">
                    <div className="font-bold text-slate-900">{c.customerName}</div>
                    <div className="text-[10px] text-slate-500">{c.contact}</div>
                  </td>
                  <td className="px-4 py-3 text-slate-700 text-[11px]">
                    {c.purpose}
                    <div className="text-[10px] text-slate-500">{c.occupant}</div>
                  </td>
                  <td className="px-4 py-3">
                    {currentStep && (
                      <div>
                        <div className="text-[10px] text-slate-400 font-mono">STEP {currentStep.order} / 10</div>
                        <div className="text-[12px] font-medium text-slate-800">{currentStep.name}</div>
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 w-32">
                    <div className="flex items-center gap-1.5">
                      <ProgressBar pct={c.progressPct} />
                      <span className="text-[10px] font-bold text-slate-600 w-8 text-right">{c.progressPct}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-700">{c.mainAssignee}</td>
                  <td className="px-4 py-3 text-slate-700 text-[11px]">{c.deadline}</td>
                  <td className="px-4 py-3">
                    {status && (
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${caseStatusBadge(c.status)}`}>
                        {status.label}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => setDetail(c)} className="w-7 h-7 inline-flex items-center justify-center rounded hover:bg-sky-50 text-slate-500 hover:text-sky-600" title="詳細">
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => openEdit(c)} className="w-7 h-7 inline-flex items-center justify-center rounded hover:bg-amber-50 text-slate-500 hover:text-amber-600" title="編集">
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => openCopy(c)} className="w-7 h-7 inline-flex items-center justify-center rounded hover:bg-indigo-50 text-slate-500 hover:text-indigo-600" title="この案件をコピーして新規登録">
                        <Copy className="w-3.5 h-3.5" />
                      </button>
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
            該当する案件はありません
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
      <CaseFormDialog
        open={showForm}
        initial={editing}
        mode={formMode}
        onSave={handleSave}
        onClose={closeForm}
      />
      <CaseDetailDialog
        open={Boolean(detail)}
        caseData={detail}
        onEdit={(c) => { setDetail(null); openEdit(c); }}
        onClose={() => setDetail(null)}
      />
    </div>
  );
}

// ====================================================================
// 添付書類エディタ（編集・新規ダイアログ内で使用）
// ====================================================================
function AttachmentsEditor({ attachments, onChange }) {
  const fileInputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);

  const addFiles = (files) => {
    const now = nowString();
    const newAtts = Array.from(files).map((f, i) => ({
      id: `att-new-${Date.now()}-${i}`,
      name: f.name,
      size: f.size,
      category: "other",
      uploadedAt: now,
      uploadedBy: CURRENT_USER?.name || "システム",
      notes: "",
    }));
    onChange([...attachments, ...newAtts]);
  };

  const handleSelect = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) addFiles(files);
    e.target.value = ""; // 同じファイルを再度選べるようにリセット
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) addFiles(files);
  };

  const update = (idx, field, value) => {
    onChange(attachments.map((a, i) => (i === idx ? { ...a, [field]: value } : a)));
  };

  const remove = (idx) => {
    onChange(attachments.filter((_, i) => i !== idx));
  };

  return (
    <div>
      {/* ドロップゾーン */}
      <label
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`block border-2 border-dashed rounded-md p-6 text-center cursor-pointer transition mb-3 ${
          dragOver
            ? "border-brand bg-brand-light"
            : "border-slate-300 bg-slate-50 hover:border-brand hover:bg-brand-light/30"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.docx,.doc,.xlsx,.xls,.csv,.png,.jpg,.jpeg,.gif,.eml,.msg"
          onChange={handleSelect}
          className="hidden"
        />
        <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
        <div className="text-[12px] font-bold text-slate-700">
          PDF・Word・Excel・画像 などをドロップ
        </div>
        <div className="text-[10px] text-slate-500 mt-1">
          または<span className="text-brand font-medium underline">クリックしてファイルを選択</span>
          （複数選択可）
        </div>
        <div className="text-[9px] text-slate-400 mt-1.5">
          対応形式: PDF / DOCX / XLSX / CSV / PNG / JPG / EML（最大 25MB/ファイル）
        </div>
      </label>

      {/* 既存ファイル一覧 */}
      {attachments.length > 0 ? (
        <div className="space-y-1.5">
          {attachments.map((a, idx) => {
            const fi = getFileIcon(a.name);
            const FIcon = fi.Icon;
            return (
              <div key={a.id || idx} className="flex items-center gap-2 p-2 border border-slate-200 rounded bg-white">
                <div className={`w-9 h-9 rounded flex items-center justify-center flex-shrink-0 ${fi.bg}`}>
                  <FIcon className={`w-4 h-4 ${fi.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[12px] font-medium text-slate-900 truncate">{a.name}</div>
                  <div className="text-[10px] text-slate-500 flex items-center gap-2 flex-wrap">
                    <span>{formatSize(a.size)}</span>
                    <span>·</span>
                    <span>{a.uploadedBy}</span>
                    <span>·</span>
                    <span>{a.uploadedAt}</span>
                  </div>
                </div>
                <select
                  value={a.category || "other"}
                  onChange={(e) => update(idx, "category", e.target.value)}
                  className="text-[10px] border border-slate-300 rounded px-1.5 py-1 bg-white"
                >
                  {ATTACHMENT_CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id}>{c.label}</option>
                  ))}
                </select>
                <input
                  value={a.notes || ""}
                  onChange={(e) => update(idx, "notes", e.target.value)}
                  placeholder="メモ"
                  className="text-[11px] border border-slate-300 rounded px-2 py-1 w-32"
                />
                <button
                  onClick={() => remove(idx)}
                  className="w-7 h-7 inline-flex items-center justify-center rounded hover:bg-rose-50 text-slate-400 hover:text-rose-600"
                  title="削除"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-4 text-[11px] text-slate-400">
          <Paperclip className="w-6 h-6 mx-auto mb-1 text-slate-300" />
          添付書類はまだありません
        </div>
      )}
    </div>
  );
}
