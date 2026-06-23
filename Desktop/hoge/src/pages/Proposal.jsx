import React, { useState, useMemo, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Tooltip, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  Search,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  CheckCircle2,
  FileText,
  FileSpreadsheet,
  FileImage,
  File as FileIcon,
  Image as ImageIcon,
  Link as LinkIcon,
  Copy,
  MapPin,
  Train,
  Paperclip,
  Eye,
  X,
  Loader2,
  Lightbulb,
  Plus,
  UploadCloud,
  ShieldAlert,
  Info,
  Cloud,
  Mail,
  Lock,
} from "lucide-react";
import { CASES, WORKFLOW_STEPS, ATTACHMENT_CATEGORIES, attachmentCategoryBadge } from "../data/casesData";
import { CUSTOMERS } from "../data/customersData";
import { PROPERTIES } from "../data/propertiesData";
import { USERS, CURRENT_USER } from "../data/usersData";
import { convertExpressions } from "../data/expressionMap";
import { setSharedProposal } from "../data/sharedProposal";
import { addReactionRecord } from "../data/reactionStore";
import PiiFreeBanner, { PiiFreeBadge } from "../components/PiiFreeBanner";

// AI抽出の確信度しきい値。これ未満の項目は人間の確認が無いと確定（次へ）できない。
// ※しきい値は大坪確認後に確定（暫定 0.97）
const CONFIDENCE_THRESHOLD = 0.97;

// ====================================================================
// ヘルパー
// ====================================================================
const getFileIcon = (filename = "") => {
  const ext = filename.split(".").pop()?.toLowerCase();
  if (ext === "pdf") return { Icon: FileText, color: "text-rose-600", bg: "bg-rose-50" };
  if (["xlsx", "xls", "csv"].includes(ext)) return { Icon: FileSpreadsheet, color: "text-emerald-600", bg: "bg-emerald-50" };
  if (["docx", "doc"].includes(ext)) return { Icon: FileText, color: "text-sky-600", bg: "bg-sky-50" };
  if (["png", "jpg", "jpeg", "gif"].includes(ext)) return { Icon: FileImage, color: "text-purple-600", bg: "bg-purple-50" };
  return { Icon: FileIcon, color: "text-slate-500", bg: "bg-slate-100" };
};

const formatSize = (bytes) => {
  if (!bytes && bytes !== 0) return "-";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

// ====================================================================
// 上部ステップインジケータ
// ====================================================================
function StepIndicator({ step }) {
  const steps = [
    { id: 1, label: "案件を選択" },
    { id: 2, label: "AIで観点抽出" },
    { id: 3, label: "物件検索・候補化" },
    { id: 4, label: "最終出力" },
  ];
  return (
    <div className="bg-white border border-slate-200 rounded-md p-3">
      <div className="flex items-center">
        {steps.map((s, idx) => {
          const active = step === s.id;
          const done = step > s.id;
          return (
            <React.Fragment key={s.id}>
              <div className="flex items-center gap-2 flex-1">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-[11px] font-bold ${
                  done ? "bg-emerald-500 text-white" :
                  active ? "bg-brand text-white ring-2 ring-brand-light" :
                  "bg-slate-200 text-slate-500"
                }`}>
                  {done ? <CheckCircle2 className="w-3.5 h-3.5" /> : s.id}
                </div>
                <div className="min-w-0">
                  <div className="text-[9px] text-slate-400 leading-none">STEP {s.id}</div>
                  <div className={`text-[12px] font-bold ${active ? "text-brand-dark" : done ? "text-slate-800" : "text-slate-500"} leading-tight mt-0.5`}>
                    {s.label}
                  </div>
                </div>
              </div>
              {idx < steps.length - 1 && (
                <div className={`flex-shrink-0 w-8 h-0.5 ${done ? "bg-emerald-500" : "bg-slate-200"} mx-1`} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

// ====================================================================
// STEP 1: 案件を選択
// ====================================================================
function Step1CaseSelector({ onSelect }) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("active");
  const [assigneeFilter, setAssigneeFilter] = useState("all");
  const [page, setPage] = useState(1);
  const pageSize = 5;

  // 担当者選択肢（USERSから氏名のみ）
  const assigneeOptions = USERS.map((u) => u.name);

  const filtered = useMemo(() => {
    return CASES.filter((c) => {
      if (statusFilter !== "all" && c.status !== statusFilter) return false;
      if (assigneeFilter !== "all" && c.mainAssignee !== assigneeFilter) return false;
      if (query) {
        const q = query.toLowerCase();
        if (
          !c.customerName?.toLowerCase().includes(q) &&
          !c.id?.toLowerCase().includes(q.toUpperCase()) &&
          !c.purpose?.toLowerCase().includes(q) &&
          !c.mainAssignee?.toLowerCase().includes(q)
        ) return false;
      }
      return true;
    });
  }, [query, statusFilter, assigneeFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paged = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  useEffect(() => {
    setPage(1);
  }, [query, statusFilter, assigneeFilter]);

  return (
    <div className="bg-white border border-slate-200 rounded-md overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-100">
        <h2 className="text-[14px] font-bold text-slate-900">STEP 1：提案する案件を選択</h2>
        <p className="text-[11px] text-slate-500 mt-0.5">
          案件管理から案件を1件選択してください。選択後、その案件のデータ（顧客情報・要件・添付書類）が次のステップでAIに渡されます。
        </p>
      </div>

      {/* 検索 */}
      <div className="px-4 py-3 flex items-center gap-2 border-b border-slate-100 flex-wrap">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="案件ID・顧客名・利用目的・担当者で検索"
            className="w-72 pl-8 pr-3 py-1.5 text-[12px] bg-slate-50 border border-slate-200 rounded"
          />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="text-[11px] border border-slate-300 rounded px-2 py-1.5">
          <option value="all">全ステータス</option>
          <option value="active">進行中のみ</option>
          <option value="pending">保留中のみ</option>
          <option value="won">成約のみ</option>
        </select>
        <select value={assigneeFilter} onChange={(e) => setAssigneeFilter(e.target.value)} className="text-[11px] border border-slate-300 rounded px-2 py-1.5">
          <option value="all">全担当者</option>
          {assigneeOptions.map((a) => <option key={a} value={a}>{a}</option>)}
        </select>
        <div className="text-[11px] text-slate-500 ml-auto">
          <span className="font-bold text-slate-900">{filtered.length}</span> / {CASES.length} 件
        </div>
      </div>

      {/* テーブル */}
      <table className="w-full text-[12px]">
        <thead className="bg-slate-50">
          <tr className="text-left text-slate-600 border-b border-slate-200">
            <th className="px-4 py-2.5 font-medium">案件ID</th>
            <th className="px-4 py-2.5 font-medium">顧客</th>
            <th className="px-4 py-2.5 font-medium">利用目的</th>
            <th className="px-4 py-2.5 font-medium">入居者</th>
            <th className="px-4 py-2.5 font-medium">現在のステップ</th>
            <th className="px-4 py-2.5 font-medium">添付</th>
            <th className="px-4 py-2.5 font-medium">期限</th>
            <th className="px-4 py-2.5 font-medium w-32"></th>
          </tr>
        </thead>
        <tbody>
          {paged.map((c) => {
            const currentStep = WORKFLOW_STEPS.find((s) => s.key === c.currentStepKey);
            const attCount = (c.attachments || []).length;
            return (
              <tr
                key={c.id}
                onClick={() => onSelect(c)}
                className="border-b border-slate-100 hover:bg-brand-light/30 cursor-pointer"
              >
                <td className="px-4 py-3 font-mono text-[11px] text-slate-600">{c.id}</td>
                <td className="px-4 py-3">
                  <div className="font-bold text-slate-900">{c.customerName}</div>
                  <div className="text-[10px] text-slate-500">{c.contact}</div>
                </td>
                <td className="px-4 py-3 text-slate-700 text-[11px]">{c.purpose}</td>
                <td className="px-4 py-3 text-slate-700 text-[11px]">{c.occupant}</td>
                <td className="px-4 py-3">
                  {currentStep && (
                    <div>
                      <div className="text-[10px] text-slate-400 font-mono">STEP {currentStep.order}/10</div>
                      <div className="text-[12px] font-medium text-slate-800">{currentStep.name}</div>
                    </div>
                  )}
                </td>
                <td className="px-4 py-3">
                  {attCount > 0 ? (
                    <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-sky-700 bg-sky-50 px-1.5 py-0.5 rounded">
                      <Paperclip className="w-2.5 h-2.5" />
                      {attCount}
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-300">なし</span>
                  )}
                </td>
                <td className="px-4 py-3 text-slate-700 text-[11px]">{c.deadline}</td>
                <td className="px-4 py-3">
                  <button
                    onClick={(e) => { e.stopPropagation(); onSelect(c); }}
                    className="px-2.5 py-1 text-[11px] font-bold text-white rounded bg-brand hover:bg-brand-dark inline-flex items-center gap-1"
                  >
                    選択
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {filtered.length === 0 && (
        <div className="px-4 py-12 text-center text-[12px] text-slate-400">
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
  );
}

// ====================================================================
// 添付書類の本文プレビュー（モック）
// 実装時は実 PDF / Word を表示するが、ここではカテゴリ別にもっともらしい
// 本文を生成して表示。
// ====================================================================
function generateDocumentPreview(attachment, selectedCase, customer) {
  const cat = attachment.category;
  if (cat === "request") {
    return `〒${customer?.postalCode || "XXX-XXXX"}
${customer?.prefecture || ""}${customer?.city || ""}${customer?.addressLine || ""}
${selectedCase.customerName} 御中

社宅手配のご相談

平素より大変お世話になっております。
弊社では、下記の条件で物件をご紹介いただきたく、ご連絡申し上げました。

【ご担当窓口】${selectedCase.contact || "—"}

【希望条件】
・利用目的:${selectedCase.purpose}
・入居者:${selectedCase.occupant}（${selectedCase.occupantCount || 1}名）
・利用開始:${selectedCase.startDate || "—"}
・利用期間:${selectedCase.duration || "—"}
・勤務地:${selectedCase.workplace || "—"}
・希望エリア:${(selectedCase.preferredArea || []).join("、") || "—"}
・ご予算:¥${Number(selectedCase.budgetMin || 0).toLocaleString()} 〜 ¥${Number(selectedCase.budgetMax || 0).toLocaleString()}

【特記事項】
${selectedCase.notes || "（特記事項なし）"}

ご検討のほど、よろしくお願い申し上げます。

${selectedCase.customerName}
${selectedCase.contact || ""}
`;
  }
  if (cat === "regulation") {
    return `${selectedCase.customerName} 社宅利用規程
（${new Date().getFullYear()}年度版）

第1条（目的）
本規程は、社員の福利厚生と住居安定を目的として、
会社が提供する社宅の利用条件を定めるものである。

第2条（対象者）
本規程の対象は、以下の社員とする。
1. 単身赴任社員
2. 新卒社員（入社後3年間）
3. 中途採用者でやむを得ない事情のある社員
4. その他、会社が認めた社員

第3条(利用要件)
社宅として利用する物件は、以下の要件を満たすこと。
1. 家賃上限:¥${Number(selectedCase.budgetMax || 100000).toLocaleString()}（管理費込）
2. 専有面積:18㎡以上
3. 駅徒歩:通勤利便性を考慮（原則20分以内）
4. 家具家電付き優先（単身赴任者向け）
5. オートロック等のセキュリティ設備があること

第4条（利用期間）
原則として${selectedCase.duration || "2年間"}とする。継続利用は会社の承認による。

第5条（費用負担）
家賃・管理費・共益費は会社負担。光熱費・通信費は社員負担。
`;
  }
  if (cat === "meeting_notes") {
    return `打合せ議事録

日時:${attachment.uploadedAt}
場所:オンライン会議 / 弊社会議室
参加者:
  ${selectedCase.customerName}: ${selectedCase.contact}
  レオパレス21:${selectedCase.mainAssignee || "—"}

【議題】
1. 案件 ${selectedCase.id} の進め方について
2. 希望条件のすり合わせ
3. スケジュール確認

【決定事項】
・希望エリアは ${(selectedCase.preferredArea || []).join("、") || "未確定"} とする
・家賃上限は社宅規定通り ¥${Number(selectedCase.budgetMax || 0).toLocaleString()}
・初回提案は ${selectedCase.deadline || "—"} までに3〜5物件を提示
・入居予定日:${selectedCase.startDate}

【ご担当者からの要望】
${selectedCase.notes || "（記録なし）"}

以上
`;
  }
  if (cat === "proposal") {
    return `物件のご提案

提案先:${selectedCase.customerName} 御中
案件ID:${selectedCase.id}
提案日:${attachment.uploadedAt}
担当:${selectedCase.mainAssignee || "—"}

平素より大変お世話になっております。
ご依頼いただきました件について、下記の通り物件をご提案いたします。

【ご提案物件】
1. レオパレス○○ステーション   ¥78,000 / 月
2. レオパレス△△ガーデン       ¥82,000 / 月
3. レオパレス□□レジデンス     ¥75,000 / 月

各物件の詳細は別添資料をご参照ください。
ご検討のほど、よろしくお願い申し上げます。
`;
  }
  if (cat === "contract") {
    return `賃貸借契約書（写し）

賃貸人:株式会社レオパレス21
賃借人:${selectedCase.customerName}

物件:[物件名・所在地]
賃料:[金額]
契約期間:${selectedCase.duration || "—"}
入居予定日:${selectedCase.startDate || "—"}

第1条(契約の目的)
賃貸人は、本契約物件を賃借人に賃貸し、賃借人は社員寮として使用する。

第2条(賃料)
月額賃料は前条に定める通りとする。
毎月25日までに翌月分を指定口座に振り込むものとする。

(以下省略)
`;
  }
  if (cat === "legal_disclosure") {
    return `重要事項説明書

宅地建物取引業法第35条に基づく重要事項説明書

説明者:(宅地建物取引士)[氏名]
登録番号:[番号]
説明日:${attachment.uploadedAt}

1. 取引対象物件の表示
2. 登記簿上の権利関係
3. 法令上の制限(都市計画法、建築基準法 等)
4. 私道に関する負担
5. 飲用水・電気・ガス・排水の供給施設状況
6. 区分所有建物の場合の管理規約
7. 取引条件
   - 代金、賃料、その他金銭授受
   - 契約解除・違約金
   - 損害賠償の予定
   - 引渡し時期

以上を、宅建業法に従い口頭で説明し、本書を交付した。
`;
  }
  if (cat === "viewing_notes") {
    return `内見記録

実施日:${attachment.uploadedAt}
参加者:${selectedCase.contact} / ${selectedCase.mainAssignee || "—"}

【内見物件】
1. レオパレス○○ステーション
   - 賃料:¥78,000
   - 印象:駅近、家具家電充実、評価良好
   - ご担当コメント:第一候補として申込検討

2. レオパレス△△ガーデン
   - 賃料:¥82,000
   - 印象:広さ十分、ただし駅から遠い
   - ご担当コメント:第二候補

【今後の進め方】
- 申込書送付:翌営業日
- 入居審査:5営業日以内
`;
  }
  return `(書類プレビュー)

ファイル名:${attachment.name}
カテゴリ:${ATTACHMENT_CATEGORIES.find((c) => c.id === attachment.category)?.label || "—"}
アップロード:${attachment.uploadedAt} / ${attachment.uploadedBy}

このファイルの内容プレビューはモック表示です。
実装時は PDF / Word ビューアまたは抜粋テキストが表示されます。
`;
}

// 書類プレビューダイアログ
function DocumentPreviewDialog({ attachment, selectedCase, onClose }) {
  if (!attachment) return null;
  const customer = CUSTOMERS.find((c) => c.id === selectedCase?.customerId);
  const cat = ATTACHMENT_CATEGORIES.find((x) => x.id === attachment.category);
  const fi = getFileIcon(attachment.name);
  const FIcon = fi.Icon;
  const previewText = generateDocumentPreview(attachment, selectedCase, customer);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-md shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="px-5 py-3 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3 min-w-0">
            <div className={`w-10 h-10 rounded flex items-center justify-center flex-shrink-0 ${fi.bg}`}>
              <FIcon className={`w-5 h-5 ${fi.color}`} />
            </div>
            <div className="min-w-0">
              <div className="text-[13px] font-bold text-slate-900 truncate">{attachment.name}</div>
              <div className="text-[10px] text-slate-500 flex items-center gap-2 mt-0.5">
                {cat && (
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${attachmentCategoryBadge(attachment.category)}`}>
                    {cat.label}
                  </span>
                )}
                <span>{formatSize(attachment.size)}</span>
                <span>·</span>
                <span>{attachment.uploadedBy}</span>
                <span>·</span>
                <span>{attachment.uploadedAt}</span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 inline-flex items-center justify-center rounded hover:bg-slate-200 text-slate-500 flex-shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>
        {/* 紙面風プレビュー */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-100">
          <div className="max-w-2xl mx-auto bg-white shadow p-8 text-[11.5px] text-slate-800 whitespace-pre-wrap leading-relaxed font-mono">
            {previewText}
          </div>
        </div>
        {attachment.notes && (
          <div className="px-5 py-2 border-t border-slate-200 bg-slate-50 text-[11px]">
            <span className="text-slate-500">メモ：</span>
            <span className="text-slate-800">{attachment.notes}</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ====================================================================
// AIが案件データから抽出する観点・条件を生成（モック）
// ====================================================================
// レオパレス実務の「おすすめポイント」タグ（公式物件ページ準拠）
const FEATURE_TAGS = [
  "敷金不要", "家具・家電付き", "モニター付インターホン", "浴室乾燥機", "宅配ボックス/ロッカー",
  "温水洗浄便座", "スマートロック", "防犯カメラ", "エアコン", "インターネット対応",
  "バス・トイレ別", "室内洗濯機置場", "独立洗面台", "バルコニー", "駐輪場",
  "2階以上", "南向き", "ロフト付", "即入居可", "マンスリー可",
];

function generateAiAnalysis(selectedCase) {
  if (!selectedCase) return null;
  const customer = CUSTOMERS.find((c) => c.id === selectedCase.customerId);

  // 案件・顧客・書類から導出される推薦（モック）
  return {
    summary: {
      caseId: selectedCase.id,
      customerName: selectedCase.customerName,
      industry: customer?.industry || "—",
      purpose: selectedCase.purpose,
      occupant: selectedCase.occupant,
      duration: selectedCase.duration,
      sources: [
        { type: "案件データ", label: "案件管理レコード", confidence: 1.0 },
        { type: "顧客マスタ", label: "顧客マスタ（社宅利用履歴）", confidence: 0.95 },
        ...(selectedCase.attachments || []).map((a) => {
          const cat = ATTACHMENT_CATEGORIES.find((x) => x.id === a.category);
          return { type: cat?.label || "添付書類", label: a.name, confidence: 0.88 };
        }),
      ],
    },
    mustConditions: [
      { id: "rent", kind: "text", label: "賃料上限", value: `¥${(selectedCase.budgetMax || 100000).toLocaleString()} / 月以下`, source: "社宅規定", sourceDetail: "社宅規定 第2条：単身者向け住宅補助の上限額。", enabled: true, confidence: 0.99 },
      { id: "rent_min", kind: "text", label: "賃料下限", value: `¥${(selectedCase.budgetMin || 50000).toLocaleString()} / 月以上`, source: "社宅規定", sourceDetail: "社宅規定 第2条：下限の目安（極端に安価な物件を除外）。", enabled: true, confidence: 0.98 },
      { id: "area", kind: "text", label: "希望エリア", value: (selectedCase.preferredArea || []).join("、") || "—", source: "依頼書", sourceDetail: "依頼メール本文：「勤務地（板橋）周辺を希望」との記載。", enabled: true, confidence: 0.93 },
      { id: "move_in", kind: "text", label: "入居可能日", value: `${selectedCase.startDate || "—"} 以前`, source: "依頼書", sourceDetail: "依頼書 入居希望日欄より抽出。", enabled: true, confidence: 0.88 },
      { id: "walk", kind: "slider", label: "駅徒歩", min: 1, max: 20, val: 10, unit: "分以内", ticks: [3, 5, 7, 10, 15, 20], tickStep: 1, source: "依頼書", sourceDetail: "依頼メール：「通勤の利便性を重視」との記載から推定。", enabled: true, confidence: 0.85 },
      { id: "age", kind: "slider", label: "築年数", min: 0, max: 40, val: 15, unit: "年以内", ticks: [10, 20, 30], tickStep: 5, source: "品質基準", sourceDetail: "社宅規定 品質基準ガイドライン：維持管理・クレーム率を考慮。", enabled: true, confidence: 0.8 },
      { id: "parking", kind: "bool", label: "駐車場あり", val: false, source: "依頼書", sourceDetail: "依頼書：社用車・通勤車両の有無により設定。", enabled: false, confidence: 0.9 },
    ],
    points: [
      { id: "walk_min", kind: "slider", label: "駅徒歩", min: 1, max: 20, val: 10, unit: "分以内", ticks: [3, 5, 7, 10, 15, 20], tickStep: 1, order: 0, source: "依頼書", sourceDetail: "依頼書に「通勤時間短縮を希望」と記載。過去成約データでも駅近物件の成約率が高い。", confidence: 0.88, enabled: true },
      { id: "furniture", kind: "tag", label: "家具家電付き", order: 1, source: "社宅規定", sourceDetail: "社宅規定 第3条「単身赴任者向けは家具家電付き優先」。初期費用負担軽減の観点でも推奨。", confidence: 0.92, enabled: true },
      { id: "autolock", kind: "tag", label: "オートロック", order: 2, source: "問合せ履歴", sourceDetail: "セキュリティ重視。若年層入居者・過去の問合せ履歴から推奨。", confidence: 0.81, enabled: true },
      { id: "delivery_box", kind: "tag", label: "宅配BOX", order: 3, source: "問合せ履歴", sourceDetail: "不在時の荷物受取ニーズ。単身者の利便性向上のため推奨。", confidence: 0.8, enabled: true },
      { id: "newer", kind: "slider", label: "築年数", min: 0, max: 40, val: 10, unit: "年以内", ticks: [10, 20, 30], tickStep: 5, order: 4, source: "品質基準", sourceDetail: "社宅規定の品質基準ガイドラインに準拠。維持管理コストとクレーム発生率を考慮。", confidence: 0.75, enabled: false },
    ],
  };
}

// ====================================================================
// STEP 2: AI観点抽出
// ====================================================================
function Step2AiAnalysis({ selectedCase, analysis, setAnalysis, onNext, onBack }) {
  // 取込（アップロード）→ 抽出 のゲート。analysis が既にあれば取込済み扱い。
  const [ingested, setIngested] = useState(!!analysis);
  const [analyzing, setAnalyzing] = useState(false);
  const [sourceName, setSourceName] = useState(analysis ? "案件添付書類" : "");
  const [previewDoc, setPreviewDoc] = useState(null);
  // 確信度がしきい値未満の項目に対する「人間の確認」記録 { [id]: { by, at } }
  const [confirmed, setConfirmed] = useState({});

  // 取込実行（実ファイルは解析せず、ダミー抽出を初期値として流し込むモック）
  const runIngest = (name) => {
    setSourceName(name || "依頼ファイル");
    setAnalyzing(true);
    setConfirmed({});
    setTimeout(() => {
      setAnalysis(generateAiAnalysis(selectedCase));
      setAnalyzing(false);
      setIngested(true);
    }, 1600);
  };

  const onPickFile = (e) => {
    const f = e.target.files && e.target.files[0];
    if (f) runIngest(f.name);
    e.target.value = "";
  };

  const toggleMust = (id) => {
    setAnalysis((a) => ({
      ...a,
      mustConditions: a.mustConditions.map((c) =>
        c.id === id ? { ...c, enabled: !c.enabled } : c
      ),
    }));
  };

  const togglePoint = (id) => {
    setAnalysis((a) => ({
      ...a,
      points: a.points.map((p) => (p.id === id ? { ...p, enabled: !p.enabled } : p)),
    }));
  };

  const confirmItem = (id) => {
    setConfirmed((prev) => {
      const next = { ...prev };
      if (next[id]) {
        delete next[id];
      } else {
        next[id] = { by: CURRENT_USER?.name || "確認担当", at: new Date().toLocaleString("ja-JP") };
      }
      return next;
    });
  };

  // 自由テキスト貼り付け（メール文・担当者電話メモ等）
  const [pasteText, setPasteText] = useState("");
  // 出典ポップアップ
  const [sourcePopup, setSourcePopup] = useState(null);
  // 推奨条件のドラッグ＆ドロップ
  const [dragId, setDragId] = useState(null);

  // 必須条件：スライダー値の変更
  const setMustVal = (id, val) =>
    setAnalysis((a) => ({ ...a, mustConditions: a.mustConditions.map((c) => (c.id === id ? { ...c, val } : c)) }));
  // 必須条件：bool トグル
  const setMustBool = (id, val) =>
    setAnalysis((a) => ({ ...a, mustConditions: a.mustConditions.map((c) => (c.id === id ? { ...c, val, enabled: val || c.enabled } : c)) }));
  // 推奨条件：スライダー値
  const setPointVal = (id, val) =>
    setAnalysis((a) => ({ ...a, points: a.points.map((p) => (p.id === id ? { ...p, val } : p)) }));

  // 推奨条件の並び替え（order を入れ替え）
  const reorderPoints = (fromId, toId) => {
    setAnalysis((a) => {
      const arr = [...a.points].sort((x, y) => (x.order ?? 0) - (y.order ?? 0));
      const from = arr.findIndex((p) => p.id === fromId);
      const to = arr.findIndex((p) => p.id === toId);
      if (from < 0 || to < 0 || from === to) return a;
      const [moved] = arr.splice(from, 1);
      arr.splice(to, 0, moved);
      const reordered = arr.map((p, i) => ({ ...p, order: i }));
      return { ...a, points: reordered };
    });
  };

  // 特徴タグの選択（条件として追加/解除）
  const toggleFeatureTag = (tag) => {
    setAnalysis((a) => {
      const tags = a.featureTags || [];
      return { ...a, featureTags: tags.includes(tag) ? tags.filter((t) => t !== tag) : [...tags, tag] };
    });
  };

  // ── 取込前：アップロード待ち画面 ──
  if (!ingested && !analyzing) {
    return (
      <div className="space-y-3">
        <div className="bg-white border border-slate-200 rounded-md px-4 py-3">
          <h2 className="text-[14px] font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-ai" />
            STEP 2：依頼ファイルの取込 → AIで条件を抽出
          </h2>
          <p className="text-[11px] text-slate-500 mt-0.5">
            メール本文・PDF・Excel・画像の依頼ファイルを取り込むと、AIが部屋探しの条件を抽出し、フォームの初期値として流し込みます。
          </p>
        </div>
          <div className="bg-white border-2 border-dashed border-slate-300 rounded-md p-10 text-center">
          <UploadCloud className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <div className="text-[13px] font-bold text-slate-800 mb-1">依頼ファイルをアップロード</div>
          <div className="text-[11px] text-slate-500 mb-4">対応：PDF / メール（.eml/本文）/ Excel / 画像。ここに抽出されるのは<strong>条件情報のみ</strong>です。</div>
          <div className="flex items-center justify-center gap-2">
            <label className="px-4 py-1.5 text-[12px] font-bold text-white rounded bg-brand hover:bg-brand-dark inline-flex items-center gap-1 cursor-pointer">
              <UploadCloud className="w-3.5 h-3.5" />
              ファイルを選択
              <input type="file" className="hidden" onChange={onPickFile} accept=".pdf,.eml,.xlsx,.xls,.csv,.png,.jpg,.jpeg" />
            </label>
            <button
              onClick={() => runIngest("依頼書_サンプル.pdf")}
              className="px-4 py-1.5 text-[12px] border border-slate-300 rounded text-slate-700 hover:bg-slate-50"
            >
              サンプル依頼PDFで実行
            </button>
          </div>
        </div>

        {/* 自由テキスト貼り付け（item3） */}
        <div className="bg-white border border-slate-200 rounded-md p-4">
          <div className="text-[12px] font-bold text-slate-800 mb-1 flex items-center gap-1">
            <FileText className="w-3.5 h-3.5 text-ai" />
            または、依頼内容を直接貼り付け
          </div>
          <p className="text-[10px] text-slate-500 mb-2">メール本文・電話メモ・チャットの転記など。貼り付けた条件をAIが抽出します（個人情報は抽出対象外）。</p>
          <textarea
            value={pasteText}
            onChange={(e) => setPasteText(e.target.value)}
            rows={4}
            placeholder={"例）板橋区周辺で1Kを5名分。家賃8万まで、駅徒歩10分以内、家具家電付き希望。6月入居。"}
            className="w-full text-[12px] border border-slate-300 rounded px-3 py-2 leading-relaxed focus:outline-none focus:ring-1 focus:ring-brand/40"
          />
          <div className="mt-2 text-right">
            <button
              onClick={() => runIngest("貼り付けテキスト（メール文・メモ）")}
              disabled={!pasteText.trim()}
              className="px-4 py-1.5 text-[12px] font-bold text-white rounded bg-ai hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center gap-1"
            >
              <Sparkles className="w-3.5 h-3.5" />
              この内容から条件を抽出
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (analyzing) {
    return (
      <div className="bg-white border border-slate-200 rounded-md p-12 text-center">
        <Loader2 className="w-12 h-12 text-brand mx-auto animate-spin mb-4" />
        <h2 className="text-[15px] font-bold text-slate-900 mb-2">「{sourceName}」をAIが解析中...</h2>
        <p className="text-[11px] text-slate-500 max-w-md mx-auto">
          取り込んだファイルから物件選定の観点と絶対条件を抽出しています。個人情報（氏名・連絡先等）は抽出対象に含めません。
        </p>
      </div>
    );
  }

  if (!analysis) return null;

  const customer = CUSTOMERS.find((c) => c.id === selectedCase.customerId);
  const attachments = selectedCase.attachments || [];

  // 確信度ゲート：しきい値未満かつ未確認の項目が残っていると次へ進めない
  const lowItems = [
    ...analysis.mustConditions.filter((c) => (c.confidence ?? 1) < CONFIDENCE_THRESHOLD),
    ...analysis.points.filter((p) => p.enabled && (p.confidence ?? 1) < CONFIDENCE_THRESHOLD),
  ];
  const unconfirmedCount = lowItems.filter((i) => !confirmed[i.id]).length;
  const canProceed = unconfirmedCount === 0;

  const ConfBadge = ({ value }) => {
    const pct = Math.round((value ?? 1) * 100);
    const low = (value ?? 1) < CONFIDENCE_THRESHOLD;
    return (
      <span className={`inline-flex items-center gap-0.5 text-[9px] px-1.5 py-0.5 rounded border ${
        low ? "bg-human-light text-human-dark border-human/30" : "bg-ai-light text-ai-dark border-ai/20"
      }`}>
        <Sparkles className="w-2.5 h-2.5" />
        確信度 {pct}%
      </span>
    );
  };

  const ConfirmControl = ({ item }) => {
    if ((item.confidence ?? 1) >= CONFIDENCE_THRESHOLD) return null;
    const done = !!confirmed[item.id];
    return (
      <div className="mt-1 flex items-center gap-2">
        <label className={`inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded border cursor-pointer ${
          done ? "bg-secure-light text-secure border-secure/30" : "bg-human-light text-human-dark border-human/40"
        }`}>
          <input type="checkbox" checked={done} onChange={() => confirmItem(item.id)} className="rounded" />
          {done ? "人間確認済み" : "要確認（97%未満）"}
        </label>
        {done && confirmed[item.id] && (
          <span className="text-[9px] text-slate-400">確認：{confirmed[item.id].by} / {confirmed[item.id].at}</span>
        )}
      </div>
    );
  };

  const Row = ({ label, value }) => (
    <div className="flex py-1 border-b border-slate-100 last:border-b-0">
      <span className="w-28 flex-shrink-0 text-[10px] text-slate-500">{label}</span>
      <span className="text-[11px] text-slate-800 flex-1 break-words">
        {value || <span className="text-slate-300">-</span>}
      </span>
    </div>
  );

  // 出典リンク（クリックでポップアップ）item8
  const SourceLink = ({ item }) => (
    <button
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); setSourcePopup(item); }}
      className="text-[10px] text-brand underline decoration-dotted hover:text-brand-dark inline-flex items-center gap-0.5"
    >
      <FileText className="w-2.5 h-2.5" />
      出典：{item.source}
    </button>
  );

  // スライダー（横バーでクリック調整）item5,6
  const SliderControl = ({ item, onChange }) => {
    const ticks = item.ticks || [];
    const step = item.tickStep || 1;
    const span = item.max - item.min || 1;
    const pct = (v) => ((v - item.min) / span) * 100;
    // 小さめの目盛り（細かい刻み）
    const minorTicks = [];
    for (let v = item.min; v <= item.max; v += step) minorTicks.push(v);
    return (
      <div className="mt-1">
        <div className="flex items-center gap-2">
          <input
            type="range"
            min={item.min}
            max={item.max}
            step={step}
            value={item.val}
            onChange={(e) => onChange(item.id, Number(e.target.value))}
            className="flex-1 accent-brand h-1.5"
          />
          <span className="text-[11px] font-bold text-brand-dark w-24 text-right">{item.val}{item.unit}</span>
        </div>
        {/* 目盛り（大きめ＝ラベル付き／小さめ＝補助） */}
        <div className="relative h-5 mr-[104px] ml-1 mt-0.5">
          {minorTicks.map((v) => (
            <span key={`m${v}`} className="absolute top-0 w-px h-1 bg-slate-300" style={{ left: `${pct(v)}%` }} />
          ))}
          {ticks.map((v) => (
            <span key={`M${v}`} className="absolute top-0 -translate-x-1/2" style={{ left: `${pct(v)}%` }}>
              <span className="block w-px h-2 bg-slate-500 mx-auto" />
              <span className="block text-[8.5px] text-slate-500 mt-0.5">{v}</span>
            </span>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-3">
      {/* ヘッダ */}
      <div className="bg-white border border-slate-200 rounded-md px-4 py-3">
        <h2 className="text-[14px] font-bold text-slate-900 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-ai" />
          STEP 2：AIによる物件選定の観点と絶対条件
        </h2>
        <p className="text-[11px] text-slate-500 mt-0.5">
          AIが案件データ・顧客情報・添付書類を構造化解析し、物件探しのポイントを抽出しました。チェックボックスで採用/解除を調整できます。
        </p>
        <div className="mt-2 flex items-center gap-2 flex-wrap">
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-ai-light text-ai-dark border border-ai/20">
            <UploadCloud className="w-3 h-3" />
            「{sourceName}」から抽出（初期値）
          </span>
          <button onClick={() => { setIngested(false); setAnalysis(null); setConfirmed({}); }} className="text-[10px] text-slate-500 underline hover:text-slate-700">
            別のファイルを取り込み直す
          </button>
        </div>
      </div>


      {/* 案件情報の一覧（3列） */}
      <div className="grid grid-cols-3 gap-3">
        {/* 顧客情報 */}
        <div className="bg-white border border-slate-200 rounded-md">
          <div className="px-3 py-2 border-b border-slate-100 bg-slate-50">
            <h3 className="text-[11px] font-bold text-slate-800">顧客情報</h3>
          </div>
          <div className="px-3 py-2">
            <Row label="法人名 / 顧客名" value={selectedCase.customerName} />
            <Row label="法人ID" value={<span className="font-mono text-[10px]">{customer?.id}</span>} />
            <Row label="業種" value={customer?.industry} />
            <Row label="法人形態" value={customer?.legalForm} />
            <Row label="従業員数" value={customer?.employees ? `${Number(customer.employees).toLocaleString()}名` : null} />
            <Row label="本社所在地" value={customer ? `${customer.prefecture || ""}${customer.city || ""}${customer.addressLine || ""}` : null} />
            <Row label="代表電話" value={customer?.headPhone} />
            <Row label="ご担当窓口" value={selectedCase.contact} />
          </div>
        </div>

        {/* 案件詳細 */}
        <div className="bg-white border border-slate-200 rounded-md">
          <div className="px-3 py-2 border-b border-slate-100 bg-slate-50">
            <h3 className="text-[11px] font-bold text-slate-800">案件詳細</h3>
          </div>
          <div className="px-3 py-2">
            <Row label="案件ID" value={<span className="font-mono text-[10px]">{selectedCase.id}</span>} />
            <Row label="利用目的" value={selectedCase.purpose} />
            <Row label="入居者" value={selectedCase.occupant} />
            <Row label="人数" value={selectedCase.occupantCount ? `${selectedCase.occupantCount}名` : null} />
            <Row label="勤務地" value={selectedCase.workplace} />
            <Row label="主担当者" value={selectedCase.mainAssignee} />
            <Row label="受領日時" value={selectedCase.receivedAt} />
            <Row label="受領チャネル" value={selectedCase.channel} />
            <Row label="対応期限" value={selectedCase.deadline} />
            <Row label="ステータス" value={selectedCase.status} />
          </div>
        </div>

        {/* 希望条件 */}
        <div className="bg-white border border-slate-200 rounded-md">
          <div className="px-3 py-2 border-b border-slate-100 bg-slate-50">
            <h3 className="text-[11px] font-bold text-slate-800">希望条件</h3>
          </div>
          <div className="px-3 py-2">
            <Row label="希望エリア" value={(selectedCase.preferredArea || []).join("、")} />
            <Row label="利用開始" value={selectedCase.startDate} />
            <Row label="利用期間" value={selectedCase.duration} />
            <Row label="予算下限" value={selectedCase.budgetMin ? `¥${Number(selectedCase.budgetMin).toLocaleString()} / 月` : null} />
            <Row label="予算上限" value={selectedCase.budgetMax ? `¥${Number(selectedCase.budgetMax).toLocaleString()} / 月` : null} />
            <Row label="備考" value={selectedCase.notes} />
          </div>
        </div>
      </div>

      {/* 添付書類リスト */}
      <div className="bg-white border border-slate-200 rounded-md">
        <div className="px-4 py-2.5 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
          <Paperclip className="w-3.5 h-3.5 text-slate-600" />
          <h3 className="text-[12px] font-bold text-slate-800">添付書類（{attachments.length}）</h3>
          <span className="text-[10px] text-slate-500 ml-2">クリックで内容プレビューが見られます。AI解析の根拠データです。</span>
        </div>
        {attachments.length > 0 ? (
          <ul className="divide-y divide-slate-100">
            {attachments.map((a) => {
              const fi = getFileIcon(a.name);
              const FIcon = fi.Icon;
              const cat = ATTACHMENT_CATEGORIES.find((x) => x.id === a.category);
              return (
                <li key={a.id}>
                  <button
                    onClick={() => setPreviewDoc(a)}
                    className="w-full px-4 py-2 flex items-center gap-3 hover:bg-slate-50 text-left transition"
                  >
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
                    </div>
                    <Eye className="w-4 h-4 text-slate-300 flex-shrink-0" />
                  </button>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="px-4 py-6 text-center text-[11px] text-slate-400">
            この案件には添付書類がありません
          </div>
        )}
      </div>

      {/* 絶対条件 */}
      <div className="bg-white border border-rose-200 rounded-md">
        <div className="px-4 py-3 border-b border-rose-100 bg-rose-50/50">
          <h3 className="text-[13px] font-bold text-rose-800">
            絶対に満たさなければならない条件
          </h3>
          <p className="text-[10px] text-rose-700/80 mt-0.5">
            社宅規定・依頼書から抽出された必須条件です。チェックを外すと条件として適用しません。
          </p>
        </div>
        <ul className="divide-y divide-rose-50">
          {analysis.mustConditions.map((c) => (
            <li key={c.id} className="px-4 py-2.5 hover:bg-rose-50/30">
              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  checked={c.enabled}
                  onChange={() => toggleMust(c.id)}
                  className="rounded text-rose-500 mt-1"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-[12px] font-bold ${c.enabled ? "text-slate-900" : "text-slate-400 line-through"}`}>
                      {c.label}
                      {c.kind === "text" && <>：<span className="text-rose-700">{c.value}</span></>}
                      {c.kind === "bool" && <>：<span className="text-rose-700">{c.val ? "必須" : "問わない"}</span></>}
                    </span>
                    <ConfBadge value={c.confidence} />
                  </div>
                  {c.kind === "slider" && c.enabled && (
                    <SliderControl item={c} onChange={setMustVal} />
                  )}
                  {c.kind === "bool" && (
                    <label className="inline-flex items-center gap-1 text-[10px] text-slate-600 mt-1 cursor-pointer">
                      <input type="checkbox" checked={!!c.val} onChange={(e) => setMustBool(c.id, e.target.checked)} className="rounded" />
                      駐車場ありの物件のみに絞る
                    </label>
                  )}
                  <div className="mt-0.5"><SourceLink item={c} /></div>
                  <ConfirmControl item={c} />
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* 推奨ポイント */}
      <div className="bg-white border border-amber-200 rounded-md">
        <div className="px-4 py-3 border-b border-amber-100 bg-amber-50/50">
          <h3 className="text-[13px] font-bold text-amber-800 flex items-center gap-2">
            <Lightbulb className="w-3.5 h-3.5" />
            物件探しのポイント（推奨観点）
          </h3>
          <p className="text-[10px] text-amber-700/80 mt-0.5">
            必須ではないが「マッチ度」の評価に使用します。チェックを外せばその観点を考慮しません。
          </p>
        </div>
        <div className="px-4 py-2 border-b border-amber-50 text-[10px] text-amber-700/80">
          ⠿ をドラッグして<strong>優先順位</strong>を並び替えできます（上ほど優先）。
        </div>
        <ul className="divide-y divide-amber-50">
          {[...analysis.points].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)).map((p, idx) => (
            <li
              key={p.id}
              draggable
              onDragStart={() => setDragId(p.id)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => { if (dragId) reorderPoints(dragId, p.id); setDragId(null); }}
              className={`px-4 py-2.5 hover:bg-amber-50/30 ${dragId === p.id ? "opacity-40" : ""}`}
            >
              <div className="flex items-start gap-2">
                <span className="text-slate-300 cursor-grab active:cursor-grabbing select-none mt-0.5" title="ドラッグで並び替え">⠿</span>
                <span className="text-[10px] font-bold text-amber-600 w-4 mt-0.5">{idx + 1}</span>
                <input
                  type="checkbox"
                  checked={p.enabled}
                  onChange={() => togglePoint(p.id)}
                  className="rounded text-amber-500 mt-0.5"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-[12px] font-bold ${p.enabled ? "text-slate-900" : "text-slate-400 line-through"}`}>
                      {p.label}
                      {p.kind === "slider" && <>：<span className="text-amber-700">{p.val}{p.unit}</span></>}
                    </span>
                    <ConfBadge value={p.confidence} />
                  </div>
                  {p.kind === "slider" && p.enabled && (
                    <SliderControl item={p} onChange={setPointVal} />
                  )}
                  <div className="mt-0.5"><SourceLink item={p} /></div>
                  {p.enabled && <ConfirmControl item={p} />}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* 特徴タグ（ボタン選択）item2 */}
      <div className="bg-white border border-slate-200 rounded-md">
        <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
          <h3 className="text-[13px] font-bold text-slate-800">特徴タグで条件を追加</h3>
          <p className="text-[10px] text-slate-500 mt-0.5">よく使う特徴をボタンで選択して条件に追加できます（クリックで ON/OFF）。</p>
        </div>
        <div className="px-4 py-3 flex flex-wrap gap-1.5">
          {FEATURE_TAGS.map((tag) => {
            const on = (analysis.featureTags || []).includes(tag);
            return (
              <button
                key={tag}
                onClick={() => toggleFeatureTag(tag)}
                className={`text-[11px] px-2.5 py-1 rounded-full border transition ${
                  on ? "bg-brand text-white border-brand" : "bg-white text-slate-600 border-slate-300 hover:border-brand hover:text-brand"
                }`}
              >
                {on ? "✓ " : "+ "}{tag}
              </button>
            );
          })}
        </div>
      </div>

      {/* ナビゲーション */}
      <div className="bg-white border border-slate-200 rounded-md px-4 py-3 flex items-center justify-between gap-3">
        <button
          onClick={onBack}
          className="px-3 py-1.5 text-[12px] border border-slate-300 rounded text-slate-700 hover:bg-slate-50 inline-flex items-center gap-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          案件選択に戻る
        </button>
        <div className="flex items-center gap-3 min-w-0">
          {!canProceed && (
            <span className="inline-flex items-center gap-1 text-[11px] text-human-dark">
              <ShieldAlert className="w-3.5 h-3.5" />
              確信度 {Math.round(CONFIDENCE_THRESHOLD * 100)}% 未満の項目が {unconfirmedCount} 件あります。人間の確認が必要です。
            </span>
          )}
          <button
            onClick={onNext}
            disabled={!canProceed}
            className={`px-4 py-1.5 text-[12px] font-bold rounded inline-flex items-center gap-1 ${
              canProceed
                ? "text-white bg-brand hover:bg-brand-dark"
                : "text-slate-400 bg-slate-100 border border-slate-200 cursor-not-allowed"
            }`}
          >
            この条件で物件検索へ進む
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 書類プレビューダイアログ */}
      {previewDoc && (
        <DocumentPreviewDialog
          attachment={previewDoc}
          selectedCase={selectedCase}
          onClose={() => setPreviewDoc(null)}
        />
      )}

      {/* 出典ポップアップ item8 */}
      {sourcePopup && (
        <div className="fixed inset-0 z-[2100] bg-slate-900/50 flex items-center justify-center p-4" onClick={() => setSourcePopup(null)}>
          <div className="bg-white rounded-md shadow-xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="px-5 py-3 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-[13px] font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-brand" />
                出典：{sourcePopup.source}
              </h3>
              <button onClick={() => setSourcePopup(null)} className="w-7 h-7 inline-flex items-center justify-center rounded hover:bg-slate-100 text-slate-500"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-5">
              <div className="text-[11px] text-slate-500 mb-1">抽出条件</div>
              <div className="text-[13px] font-bold text-slate-900 mb-3">{sourcePopup.label}</div>
              <div className="text-[11px] text-slate-500 mb-1">該当箇所（出典抜粋）</div>
              <div className="text-[12px] text-slate-800 bg-slate-50 border-l-4 border-brand rounded px-3 py-2 leading-relaxed">
                {sourcePopup.sourceDetail || "（出典の詳細は登録されていません）"}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


// ====================================================================
// Leaflet 用：カスタム賃料ピン（divIcon）
// ====================================================================
function makePriceIcon(rent, status, number) {
  // status: "candidate" | "selected" | "normal"
  const palette = {
    candidate: { bg: "#003087", fg: "#fff", border: "#003087" },
    selected: { bg: "#f43f5e", fg: "#fff", border: "#f43f5e" },
    normal: { bg: "#fff", fg: "#0f172a", border: "#cbd5e1" },
  }[status] || { bg: "#fff", fg: "#0f172a", border: "#cbd5e1" };
  const label = `¥${(rent / 10000).toFixed(1)}万`;
  const numberBadge = number
    ? `<div style="position:absolute;top:-9px;left:-9px;width:18px;height:18px;border-radius:50%;background:#e60012;color:#fff;font-size:11px;font-weight:800;display:flex;align-items:center;justify-content:center;box-shadow:0 1px 3px rgba(0,0,0,.3);border:1.5px solid #fff;">${number}</div>`
    : "";
  const html = `
    <div style="position:relative;display:flex;flex-direction:column;align-items:center;">
      ${numberBadge}
      <div style="background:${palette.bg};color:${palette.fg};border:1px solid ${palette.border};padding:3px 7px;border-radius:6px;box-shadow:0 1px 3px rgba(0,0,0,.2);font-size:11px;font-weight:700;white-space:nowrap;line-height:1;">
        ${label}
      </div>
      <div style="width:0;height:0;border-left:5px solid transparent;border-right:5px solid transparent;border-top:6px solid ${palette.border};margin-top:-1px;"></div>
    </div>
  `;
  return L.divIcon({
    className: "leaflet-price-icon",
    html,
    iconSize: [60, 28],
    iconAnchor: [30, 28],
    popupAnchor: [0, -28],
  });
}

// item14: 周辺POI（駅・スーパー・コンビニ・高速IC）アイコン
function makePoiIcon(emoji, color) {
  return L.divIcon({
    className: "leaflet-poi-icon",
    html: `<div style="width:22px;height:22px;border-radius:50%;background:${color};border:2px solid #fff;box-shadow:0 1px 3px rgba(0,0,0,.3);display:flex;align-items:center;justify-content:center;font-size:12px;">${emoji}</div>`,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
  });
}
// 中心周辺に「それっぽい」POIを配置（モック）
function generatePois(center) {
  const [lat, lng] = center;
  return [
    { id: "poi-st", kind: "駅", name: "上板橋駅", emoji: "🚉", color: "#2563eb", lat: lat + 0.004, lng: lng - 0.006 },
    { id: "poi-st2", kind: "駅", name: "ときわ台駅", emoji: "🚉", color: "#2563eb", lat: lat - 0.006, lng: lng + 0.007 },
    { id: "poi-sm1", kind: "スーパー", name: "スーパーオオゼキ", emoji: "🛒", color: "#16a34a", lat: lat + 0.002, lng: lng + 0.003 },
    { id: "poi-sm2", kind: "スーパー", name: "ライフ", emoji: "🛒", color: "#16a34a", lat: lat - 0.003, lng: lng - 0.004 },
    { id: "poi-cv1", kind: "コンビニ", name: "セブンイレブン", emoji: "🏪", color: "#f59e0b", lat: lat + 0.001, lng: lng - 0.002 },
    { id: "poi-cv2", kind: "コンビニ", name: "ローソン", emoji: "🏪", color: "#f59e0b", lat: lat - 0.002, lng: lng + 0.002 },
    { id: "poi-ic", kind: "高速IC", name: "高島平出入口（首都高）", emoji: "🛣️", color: "#7c3aed", lat: lat + 0.007, lng: lng + 0.008 },
  ];
}
// 価格ピン（物件）が密集するエリアを優先表示するため、物件範囲に地図を合わせる
function FitToPins({ properties }) {
  const map = useMap();
  useEffect(() => {
    const pts = properties.filter((p) => p.lat && p.lng).map((p) => [p.lat, p.lng]);
    if (pts.length === 0) return;
    if (pts.length === 1) { map.setView(pts[0], 15); return; }
    try {
      map.fitBounds(pts, { padding: [50, 50], maxZoom: 16 });
    } catch (e) { /* noop */ }
  }, [properties, map]);
  return null;
}

function LeafletMap({ properties, candidateIds, candidateNumber = {}, selectedId, onSelect }) {
  // 表示中心：物件の lat/lng の平均（なければ東京中心）
  const center = useMemo(() => {
    const validPoints = properties.filter((p) => p.lat && p.lng);
    if (validPoints.length === 0) return [35.6812, 139.7671]; // 東京駅
    const avgLat = validPoints.reduce((s, p) => s + p.lat, 0) / validPoints.length;
    const avgLng = validPoints.reduce((s, p) => s + p.lng, 0) / validPoints.length;
    return [avgLat, avgLng];
  }, [properties]);

  return (
    <MapContainer
      center={center}
      zoom={13}
      scrollWheelZoom={true}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FitToPins properties={properties} />
      {properties
        .filter((p) => p.lat && p.lng)
        .map((p) => {
          const isCandidate = candidateIds.includes(p.id);
          const isSelected = selectedId === p.id;
          const status = isCandidate ? "candidate" : isSelected ? "selected" : "normal";
          return (
            <Marker
              key={p.id}
              position={[p.lat, p.lng]}
              icon={makePriceIcon(p.rent, status, candidateNumber[p.id])}
              zIndexOffset={1000}
              eventHandlers={{
                click: () => onSelect(p),
              }}
            >
              <Tooltip direction="top" offset={[0, -28]} opacity={1} className="leaflet-property-tooltip">
                <div style={{ minWidth: 220, padding: "2px 0" }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", lineHeight: 1.3 }}>{p.name}</div>
                  <div style={{ fontSize: 10, color: "#64748b", marginTop: 3, lineHeight: 1.3 }}>{p.address}</div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginTop: 6 }}>
                    <span style={{ fontSize: 18, fontWeight: 800, color: "#e11d48", lineHeight: 1 }}>
                      ¥{Number(p.rent).toLocaleString()}
                    </span>
                    <span style={{ fontSize: 10, color: "#64748b" }}>/月</span>
                    {typeof p.fee === "number" && (
                      <span style={{ fontSize: 10, color: "#64748b", marginLeft: 4 }}>
                        +管理費 ¥{Number(p.fee).toLocaleString()}
                      </span>
                    )}
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 6 }}>
                    <span style={{ fontSize: 10, padding: "1px 6px", background: "#f1f5f9", color: "#334155", borderRadius: 3, fontWeight: 600 }}>
                      {p.layout || "-"}
                    </span>
                    <span style={{ fontSize: 10, padding: "1px 6px", background: "#f1f5f9", color: "#334155", borderRadius: 3, fontWeight: 600 }}>
                      {p.size ? `${p.size}㎡` : "-"}
                    </span>
                    <span style={{ fontSize: 10, padding: "1px 6px", background: "#f1f5f9", color: "#334155", borderRadius: 3, fontWeight: 600 }}>
                      築{p.age || "-"}年
                    </span>
                    <span style={{ fontSize: 10, padding: "1px 6px", background: "#f1f5f9", color: "#334155", borderRadius: 3, fontWeight: 600 }}>
                      {p.station ? `${p.station}駅 徒歩${p.walkMin}分` : "-"}
                    </span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 6, fontSize: 9, color: "#0066c8", fontWeight: 600 }}>
                    <span style={{ marginLeft: "auto" }}>
                      クリックで詳細
                    </span>
                  </div>
                </div>
              </Tooltip>
            </Marker>
          );
        })}
    </MapContainer>
  );
}

// 物件画像プレースホルダー
// 物件画像プレースホルダー：間取り図サンプル（オリジナルSVG）
function BuildingPlaceholder() {
  return (
    <svg viewBox="0 0 240 150" preserveAspectRatio="xMidYMid meet" className="absolute inset-0 w-full h-full bg-white">
      <rect x="0" y="0" width="240" height="150" fill="#fbfdff" />
      {/* 敷地フェンス */}
      <rect x="6" y="6" width="228" height="138" fill="none" stroke="#cbd5e1" strokeDasharray="4 3" strokeWidth="1" />
      {/* 建物外枠 */}
      <rect x="18" y="34" width="118" height="100" fill="#fff" stroke="#334155" strokeWidth="2" />
      {/* 洋室 */}
      <rect x="22" y="38" width="70" height="58" fill="#eef2ff" stroke="#cbd5e1" />
      <text x="28" y="70" fontSize="9" fill="#475569">洋室 6.0帖</text>
      {/* キッチン */}
      <rect x="96" y="38" width="36" height="30" fill="#fef9c3" stroke="#cbd5e1" />
      <text x="100" y="56" fontSize="6.5" fill="#475569">キッチン</text>
      {/* UB / WC */}
      <rect x="96" y="72" width="18" height="24" fill="#e0f2fe" stroke="#cbd5e1" />
      <text x="98" y="86" fontSize="5.5" fill="#475569">UB</text>
      <rect x="116" y="72" width="16" height="24" fill="#e0f2fe" stroke="#cbd5e1" />
      <text x="118" y="86" fontSize="5.5" fill="#475569">WC</text>
      {/* 玄関 */}
      <rect x="22" y="100" width="36" height="30" fill="#f1f5f9" stroke="#cbd5e1" />
      <text x="28" y="118" fontSize="7" fill="#475569">玄関</text>
      {/* バルコニー */}
      <rect x="62" y="100" width="70" height="30" fill="#dcfce7" stroke="#cbd5e1" />
      <text x="74" y="118" fontSize="7" fill="#475569">バルコニー</text>
      {/* オートロック */}
      <circle cx="20" cy="115" r="5" fill="#2563eb" />
      <text x="14" y="140" fontSize="6.5" fill="#2563eb">●オートロック</text>
      {/* 駐車場 */}
      <rect x="150" y="34" width="78" height="48" fill="#f1f5f9" stroke="#94a3b8" />
      <text x="165" y="60" fontSize="8" fill="#64748b">駐車場</text>
      <line x1="176" y1="34" x2="176" y2="82" stroke="#cbd5e1" />
      <line x1="202" y1="34" x2="202" y2="82" stroke="#cbd5e1" />
      {/* 駐輪場 */}
      <rect x="150" y="90" width="78" height="44" fill="#f8fafc" stroke="#94a3b8" />
      <text x="165" y="115" fontSize="7.5" fill="#64748b">駐輪場</text>
      {/* 方位 */}
      <text x="222" y="22" fontSize="8" fill="#64748b">N↑</text>
      <text x="120" y="16" fontSize="7" fill="#94a3b8" textAnchor="middle">間取りサンプル（1K）</text>
    </svg>
  );
}

// ====================================================================
// 条件絞り込みパネル（網羅版）
// ====================================================================
const PROPERTY_TYPES = ["マンション", "アパート", "戸建", "テラスハウス", "メゾネット"];
const LAYOUTS = ["1R", "1K", "1DK", "1LDK", "2K", "2DK", "2LDK", "3LDK", "3DK"];
const DIRECTIONS = ["南", "東", "西", "北", "南東", "南西", "北東", "北西"];
const STRUCTURES = ["RC", "SRC", "鉄骨", "木造"];
const LINES = ["東京メトロ東西線", "都営大江戸線", "JR京葉線", "東京メトロ有楽町線", "東京メトロ南北線", "りんかい線", "ゆりかもめ"];
const CONTRACT_TYPES = ["普通借家", "定期借家", "サブリース"];
const FEATURE_GROUPS = [
  {
    label: "セキュリティ・暮らし",
    items: ["オートロック", "宅配BOX", "TVモニタ付インターホン", "防犯カメラ", "管理人常駐", "管理人巡回"],
  },
  {
    label: "室内設備",
    items: ["家具家電付き", "Wi-Fi対応", "エアコン", "IHコンロ", "ガスコンロ", "システムキッチン", "独立洗面台", "浴室乾燥機", "追い焚き", "温水洗浄便座", "ウォシュレット", "床暖房"],
  },
  {
    label: "建物・共用",
    items: ["エレベーター", "オートロック", "ロビー", "ラウンジ", "ジム", "コンシェルジュ"],
  },
  {
    label: "条件・許可",
    items: ["ペット可", "楽器可", "二人入居可", "外国人可", "ルームシェア可", "高齢者可", "事務所利用可", "即入居可"],
  },
];

function FilterPanel({ filters, setFilters }) {
  const toggleIn = (key, value) => {
    setFilters((f) => {
      const arr = f[key] || [];
      return { ...f, [key]: arr.includes(value) ? arr.filter((x) => x !== value) : [...arr, value] };
    });
  };
  const set = (key, value) => setFilters((f) => ({ ...f, [key]: value }));

  const reset = () => setFilters({
    budgetMin: 0,
    budgetMax: 300000,
    feeMax: 99999,
    depositMax: 99999,
    keyMoneyMax: 99999,
    sizeMin: 0,
    sizeMax: 200,
    types: [],
    layouts: [],
    floorMin: 0,
    directions: [],
    lines: [],
    walkMax: 99,
    ageMax: 99,
    structures: [],
    contractTypes: [],
    parking: "any",
    features: [],
  });

  const F = ({ title, children, defaultOpen = true }) => (
    <details open={defaultOpen} className="border-b border-slate-100 pb-2">
      <summary className="cursor-pointer py-2 text-[11px] font-bold text-slate-700 select-none flex items-center justify-between">
        <span>{title}</span>
        <span className="text-slate-400 text-[10px]">▾</span>
      </summary>
      <div className="pt-1">{children}</div>
    </details>
  );

  return (
    <div className="bg-white border border-slate-200 rounded-md self-start">
      <div className="px-3 py-2 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
        <h3 className="text-[12px] font-bold text-slate-700">条件で絞り込み</h3>
        <button onClick={reset} className="text-[10px] text-slate-500 hover:text-slate-700 underline">
          全てリセット
        </button>
      </div>

      <div className="p-3 space-y-1 max-h-[760px] overflow-y-auto text-[11px]">

        {/* 家賃 */}
        <F title="家賃 / 管理費 / 初期費用">
          <div className="space-y-2">
            <div>
              <div className="text-[10px] text-slate-500 mb-1">家賃</div>
              <div className="flex items-center gap-1">
                <input type="number" value={filters.budgetMin} onChange={(e) => set("budgetMin", Number(e.target.value))} className="w-full px-1.5 py-1 border border-slate-300 rounded text-right" />
                <span>〜</span>
                <input type="number" value={filters.budgetMax} onChange={(e) => set("budgetMax", Number(e.target.value))} className="w-full px-1.5 py-1 border border-slate-300 rounded text-right" />
                <span className="text-slate-500 text-[10px]">円</span>
              </div>
            </div>
            <div>
              <div className="text-[10px] text-slate-500 mb-1">管理費（上限）</div>
              <input type="number" value={filters.feeMax} onChange={(e) => set("feeMax", Number(e.target.value))} className="w-full px-1.5 py-1 border border-slate-300 rounded text-right" />
            </div>
            <div>
              <div className="text-[10px] text-slate-500 mb-1">敷金（上限）</div>
              <input type="number" value={filters.depositMax} onChange={(e) => set("depositMax", Number(e.target.value))} className="w-full px-1.5 py-1 border border-slate-300 rounded text-right" />
            </div>
            <div>
              <div className="text-[10px] text-slate-500 mb-1">礼金（上限）</div>
              <input type="number" value={filters.keyMoneyMax} onChange={(e) => set("keyMoneyMax", Number(e.target.value))} className="w-full px-1.5 py-1 border border-slate-300 rounded text-right" />
            </div>
          </div>
        </F>

        {/* 物件種別 */}
        <F title="物件種別" defaultOpen={false}>
          <div className="grid grid-cols-2 gap-1">
            {PROPERTY_TYPES.map((t) => (
              <label key={t} className={`text-[10px] text-center px-1 py-1 border rounded cursor-pointer ${
                filters.types.includes(t) ? "border-brand bg-brand-light text-brand-dark font-bold" : "border-slate-200 text-slate-700 hover:bg-slate-50"
              }`}>
                <input type="checkbox" checked={filters.types.includes(t)} onChange={() => toggleIn("types", t)} className="hidden" />
                {t}
              </label>
            ))}
          </div>
        </F>

        {/* 間取り */}
        <F title="間取り">
          <div className="grid grid-cols-3 gap-1">
            {LAYOUTS.map((l) => (
              <label key={l} className={`text-[10px] text-center px-1 py-1 border rounded cursor-pointer ${
                filters.layouts.includes(l) ? "border-brand bg-brand-light text-brand-dark font-bold" : "border-slate-200 text-slate-700 hover:bg-slate-50"
              }`}>
                <input type="checkbox" checked={filters.layouts.includes(l)} onChange={() => toggleIn("layouts", l)} className="hidden" />
                {l}
              </label>
            ))}
          </div>
        </F>

        {/* 専有面積 */}
        <F title="専有面積 / 階数">
          <div className="space-y-2">
            <div>
              <div className="text-[10px] text-slate-500 mb-1">専有面積（㎡）</div>
              <div className="flex items-center gap-1">
                <input type="number" value={filters.sizeMin} onChange={(e) => set("sizeMin", Number(e.target.value))} className="w-full px-1.5 py-1 border border-slate-300 rounded text-right" />
                <span>〜</span>
                <input type="number" value={filters.sizeMax} onChange={(e) => set("sizeMax", Number(e.target.value))} className="w-full px-1.5 py-1 border border-slate-300 rounded text-right" />
              </div>
            </div>
            <div>
              <div className="text-[10px] text-slate-500 mb-1">部屋階（下限）</div>
              <select value={filters.floorMin} onChange={(e) => set("floorMin", Number(e.target.value))} className="w-full px-2 py-1 border border-slate-300 rounded">
                <option value={0}>指定なし</option>
                <option value={2}>2階以上</option>
                <option value={3}>3階以上</option>
                <option value={5}>5階以上</option>
                <option value={10}>10階以上</option>
              </select>
            </div>
          </div>
        </F>

        {/* 向き */}
        <F title="向き" defaultOpen={false}>
          <div className="grid grid-cols-4 gap-1">
            {DIRECTIONS.map((d) => (
              <label key={d} className={`text-[10px] text-center px-1 py-1 border rounded cursor-pointer ${
                filters.directions.includes(d) ? "border-brand bg-brand-light text-brand-dark font-bold" : "border-slate-200 text-slate-700 hover:bg-slate-50"
              }`}>
                <input type="checkbox" checked={filters.directions.includes(d)} onChange={() => toggleIn("directions", d)} className="hidden" />
                {d}
              </label>
            ))}
          </div>
        </F>

        {/* 路線 */}
        <F title="路線" defaultOpen={false}>
          <div className="space-y-1">
            {LINES.map((line) => (
              <label key={line} className="flex items-center gap-1.5 cursor-pointer">
                <input type="checkbox" checked={filters.lines.includes(line)} onChange={() => toggleIn("lines", line)} className="rounded text-brand" />
                <span className="truncate">{line}</span>
              </label>
            ))}
          </div>
        </F>

        {/* 駅徒歩 / 築年数 */}
        <F title="駅徒歩 / 築年数">
          <div className="space-y-2">
            <div>
              <div className="text-[10px] text-slate-500 mb-1">駅徒歩</div>
              <select value={filters.walkMax} onChange={(e) => set("walkMax", Number(e.target.value))} className="w-full px-2 py-1 border border-slate-300 rounded">
                <option value={99}>指定なし</option>
                <option value={3}>3分以内</option>
                <option value={5}>5分以内</option>
                <option value={10}>10分以内</option>
                <option value={15}>15分以内</option>
                <option value={20}>20分以内</option>
              </select>
            </div>
            <div>
              <div className="text-[10px] text-slate-500 mb-1">築年数</div>
              <select value={filters.ageMax} onChange={(e) => set("ageMax", Number(e.target.value))} className="w-full px-2 py-1 border border-slate-300 rounded">
                <option value={99}>指定なし</option>
                <option value={3}>3年以内</option>
                <option value={5}>5年以内</option>
                <option value={10}>10年以内</option>
                <option value={20}>20年以内</option>
                <option value={30}>30年以内</option>
              </select>
            </div>
          </div>
        </F>

        {/* 構造 */}
        <F title="建物構造" defaultOpen={false}>
          <div className="grid grid-cols-2 gap-1">
            {STRUCTURES.map((s) => (
              <label key={s} className={`text-[10px] text-center px-1 py-1 border rounded cursor-pointer ${
                filters.structures.includes(s) ? "border-brand bg-brand-light text-brand-dark font-bold" : "border-slate-200 text-slate-700 hover:bg-slate-50"
              }`}>
                <input type="checkbox" checked={filters.structures.includes(s)} onChange={() => toggleIn("structures", s)} className="hidden" />
                {s}
              </label>
            ))}
          </div>
        </F>

        {/* 駐車場 */}
        <F title="駐車場" defaultOpen={false}>
          <div className="space-y-1">
            {[
              { v: "any", l: "指定なし" },
              { v: "yes", l: "あり" },
              { v: "no", l: "なし" },
            ].map((o) => (
              <label key={o.v} className="flex items-center gap-1.5 cursor-pointer">
                <input type="radio" name="parking" checked={filters.parking === o.v} onChange={() => set("parking", o.v)} />
                {o.l}
              </label>
            ))}
          </div>
        </F>

        {/* 契約形態 */}
        <F title="契約形態" defaultOpen={false}>
          <div className="space-y-1">
            {CONTRACT_TYPES.map((c) => (
              <label key={c} className="flex items-center gap-1.5 cursor-pointer">
                <input type="checkbox" checked={filters.contractTypes.includes(c)} onChange={() => toggleIn("contractTypes", c)} className="rounded text-brand" />
                {c}
              </label>
            ))}
          </div>
        </F>

        {/* こだわり設備 */}
        <F title="こだわり条件・設備">
          <div className="space-y-3">
            {FEATURE_GROUPS.map((g) => (
              <div key={g.label}>
                <div className="text-[10px] text-slate-500 font-bold mb-1">{g.label}</div>
                <div className="space-y-1">
                  {g.items.map((f) => (
                    <label key={f} className="flex items-center gap-1.5 cursor-pointer">
                      <input type="checkbox" checked={filters.features.includes(f)} onChange={() => toggleIn("features", f)} className="rounded text-brand" />
                      {f}
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </F>

      </div>
    </div>
  );
}

// ====================================================================
// 特記の「社内表現 → 顧客向け表現」変換パネル（S2）
// ====================================================================
function ExpressionConversionPanel({ candidates }) {
  // 編集後テキストの保持 { [propId]: editedString }
  const [edited, setEdited] = useState({});

  return (
    <div className="bg-white border border-slate-200 rounded-md">
      <div className="px-4 py-3 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
        <Sparkles className="w-3.5 h-3.5 text-ai" />
        <h3 className="text-[13px] font-bold text-slate-800">特記の顧客向け変換</h3>
        <span className="text-[10px] text-slate-500 ml-1">社内向け特記を顧客に出せる表現へ自動変換します。変換後は編集できます。</span>
      </div>
      <ul className="divide-y divide-slate-100">
        {candidates.map((p) => {
          const src = p.internalNotes || "（社内特記なし）";
          const { converted, matches } = convertExpressions(src);
          const lowConf = matches.some((m) => m.confidence < CONFIDENCE_THRESHOLD);
          const unmatched = !p.internalNotes; // マッピング対象が無い
          const value = edited[p.id] !== undefined ? edited[p.id] : converted;
          return (
            <li key={p.id} className="px-4 py-3">
              <div className="text-[11px] font-bold text-slate-800 mb-1.5">{p.name}<span className="text-slate-400 font-mono ml-2 text-[10px]">{p.id}</span></div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-[9px] text-slate-400 mb-0.5">社内表現（原文）</div>
                  <div className="text-[11px] text-slate-700 bg-slate-50 border border-slate-200 rounded px-2 py-1.5 whitespace-pre-wrap leading-relaxed">{src}</div>
                </div>
                <div>
                  <div className="text-[9px] text-slate-400 mb-0.5 flex items-center justify-between">
                    <span>顧客向け表現（編集可）</span>
                    {lowConf && (
                      <span className="inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded border bg-human-light text-human-dark border-human/40">
                        <ShieldAlert className="w-2.5 h-2.5" />要確認
                      </span>
                    )}
                    {unmatched && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded border bg-slate-100 text-slate-500 border-slate-200">未登録（要確認）</span>
                    )}
                  </div>
                  <textarea
                    value={value}
                    onChange={(e) => setEdited((s) => ({ ...s, [p.id]: e.target.value }))}
                    rows={2}
                    className="w-full text-[11px] text-slate-800 bg-secure-light/40 border border-secure/30 rounded px-2 py-1.5 leading-relaxed focus:outline-none focus:ring-1 focus:ring-secure/40"
                  />
                </div>
              </div>
              {matches.length > 0 && (
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {matches.map((m, i) => (
                    <span key={i} className={`text-[9px] px-1.5 py-0.5 rounded border ${
                      m.confidence < CONFIDENCE_THRESHOLD ? "bg-human-light text-human-dark border-human/30" : "bg-ai-light text-ai-dark border-ai/20"
                    }`} title={m.note}>
                      {m.internal}→{m.customer.length > 14 ? m.customer.slice(0, 14) + "…" : m.customer}（{Math.round(m.confidence * 100)}%）
                    </span>
                  ))}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

// ====================================================================
// STEP 3: 物件検索（SUUMO/HOMES 風 + Leaflet）
// ====================================================================
function Step3PropertySearch({ analysis, candidates, setCandidates, onNext, onBack }) {
  const [viewMode, setViewMode] = useState("map"); // 初期表示は地図
  const [selected, setSelected] = useState(null);
  const [sortKey, setSortKey] = useState("rent_asc");

  const initialBudgetMax = Number(
    (analysis?.mustConditions?.find((c) => c.id === "rent")?.value || "").replace(/[^0-9]/g, "")
  ) || 300000;
  const initialBudgetMin = Number(
    (analysis?.mustConditions?.find((c) => c.id === "rent_min")?.value || "").replace(/[^0-9]/g, "")
  ) || 0;

  const [filters, setFilters] = useState({
    budgetMin: initialBudgetMin,
    budgetMax: initialBudgetMax,
    feeMax: 99999,
    depositMax: 99999,
    keyMoneyMax: 99999,
    sizeMin: 0,
    sizeMax: 200,
    types: [],
    layouts: [],
    floorMin: 0,
    directions: [],
    lines: [],
    walkMax: 99,
    ageMax: 99,
    structures: [],
    contractTypes: [],
    parking: "any",
    features: [],
  });

  // 物件リスト（マッチ度は計算しない）
  const properties = PROPERTIES;

  // 絞り込み（データに該当フィールドがなければ通過）
  const filtered = useMemo(() => {
    return properties
      .filter((p) => {
        if (p.rent < filters.budgetMin || p.rent > filters.budgetMax) return false;
        if (typeof p.fee === "number" && p.fee > filters.feeMax) return false;
        if (typeof p.deposit === "number" && p.deposit > filters.depositMax) return false;
        if (typeof p.keyMoney === "number" && p.keyMoney > filters.keyMoneyMax) return false;
        if (typeof p.size === "number" && (p.size < filters.sizeMin || p.size > filters.sizeMax)) return false;
        if (filters.types.length && p.type && !filters.types.includes(p.type)) return false;
        if (filters.layouts.length && !filters.layouts.includes(p.layout)) return false;
        // 階数
        if (filters.floorMin > 0) {
          const fl = typeof p.roomFloor === "number" ? p.roomFloor :
                     typeof p.floor === "string" ? Number((p.floor.match(/^(\d+)/) || [])[1]) : NaN;
          if (!isNaN(fl) && fl < filters.floorMin) return false;
        }
        if (filters.directions.length && p.direction && !filters.directions.includes(p.direction)) return false;
        if (filters.lines.length && p.line && !filters.lines.includes(p.line)) return false;
        if (p.walkMin > filters.walkMax) return false;
        if (p.age > filters.ageMax) return false;
        if (filters.structures.length && p.structure && !filters.structures.includes(p.structure)) return false;
        if (filters.contractTypes.length && p.contractType && !filters.contractTypes.includes(p.contractType)) return false;
        if (filters.parking === "yes" && p.parking && !(typeof p.parking === "object" ? p.parking.available : p.parking === "あり")) return false;
        if (filters.parking === "no" && p.parking && (typeof p.parking === "object" ? p.parking.available : p.parking === "あり")) return false;
        if (filters.features.length > 0) {
          const hay = [...(p.features || []), ...(p.kodawari || []), ...(p.furnishings || [])].join(" ");
          for (const f of filters.features) {
            const key = f.replace(/\(.*?\)/g, "").replace(/[・]/g, "");
            if (!hay.includes(key.slice(0, 4)) && !hay.includes(f)) return false;
          }
        }
        return true;
      })
      .sort((a, b) => {
        if (sortKey === "rent_asc") return a.rent - b.rent;
        if (sortKey === "rent_desc") return b.rent - a.rent;
        if (sortKey === "walk") return a.walkMin - b.walkMin;
        if (sortKey === "size") return (b.size || 0) - (a.size || 0);
        if (sortKey === "age") return a.age - b.age;
        return 0;
      });
  }, [properties, filters, sortKey]);

  const candidateIds = candidates.map((c) => c.id);
  // 候補に通し番号を付与（地図ピンとリストで共通）
  const candidateNumber = Object.fromEntries(candidates.map((c, i) => [c.id, i + 1]));
  const toggleCandidate = (p) => {
    const isIn = candidateIds.includes(p.id);
    if (isIn) setCandidates(candidates.filter((c) => c.id !== p.id));
    else setCandidates([...candidates, p]);
  };

  // ── item11: 担当者オススメ（件数が多い時、特徴の異なるトップN件を自動抽出） ──
  const [recommendN, setRecommendN] = useState(5);
  const [showRecommend, setShowRecommend] = useState(true);
  const diverseTopN = useMemo(() => {
    if (filtered.length === 0) return [];
    const pool = [...filtered];
    const picks = [];
    const used = new Set();
    // 「特徴の異なるもの」を担保するため、異なる切り口で1件ずつ選ぶ
    const axes = [
      (arr) => arr.slice().sort((a, b) => a.rent - b.rent)[0],            // 最安
      (arr) => arr.slice().sort((a, b) => a.walkMin - b.walkMin)[0],      // 駅近
      (arr) => arr.slice().sort((a, b) => a.age - b.age)[0],             // 築浅
      (arr) => arr.slice().sort((a, b) => (b.size || 0) - (a.size || 0))[0], // 広い
      (arr) => arr.find((p) => p.parking?.available),                    // 駐車場あり
      (arr) => arr.find((p) => p.plan === "マンスリー"),                   // マンスリー
      (arr) => arr.slice().sort((a, b) => (b.matched || 0) - (a.matched || 0))[0], // マッチ度
    ];
    let ai = 0;
    while (picks.length < recommendN && pool.length > used.size) {
      const cand = axes[ai % axes.length](pool.filter((p) => !used.has(p.id)));
      ai++;
      if (cand && !used.has(cand.id)) { used.add(cand.id); picks.push(cand); }
      if (ai > 50) break;
    }
    // 不足分は残りから補完
    for (const p of pool) { if (picks.length >= recommendN) break; if (!used.has(p.id)) { used.add(p.id); picks.push(p); } }
    return picks;
  }, [filtered, recommendN]);

  // 担当者オススメの「推し理由」（特徴に応じた一言）
  const recommendReasonFor = (p, all) => {
    if (p.catchphrase) return p.catchphrase;
    const cheapest = Math.min(...all.map((x) => x.rent));
    if (p.rent === cheapest) return "この条件で最安。コスト重視の方に。";
    if (p.walkMin <= 5) return `駅徒歩${p.walkMin}分！通勤・通学に便利です。`;
    if (p.age <= 8) return "築浅できれい。設備も新しめです。";
    return "バランスの取れたおすすめ物件です。";
  };

  // ── item12: 該当が少ない時の緩和提案 ──
  const FEW_THRESHOLD = 3;
  const relaxSuggestions = useMemo(() => {
    if (filtered.length > FEW_THRESHOLD) return [];
    const test = (patch, label) => {
      const f2 = { ...filters, ...patch };
      const cnt = properties.filter((p) => {
        if (p.rent < f2.budgetMin || p.rent > f2.budgetMax) return false;
        if (p.walkMin > f2.walkMax) return false;
        if (p.age > f2.ageMax) return false;
        if (f2.layouts.length && !f2.layouts.includes(p.layout)) return false;
        return true;
      }).length;
      const add = cnt - filtered.length;
      return add > 0 ? { label, cnt, add, patch } : null;
    };
    return [
      test({ budgetMax: filters.budgetMax + 10000 }, "賃料上限を +1万円"),
      test({ walkMax: Math.min(99, (filters.walkMax === 99 ? 15 : filters.walkMax) + 5) }, "駅徒歩の上限を +5分"),
      test({ ageMax: filters.ageMax === 99 ? 99 : filters.ageMax + 10 }, "築年数の上限を +10年"),
    ].filter(Boolean);
  }, [filtered, filters, properties]);

  // ── 一括選択（提案作成画面の効率化） ──
  const addAllVisible = () => {
    const add = filtered.filter((p) => !candidateIds.includes(p.id));
    if (add.length) setCandidates([...candidates, ...add]);
  };
  const clearAllCandidates = () => setCandidates([]);

  // ── item10: コアシステム自動連携（特記・駐車場の自動取得） ──
  const coreSyncedAt = "2026/05/25 09:12";

  return (
    <div className="space-y-3">
      <div className="bg-white border border-slate-200 rounded-md px-4 py-3">
        <h2 className="text-[14px] font-bold text-slate-900 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-brand" />
          STEP 3：物件を検索して候補を選ぶ
        </h2>
        <p className="text-[11px] text-slate-500 mt-0.5">
          AIが抽出した条件を元に物件を絞り込んでいます。地図またはリストから物件を選び、候補に追加してください。
        </p>
      </div>

      {/* AI条件タグ */}
      <div className="bg-white border border-slate-200 rounded-md p-3">
        <div className="text-[10px] text-slate-500 mb-1.5">AIが抽出した観点</div>
        <div className="flex flex-wrap gap-1.5">
          {(analysis?.mustConditions || []).filter((c) => c.enabled).map((c) => (
            <span key={c.id} className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 bg-rose-50 text-rose-700 border border-rose-200 rounded">
              <span className="font-bold">必須</span>
              {c.label}{c.kind === "text" ? `: ${c.value}` : c.kind === "slider" ? `: ${c.val}${c.unit}` : c.kind === "bool" ? (c.val ? "" : "") : ""}
            </span>
          ))}
          {(analysis?.featureTags || []).map((t) => (
            <span key={t} className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 bg-brand-light text-brand-dark border border-brand/20 rounded">{t}</span>
          ))}
          {(analysis?.points || []).filter((p) => p.enabled).map((p) => (
            <span key={p.id} className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded">
              <Lightbulb className="w-2.5 h-2.5" />
              {p.label}{p.kind === "slider" ? ` ${p.val}${p.unit}` : ""}
            </span>
          ))}
        </div>
      </div>

      {/* item10: コアシステム自動連携バナー */}
      <div className="flex items-center gap-2 text-[10.5px] text-sky-800 bg-sky-50 border border-sky-200 rounded px-3 py-1.5">
        <Cloud className="w-3.5 h-3.5 flex-shrink-0" />
        <span>検索結果の各物件は<strong>コアシステムと自動連携</strong>し、物件特記・駐車場情報（利用開始日含む）を自動取得済みです。<span className="text-sky-600">（最終同期 {coreSyncedAt}）</span></span>
      </div>

      {/* item12: 該当が少ない場合の緩和提案 */}
      {filtered.length <= FEW_THRESHOLD && relaxSuggestions.length > 0 && (
        <div className="bg-white border border-amber-300 rounded-md p-3">
          <div className="text-[12px] font-bold text-amber-800 flex items-center gap-1 mb-1">
            <ShieldAlert className="w-3.5 h-3.5" />
            該当 {filtered.length} 件と少なめです。条件を緩和すると候補が増えます
          </div>
          <div className="flex flex-wrap gap-2 mt-1">
            {relaxSuggestions.map((r, i) => (
              <button
                key={i}
                onClick={() => setFilters((f) => ({ ...f, ...r.patch }))}
                className="text-[11px] px-2.5 py-1 rounded border border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100"
              >
                {r.label} → <span className="font-bold">+{r.add}件（計{r.cnt}件）</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* item11: 担当者オススメ（特徴の異なるトップN件） */}
      {showRecommend && filtered.length > FEW_THRESHOLD && (
        <div className="bg-white border-2 border-brand/30 rounded-md">
          <div className="px-4 py-2.5 border-b border-slate-100 bg-brand-light/40 flex items-center gap-2 flex-wrap">
            <Sparkles className="w-4 h-4 text-brand" />
            <h3 className="text-[13px] font-bold text-brand-dark">担当者オススメ（自動抽出）</h3>
            <span className="text-[10px] text-slate-600">該当 {filtered.length} 件から、特徴の異なる物件を厳選しました。</span>
            <div className="ml-auto flex items-center gap-1.5">
              <span className="text-[10px] text-slate-500">表示件数</span>
              <select value={recommendN} onChange={(e) => setRecommendN(Number(e.target.value))} className="text-[11px] border border-slate-300 rounded px-1.5 py-0.5">
                {[3, 5, 8, 10].map((n) => <option key={n} value={n}>{n}件</option>)}
              </select>
              <button onClick={() => setShowRecommend(false)} className="text-[10px] text-slate-400 underline ml-1">隠す</button>
            </div>
          </div>
          <div className="p-3 grid grid-cols-5 gap-2">
            {diverseTopN.map((p, i) => {
              const isCand = candidateIds.includes(p.id);
              return (
                <div key={p.id} className="border border-slate-200 rounded-md overflow-hidden flex flex-col">
                  <div className="relative h-16 bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center overflow-hidden">
                    <BuildingPlaceholder />
                    <span className="absolute top-1 left-1 w-4 h-4 rounded-full bg-brand-accent text-white text-[10px] font-extrabold flex items-center justify-center z-10">{i + 1}</span>
                  </div>
                  <div className="p-2 flex-1 flex flex-col">
                    <div className="text-[11px] font-bold text-slate-900 truncate">{p.name}</div>
                    <div className="text-[12px] font-bold text-rose-600">{(p.rent / 10000).toFixed(1)}万円</div>
                    <div className="text-[9px] text-slate-500">{p.station}駅 徒歩{p.walkMin}分・{p.layout}・築{p.age}年</div>
                    <div className="text-[9.5px] text-rose-600 mt-1 leading-snug flex-1">💬 {recommendReasonFor(p, diverseTopN)}</div>
                    <button
                      onClick={() => toggleCandidate(p)}
                      className={`mt-1.5 text-[10px] py-1 rounded font-bold ${isCand ? "bg-rose-100 text-rose-700" : "bg-brand text-white hover:bg-brand-dark"}`}
                    >
                      {isCand ? "候補から外す" : "候補に追加"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-12 gap-3">
        {/* 左：絞り込み */}
        <div className="col-span-3">
          <FilterPanel filters={filters} setFilters={setFilters} />
        </div>

        {/* 右：地図 or リスト */}
        <main className="col-span-9 bg-white border border-slate-200 rounded-md">
          <div className="px-3 py-2 border-b border-slate-100 flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <div className="text-[12px] font-bold text-slate-800">
                該当物件 <span className="text-brand">{filtered.length}</span> 件
              </div>
              <select value={sortKey} onChange={(e) => setSortKey(e.target.value)} className="text-[11px] border border-slate-300 rounded px-2 py-1">
                <option value="rent_asc">賃料が安い順</option>
                <option value="rent_desc">賃料が高い順</option>
                <option value="walk">駅徒歩が近い順</option>
                <option value="size">面積が広い順</option>
                <option value="age">築年数が新しい順</option>
              </select>
              <button onClick={addAllVisible} className="text-[10.5px] px-2 py-1 rounded border border-brand text-brand hover:bg-brand-light inline-flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />表示中{filtered.length}件を一括で候補に
              </button>
              {candidateIds.length > 0 && (
                <button onClick={clearAllCandidates} className="text-[10.5px] px-2 py-1 rounded border border-slate-300 text-slate-600 hover:bg-slate-50">
                  候補をクリア（{candidateIds.length}）
                </button>
              )}
            </div>
            <div className="flex items-center gap-1 bg-slate-100 rounded p-0.5">
              <button
                onClick={() => setViewMode("map")}
                className={`px-3 py-1 text-[11px] font-medium rounded inline-flex items-center gap-1 ${
                  viewMode === "map" ? "bg-white shadow-sm text-slate-900" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <MapPin className="w-3 h-3" />
                地図
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`px-3 py-1 text-[11px] font-medium rounded ${
                  viewMode === "list" ? "bg-white shadow-sm text-slate-900" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                リスト
              </button>
            </div>
          </div>

          {/* 特徴タグ（ボタン絞り込み）item2 */}
          <div className="px-3 py-2 border-b border-slate-100 flex flex-wrap gap-1.5">
            {FEATURE_TAGS.slice(0, 14).map((tag) => {
              const on = filters.features.includes(tag);
              return (
                <button
                  key={tag}
                  onClick={() => setFilters((f) => ({ ...f, features: on ? f.features.filter((x) => x !== tag) : [...f.features, tag] }))}
                  className={`text-[10.5px] px-2 py-0.5 rounded-full border transition ${
                    on ? "bg-brand text-white border-brand" : "bg-white text-slate-600 border-slate-300 hover:border-brand hover:text-brand"
                  }`}
                >
                  {on ? "✓ " : "+ "}{tag}
                </button>
              );
            })}
          </div>

          {viewMode === "map" ? (
            <div className="h-[680px]">
              <LeafletMap
                properties={filtered}
                candidateIds={candidateIds}
                candidateNumber={candidateNumber}
                selectedId={selected?.id}
                onSelect={(p) => setSelected(p)}
              />
            </div>
          ) : (
            <div className="p-3 grid grid-cols-2 gap-3 max-h-[680px] overflow-y-auto">
              {filtered.map((p) => {
                const isCandidate = candidateIds.includes(p.id);
                return (
                  <article
                    key={p.id}
                    className={`border rounded-md overflow-hidden bg-white hover:shadow-md transition cursor-pointer ${
                      isCandidate ? "border-brand ring-2 ring-brand-light" : "border-slate-200"
                    }`}
                    onClick={() => setSelected(p)}
                  >
                    <div className="relative h-32 bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center">
                      <BuildingPlaceholder />
                      {isCandidate && (
                        <div className="absolute top-2 left-2 w-5 h-5 rounded-full bg-brand-accent text-white text-[11px] font-extrabold flex items-center justify-center shadow border border-white">
                          {candidateNumber[p.id]}
                        </div>
                      )}
                      {isCandidate && (
                        <div className="absolute top-2 right-2 bg-brand text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow inline-flex items-center gap-0.5">
                          <CheckCircle2 className="w-2.5 h-2.5" />
                          候補に追加済
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <div className="flex items-center gap-1 mb-1 flex-wrap">
                        {p.online && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded border border-slate-300 text-slate-600">オンライン相談・契約</span>}
                        {p.plan && <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${p.plan === "マンスリー" ? "bg-amber-100 text-amber-700" : "bg-brand-light text-brand-dark"}`}>{p.plan}</span>}
                        {p.furnished && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">家具・家電付き</span>}
                      </div>
                      <h4 className="text-[13px] font-bold text-slate-900 truncate">{p.name}</h4>
                      <div className="text-[10px] text-slate-600 mt-0.5 flex items-center gap-1">
                        <Train className="w-3 h-3" />
                        {p.station}駅 徒歩{p.walkMin}分・{p.floor}・築{p.age}年
                      </div>
                      {p.catchphrase && (
                        <div className="text-[10.5px] text-rose-600 mt-1 leading-snug border-b border-rose-200 pb-1">{p.catchphrase}</div>
                      )}
                      <div className="flex items-baseline gap-1 mt-2">
                        <span className="text-[18px] font-bold text-rose-600">{(p.rent / 10000).toLocaleString(undefined, { maximumFractionDigits: 1 })}万円</span>
                        <span className="text-[10px] text-slate-500">（共益費 ¥{Number(p.fee || 0).toLocaleString()}）</span>
                      </div>
                      <div className="text-[10px] text-slate-600 mt-0.5">
                        仲介手数料 <span className="font-bold text-emerald-600">不要</span> / 敷金 <span className="font-bold text-emerald-600">不要</span> / 礼金 {p.keyMoney ? `${Math.round(p.keyMoney / (p.rent || 1))}ヶ月` : "不要"}
                      </div>
                      <div className="grid grid-cols-4 gap-1 mt-2 text-[10px] text-slate-700">
                        <div className="text-center bg-slate-50 rounded px-1 py-1">
                          <div className="text-[8px] text-slate-400">間取</div>
                          <div className="font-bold">{p.layout}</div>
                        </div>
                        <div className="text-center bg-slate-50 rounded px-1 py-1">
                          <div className="text-[8px] text-slate-400">面積</div>
                          <div className="font-bold">{p.size}㎡</div>
                        </div>
                        <div className="text-center bg-slate-50 rounded px-1 py-1">
                          <div className="text-[8px] text-slate-400">階数</div>
                          <div className="font-bold text-[9px]">{p.floor}</div>
                        </div>
                        <div className="text-center bg-slate-50 rounded px-1 py-1">
                          <div className="text-[8px] text-slate-400">築</div>
                          <div className="font-bold">{p.age}年</div>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {[...(p.kodawari || []), ...(p.features || [])].slice(0, 4).map((f) => (
                          <span key={f} className="text-[9px] px-1.5 py-0.5 bg-sky-50 text-sky-700 rounded">{f}</span>
                        ))}
                      </div>
                      <div className="flex items-center gap-1.5 mt-3 pt-2 border-t border-slate-100">
                        <button
                          onClick={(e) => { e.stopPropagation(); toggleCandidate(p); }}
                          className={`flex-1 text-[11px] py-1.5 rounded font-bold inline-flex items-center justify-center gap-1 ${
                            isCandidate
                              ? "bg-rose-100 text-rose-700 hover:bg-rose-200"
                              : "bg-brand text-white hover:bg-brand-dark"
                          }`}
                        >
                          {isCandidate ? "候補から外す" : <><Plus className="w-3 h-3" />候補に追加</>}
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); setSelected(p); }}
                          className="px-3 py-1.5 text-[11px] border border-slate-300 rounded hover:bg-slate-50 text-slate-700 inline-flex items-center gap-1"
                        >
                          <Eye className="w-3 h-3" />
                          詳細
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
              {filtered.length === 0 && (
                <div className="col-span-2 text-center py-12 text-[12px] text-slate-400">
                  条件に一致する物件はありません。絞り込みを緩めてください。
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* 物件詳細モーダル（充実版） */}
      {selected && (
        <PropertyDetailModal
          property={selected}
          isCandidate={candidateIds.includes(selected.id)}
          onClose={() => setSelected(null)}
          onToggle={() => { toggleCandidate(selected); setSelected(null); }}
        />
      )}

      {candidates.length > 0 && <ExpressionConversionPanel candidates={candidates} />}

      <div className="bg-white border border-slate-200 rounded-md px-4 py-3 flex items-center justify-between">
        <button
          onClick={onBack}
          className="px-3 py-1.5 text-[12px] border border-slate-300 rounded text-slate-700 hover:bg-slate-50 inline-flex items-center gap-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          条件の見直しに戻る
        </button>
        <button
          onClick={onNext}
          disabled={candidates.length === 0}
          className="px-4 py-1.5 text-[12px] font-bold text-white rounded bg-brand hover:bg-brand-dark disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center gap-1"
        >
          最終提案資料の作成へ
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

// ====================================================================
// 物件詳細モーダル（網羅版）
// ====================================================================
// ====================================================================
// 部屋止め（仮予約）〜見積書提案 item17
// ====================================================================
function ReserveQuoteDialog({ property: p, onClose }) {
  const [phase, setPhase] = useState("reserve"); // reserve → quote
  const [days, setDays] = useState("3");
  const rent = p.rent || 0;
  const fee = p.fee || 0;
  const keyMoney = p.keyMoney || 0;
  const cleaning = typeof p.cleaningFee === "number" ? p.cleaningFee : 0;
  const guarantee = Math.round(rent * 0.5); // 保証会社利用料（初回・目安）
  const initial = rent + fee + keyMoney + cleaning + guarantee; // 敷金・仲介=不要
  const yen = (n) => `¥${Number(n).toLocaleString()}`;

  return (
    <div className="fixed inset-0 z-[2100] bg-slate-900/50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-md shadow-xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="px-5 py-3 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-[14px] font-bold text-slate-900 flex items-center gap-2">
            <Lock className="w-4 h-4 text-amber-600" />
            {phase === "reserve" ? "部屋止め（仮予約）" : "見積書（概算）"}
          </h3>
          <button onClick={onClose} className="w-8 h-8 inline-flex items-center justify-center rounded hover:bg-slate-100 text-slate-500"><X className="w-4 h-4" /></button>
        </div>

        {phase === "reserve" ? (
          <div className="p-5">
            <div className="text-[13px] font-bold text-slate-900">{p.name}</div>
            <div className="text-[11px] text-slate-600 mt-0.5">{(rent / 10000).toFixed(1)}万円・{p.station}駅 徒歩{p.walkMin}分・{p.layout}</div>
            <div className="mt-3 text-[11px] text-slate-700">
              この物件を一時的に押さえ（仮予約）、他社・他案件への紹介を保留します。
            </div>
            <label className="text-[11px] font-bold text-slate-700 block mt-3 mb-1">仮予約期間</label>
            <select value={days} onChange={(e) => setDays(e.target.value)} className="w-full px-2 py-2 border border-slate-300 rounded text-[12px]">
              {["1", "3", "5", "7"].map((d) => <option key={d} value={d}>{d}日間</option>)}
            </select>
            <p className="text-[10px] text-slate-400 mt-1">※ コアシステムの在庫を{days}日間ロックします（モック）。</p>
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={onClose} className="px-3 py-1.5 text-[12px] border border-slate-300 rounded text-slate-700">キャンセル</button>
              <button onClick={() => setPhase("quote")} className="px-4 py-1.5 text-[12px] font-bold text-white rounded bg-amber-500 hover:bg-amber-600">
                部屋止めして見積へ
              </button>
            </div>
          </div>
        ) : (
          <div className="p-5">
            <div className="text-[12px] font-bold text-slate-900 mb-2">{p.name}（{days}日間 仮予約中）</div>
            <table className="w-full text-[12px]">
              <tbody className="divide-y divide-slate-100">
                {[
                  ["賃料（月額）", yen(rent)],
                  ["共益費（月額）", yen(fee)],
                  ["敷金", "不要"],
                  ["礼金", keyMoney ? yen(keyMoney) : "不要"],
                  ["仲介手数料", "不要"],
                  ["退去時清掃料", cleaning ? yen(cleaning) : "—"],
                  ["保証会社利用料（初回・目安）", yen(guarantee)],
                ].map(([k, v]) => (
                  <tr key={k}>
                    <td className="py-1.5 text-slate-600">{k}</td>
                    <td className={`py-1.5 text-right font-medium ${v === "不要" ? "text-emerald-600 font-bold" : "text-slate-900"}`}>{v}</td>
                  </tr>
                ))}
                <tr className="border-t-2 border-slate-300">
                  <td className="py-2 font-bold text-slate-900">初期費用 概算合計</td>
                  <td className="py-2 text-right font-bold text-rose-600 text-[14px]">{yen(initial)}</td>
                </tr>
              </tbody>
            </table>
            <p className="text-[9px] text-slate-400 mt-2">※ 概算です。確定金額は契約時の重要事項説明にてご案内します。敷金・仲介手数料は不要（レオパレス）。</p>
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setPhase("reserve")} className="px-3 py-1.5 text-[12px] border border-slate-300 rounded text-slate-700">戻る</button>
              <button onClick={() => { alert("見積書を発行しました（モック）。提案資料に添付できます。"); onClose(); }} className="px-4 py-1.5 text-[12px] font-bold text-white rounded bg-brand hover:bg-brand-dark inline-flex items-center gap-1">
                <FileText className="w-3.5 h-3.5" />見積書を発行
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function PropertyDetailModal({ property: p, isCandidate, onClose, onToggle }) {
  const [showReserve, setShowReserve] = useState(false);
  const Row = ({ label, value, span = 1 }) => (
    <div className={`flex py-1 border-b border-slate-100 col-span-${span}`}>
      <span className="w-24 flex-shrink-0 text-[10px] text-slate-500">{label}</span>
      <span className="text-[11px] text-slate-800 flex-1 break-words">
        {value !== undefined && value !== null && value !== "" ? value : <span className="text-slate-300">-</span>}
      </span>
    </div>
  );
  const yen = (n) => (typeof n === "number" ? `¥${n.toLocaleString()}` : null);

  return (
    <div className="fixed inset-0 z-[2000] bg-slate-900/50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-md shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        {/* 画像エリア */}
        <div className="relative h-44 bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center flex-shrink-0">
          <BuildingPlaceholder large />
          <button onClick={onClose} className="absolute top-2 right-2 w-8 h-8 inline-flex items-center justify-center rounded-full bg-white shadow text-slate-600 hover:text-slate-900 z-10">
            <X className="w-4 h-4" />
          </button>
          {isCandidate && (
            <div className="absolute bottom-2 left-2 bg-brand text-white text-[11px] font-bold px-2 py-1 rounded shadow inline-flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              候補に追加済
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {/* タイトル */}
          <div className="font-mono text-[10px] text-slate-500">{p.id}</div>
          <h3 className="text-[18px] font-bold text-slate-900 mt-0.5">{p.name}</h3>
          <div className="text-[12px] text-slate-600 mt-1">{p.address}</div>

          {/* 賃料・初期費用 */}
          <div className="mt-3 p-3 bg-rose-50/40 border border-rose-100 rounded">
            <div className="flex items-baseline gap-2">
              <span className="text-[26px] font-bold text-rose-600">{yen(p.rent)}</span>
              <span className="text-[11px] text-slate-500">/月</span>
              <span className="text-[11px] text-slate-600 ml-2">管理費 {yen(p.fee) || "-"}</span>
            </div>
            <div className="grid grid-cols-4 gap-2 mt-2 text-[11px]">
              <div><span className="text-slate-500">敷金：</span><span className="font-bold text-emerald-600">不要</span></div>
              <div><span className="text-slate-500">礼金：</span>{p.keyMoney ? yen(p.keyMoney) : <span className="font-bold text-emerald-600">不要</span>}</div>
              <div><span className="text-slate-500">保証金：</span>{yen(p.guarantee) || "-"}</div>
              <div><span className="text-slate-500">更新料：</span>{yen(p.renewalFee) || "-"}</div>
              <div><span className="text-slate-500">仲介手数料：</span><span className="font-bold text-emerald-600">不要</span></div>
              <div><span className="text-slate-500">鍵交換代：</span>{yen(p.keyChange) || "-"}</div>
              <div><span className="text-slate-500">火災保険：</span>{yen(p.fireInsurance) || "-"}</div>
              <div><span className="text-slate-500">保証会社：</span>{p.guaranteeCompany || "-"}</div>
            </div>
          </div>

          {/* 4セル基本 */}
          <div className="grid grid-cols-4 gap-2 mt-4 text-[11px]">
            <div className="bg-slate-50 rounded p-2 text-center">
              <div className="text-[9px] text-slate-500">間取り</div>
              <div className="font-bold text-slate-900 mt-0.5">{p.layout || "-"}</div>
            </div>
            <div className="bg-slate-50 rounded p-2 text-center">
              <div className="text-[9px] text-slate-500">専有面積</div>
              <div className="font-bold text-slate-900 mt-0.5">{p.size ? `${p.size}㎡` : "-"}</div>
            </div>
            <div className="bg-slate-50 rounded p-2 text-center">
              <div className="text-[9px] text-slate-500">階数</div>
              <div className="font-bold text-slate-900 mt-0.5 text-[10px]">{p.floor || (p.roomFloor && p.totalFloors ? `${p.roomFloor}階/${p.totalFloors}階建` : "-")}</div>
            </div>
            <div className="bg-slate-50 rounded p-2 text-center">
              <div className="text-[9px] text-slate-500">築年数</div>
              <div className="font-bold text-slate-900 mt-0.5">{p.age ? `${p.age}年` : "-"}</div>
            </div>
          </div>

          {/* 物件詳細 */}
          <h4 className="text-[12px] font-bold text-slate-700 mt-4 mb-1 pb-1 border-b-2 border-brand inline-block pr-4">物件詳細</h4>
          <div className="grid grid-cols-2 gap-x-4">
            <Row label="物件ID" value={<span className="font-mono text-[10px]">{p.id}</span>} />
            <Row label="物件名" value={p.name} />
            <Row label="物件種別" value={p.type} />
            <Row label="所在地" value={p.address} />
            <Row label="路線" value={p.line} />
            <Row label="最寄駅" value={p.station ? `${p.station}駅 徒歩${p.walkMin}分` : "-"} />
            <Row label="第2路線" value={p.line2} />
            <Row label="第2最寄駅" value={p.station2 ? `${p.station2}駅 徒歩${p.walkMin2 || "-"}分` : "-"} />
            <Row label="部屋階" value={p.roomFloor ? `${p.roomFloor}階` : null} />
            <Row label="建物総階数" value={p.totalFloors ? `${p.totalFloors}階建` : null} />
            <Row label="向き" value={p.direction} />
            <Row label="部屋番号" value={p.roomNo} />
            <Row label="バルコニー面積" value={p.balconySize ? `${p.balconySize}㎡` : null} />
            <Row label="築年月" value={p.builtYearMonth} />
            <Row label="構造" value={p.structure} />
            <Row label="総戸数" value={p.totalUnits ? `${p.totalUnits}戸` : null} />
            <Row label="空室" value={p.available ? `${p.available}部屋` : null} />
          </div>

          {/* 契約・利用 */}
          <h4 className="text-[12px] font-bold text-slate-700 mt-4 mb-1 pb-1 border-b-2 border-brand inline-block pr-4">契約条件</h4>
          <div className="grid grid-cols-2 gap-x-4">
            <Row label="契約形態" value={p.contractType} />
            <Row label="契約期間" value={p.contractTerm} />
            <Row label="入居可能日" value={p.availableFrom} />
            <Row label="短期解約違約金" value={p.shortTermPenalty} />
            <Row label="駐車場" value={p.parking ? (typeof p.parking === "object" ? `${p.parking.available ? "あり" : "空き待ち"}${p.parking.fee ? `（${yen(p.parking.fee)}/月）` : ""}・利用開始 ${p.parking.availableFrom}` : `${p.parking}${p.parkingFee ? ` (${yen(p.parkingFee)}/月)` : ""}`) : null} />
            <Row label="バイク置場" value={p.bike} />
            <Row label="駐輪場" value={p.bicycle} />
            <Row label="取扱不動産会社" value={p.managementCompany} />
          </div>

          {/* 設備 */}
          {/* おすすめポイント（公式物件ページ準拠） */}
          <h4 className="text-[12px] font-bold text-slate-700 mt-4 mb-1 pb-1 border-b-2 border-brand inline-block pr-4">おすすめポイント</h4>
          {p.recommendLead && <div className="text-[11px] text-slate-600 mt-1">{p.recommendLead}</div>}
          {(() => {
            const tags = [...new Set([...(p.kodawari || []), ...(p.features || []),
              p.furnished && "家具・家電付き", p.deposit === 0 && "敷金不要", p.leonet && "インターネット対応"].filter(Boolean))];
            return tags.length ? (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {tags.map((f) => (
                  <span key={f} className="text-[11px] px-2 py-1 bg-white text-slate-700 rounded border border-slate-300">{f}</span>
                ))}
              </div>
            ) : null;
          })()}

          {/* 設備（カテゴリ別） */}
          <h4 className="text-[12px] font-bold text-slate-700 mt-4 mb-1 pb-1 border-b-2 border-brand inline-block pr-4">設備</h4>
          {p.equipment ? (
            <div className="mt-1">
              {[["バス・トイレ", p.equipment.bath], ["セキュリティ", p.equipment.security], ["放送・通信", p.equipment.network], ["その他", p.equipment.other]].map(([label, arr]) => (
                <div key={label} className="flex py-1 border-b border-slate-100 last:border-b-0">
                  <span className="w-24 flex-shrink-0 text-[10px] text-slate-500">{label}</span>
                  <span className="text-[11px] text-slate-800 flex-1">{(arr || []).join("、") || "-"}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-[11px] text-slate-300 mt-1">設備情報なし</div>
          )}

          {/* レオパレス情報 */}
          <h4 className="text-[12px] font-bold text-slate-700 mt-4 mb-1 pb-1 border-b-2 border-brand inline-block pr-4">レオパレス情報</h4>
          <div className="grid grid-cols-2 gap-x-4">
            <Row label="契約プラン" value={p.plan ? <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${p.plan === "マンスリー" ? "bg-amber-100 text-amber-700" : "bg-brand-light text-brand-dark"}`}>{p.plan}</span> : null} />
            <Row label="家具家電" value={p.furnished ? `付き（${(p.furnishings || []).join("・")}）` : null} />
            <Row label="レオネット" value={p.leonet ? "対応（インターネット/TV）" : null} />
            <Row label="退去時清掃料" value={p.cleaningFee ? `${yen(p.cleaningFee)}（4年以上居住で無料／法人・マンスリーは対象外）` : null} span={2} />
            {p.plan === "マンスリー" && p.monthlyDaily && (
              <Row label="マンスリー日割り" value={`約 ${yen(p.monthlyDaily)}/日（水光熱費込・目安）`} span={2} />
            )}
          </div>
          {(p.kodawari || []).length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {p.kodawari.map((k) => (
                <span key={k} className="text-[10px] px-1.5 py-0.5 bg-emerald-50 text-emerald-700 rounded border border-emerald-200">{k}</span>
              ))}
            </div>
          )}
          <div className="flex flex-wrap gap-3 mt-2 text-[10px]">
            {p.officialUrl && <span className="text-slate-500">公式HP：<span className="text-brand font-mono break-all">{p.officialUrl}</span></span>}
            {p.ecoSystemUrl && <span className="text-slate-500">エコシステム：<span className="text-slate-600 font-mono break-all">{p.ecoSystemUrl}</span></span>}
          </div>

          {/* 備考 */}
          {p.notes && (
            <>
              <h4 className="text-[12px] font-bold text-slate-700 mt-4 mb-1 pb-1 border-b-2 border-brand inline-block pr-4">備考</h4>
              <div className="text-[11px] text-slate-700 whitespace-pre-wrap mt-1">{p.notes}</div>
            </>
          )}
        </div>

        <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 flex items-center gap-2">
          <button
            onClick={() => setShowReserve(true)}
            className="px-3 py-2 text-[12px] font-bold rounded inline-flex items-center justify-center gap-1 bg-amber-500 text-white hover:bg-amber-600"
          >
            <Lock className="w-3.5 h-3.5" />
            部屋止め（仮予約）〜見積
          </button>
          <button
            onClick={onToggle}
            className={`flex-1 py-2 text-[12px] font-bold rounded inline-flex items-center justify-center gap-1 ${
              isCandidate
                ? "bg-rose-100 text-rose-700 hover:bg-rose-200"
                : "bg-brand text-white hover:bg-brand-dark"
            }`}
          >
            {isCandidate ? "候補から外す" : <><Plus className="w-3.5 h-3.5" />この物件を候補に追加</>}
          </button>
        </div>
      </div>
      {showReserve && <ReserveQuoteDialog property={p} onClose={() => setShowReserve(false)} />}
    </div>
  );
}

// ====================================================================
// 受取側の初期表示形式ルール（送付側が件数・状況に応じて初期値を決める）
// ====================================================================
const RECIPIENT_VIEWS = [
  { id: "detail", label: "図面・写真付き詳細ビュー" },
  { id: "list_map", label: "リスト＋地図連動" },
  { id: "filter_list", label: "絞り込み付きリスト" },
];
// 件数 → 初期表示の推奨ルール
function recommendInitialView(count, urgent) {
  if (urgent) return { id: "detail", reason: "急ぎ案件のため、まず詳細を1件ずつ見せる詳細ビューを初期表示にします。" };
  if (count <= 3) return { id: "detail", reason: `候補が${count}件と少ないため、図面・写真付きの詳細ビューを初期表示にします。` };
  if (count <= 10) return { id: "list_map", reason: `候補が${count}件のため、リストと地図を番号連動で見せる表示を初期表示にします。` };
  return { id: "filter_list", reason: `候補が${count}件と多いため、絞り込み付きリストを初期表示にします。` };
}

// ====================================================================
// 提案テンプレート定義（select 用）
// ====================================================================
const PROPOSAL_TEMPLATES = [
  { id: "T-001", name: "標準Excel - 物件一覧（8列）", format: "excel", desc: "1物件1行・基本項目のみの顧客向け標準" },
  { id: "T-002", name: "詳細PDF - 物件カタログ", format: "pdf", desc: "1物件1ページ・写真・間取り図・周辺マップ付き" },
  { id: "T-003", name: "建設業向け - 現場社員寮提案書", format: "excel", desc: "複数名同時入居前提。距離・台数・備考欄を追加" },
  { id: "T-004", name: "比較重視 - 横並び比較シート", format: "excel", desc: "複数物件を横に並べて条件比較が一目で分かる" },
  { id: "T-005", name: "プレミアム - 役員向け短期出張提案", format: "pdf", desc: "ハイグレード物件・写真豊富・コンシェルジュ案内付き" },
  { id: "T-006", name: "提案PowerPoint - 商談用スライド", format: "powerpoint", desc: "表紙＋物件1枚ずつのスライド。商談・社内説明用" },
];

// ====================================================================
// STEP 4: 最終出力
// ====================================================================
function Step4Output({ selectedCase, candidates, setCandidates, onBack, onReset, setCurrent }) {
  const [showMail, setShowMail] = useState(false);
  const [finalIds, setFinalIds] = useState(candidates.map((c) => c.id));
  const [templateId, setTemplateId] = useState("T-001");
  const [showPreview, setShowPreview] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [coverNote, setCoverNote] = useState(
    `${selectedCase?.customerName || ""}様\n\nお世話になっております。レオパレス21の${selectedCase?.mainAssignee || ""}です。\nご依頼いただいた${selectedCase?.purpose || "物件"}の件、以下の物件をご提案いたします。`
  );
  const [sections, setSections] = useState({
    cover: true,
    detail: true,
    comparison: true,
    map: true,
    cost: true,
    company: false,
  });

  const template = PROPOSAL_TEMPLATES.find((t) => t.id === templateId);
  const finalProps = candidates.filter((c) => finalIds.includes(c.id));

  // 送付側：受取側の初期表示形式（件数に応じて自動提案、手動上書き可）
  const [urgent, setUrgent] = useState(false);
  const [viewOverride, setViewOverride] = useState(null); // null=自動
  const recommended = recommendInitialView(finalProps.length, urgent);
  const initialView = viewOverride || recommended.id;

  const toggleFinal = (id) => {
    setFinalIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };
  const toggleSection = (k) => setSections((s) => ({ ...s, [k]: !s[k] }));

  return (
    <div className="space-y-3">
      <div className="bg-white border border-slate-200 rounded-md">
        <div className="px-4 py-3 border-b border-slate-100">
          <h2 className="text-[14px] font-bold text-slate-900">STEP 4：最終提案資料の作成・出力</h2>
          <p className="text-[11px] text-slate-500 mt-0.5">
            テンプレートを選び、提案に含める物件と項目を確定 → プレビューで確認 → Excel/PDF/図面/URL で出力します。
          </p>
        </div>

        {/* テンプレート選択 */}
        <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50">
          <label className="text-[11px] font-bold text-slate-700 block mb-1.5">使用するテンプレート</label>
          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={templateId}
              onChange={(e) => setTemplateId(e.target.value)}
              className="text-[12px] border border-slate-300 rounded px-2 py-1.5 bg-white flex-1 min-w-[280px]"
            >
              {PROPOSAL_TEMPLATES.map((t) => (
                <option key={t.id} value={t.id}>
                  [{t.format.toUpperCase()}] {t.name}
                </option>
              ))}
            </select>
            {template && (
              <span className={`text-[10px] font-bold px-2 py-1 rounded ${
                template.format === "excel" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" :
                "bg-rose-50 text-rose-700 border border-rose-200"
              }`}>
                {template.format.toUpperCase()}
              </span>
            )}
          </div>
          {template && (
            <p className="text-[10px] text-slate-500 mt-1.5 ml-0.5">{template.desc}</p>
          )}
        </div>

        <div className="p-4 grid grid-cols-12 gap-4">
          {/* 左：候補リストと選択 */}
          <div className="col-span-7">
            <h3 className="text-[12px] font-bold text-slate-700 mb-2">
              最終提案に含める物件（{finalProps.length} / {candidates.length} 件）
            </h3>
            <ul className="space-y-2">
              {candidates.map((p) => {
                const checked = finalIds.includes(p.id);
                return (
                  <li
                    key={p.id}
                    className={`p-3 border rounded transition ${
                      checked ? "border-brand bg-brand-light/30" : "border-slate-200"
                    }`}
                  >
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleFinal(p.id)}
                        className="rounded text-brand mt-1"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <div className="text-[13px] font-bold text-slate-900">{p.name}</div>
                          <span className="text-[14px] font-bold text-rose-600">¥{Number(p.rent).toLocaleString()}</span>
                        </div>
                        <div className="text-[10px] text-slate-500 mt-0.5">
                          <Train className="w-2.5 h-2.5 inline" /> {p.station}駅 徒歩{p.walkMin}分 / {p.layout} / {p.size}㎡
                        </div>
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {(p.features || []).slice(0, 5).map((f) => (
                            <span key={f} className="text-[9px] px-1.5 py-0.5 bg-sky-50 text-sky-700 rounded">{f}</span>
                          ))}
                        </div>
                      </div>
                    </label>
                  </li>
                );
              })}
              {candidates.length === 0 && (
                <div className="text-center py-8 text-[11px] text-slate-400 border border-dashed border-slate-200 rounded">
                  候補物件がありません。STEP 3 で物件を追加してください。
                </div>
              )}
            </ul>
          </div>

          {/* 右：構成・カバーレター */}
          <div className="col-span-5">
            <h3 className="text-[12px] font-bold text-slate-700 mb-2">提案資料に含める項目</h3>
            <ul className="space-y-1 mb-3 text-[11px]">
              {[
                { k: "cover", l: "カバーレター" },
                { k: "detail", l: `物件詳細（${finalProps.length}件）` },
                { k: "comparison", l: "比較表" },
                { k: "map", l: "地図ページ" },
                { k: "cost", l: "費用試算" },
                { k: "company", l: "会社案内" },
              ].map((item) => (
                <li key={item.k}>
                  <label className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-slate-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={sections[item.k]}
                      onChange={() => toggleSection(item.k)}
                      className="rounded text-brand"
                    />
                    <span>{item.l}</span>
                  </label>
                </li>
              ))}
            </ul>

            <h3 className="text-[12px] font-bold text-slate-700 mb-2">カバーレター</h3>
            <textarea
              value={coverNote}
              onChange={(e) => setCoverNote(e.target.value)}
              rows={6}
              className="w-full px-3 py-2 border border-slate-300 rounded text-[11px] focus:outline-none focus:border-brand"
            />
          </div>
        </div>

        {/* 受取側の初期表示形式（送付側設定） */}
        <div className="px-4 py-3 border-t border-slate-200">
          <div className="flex items-center gap-2 mb-2">
            <Eye className="w-3.5 h-3.5 text-brand" />
            <h4 className="text-[12px] font-bold text-slate-800">受取側の初期表示形式</h4>
            <span className="text-[10px] text-slate-500">件数・状況に応じて自動提案。共有時の初期表示に反映されます。</span>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <select
              value={viewOverride || "auto"}
              onChange={(e) => setViewOverride(e.target.value === "auto" ? null : e.target.value)}
              className="text-[12px] border border-slate-300 rounded px-2 py-1.5"
            >
              <option value="auto">自動（推奨）：{RECIPIENT_VIEWS.find((v) => v.id === recommended.id)?.label}</option>
              {RECIPIENT_VIEWS.map((v) => (
                <option key={v.id} value={v.id}>手動指定：{v.label}</option>
              ))}
            </select>
            <label className="inline-flex items-center gap-1 text-[11px] text-slate-600 cursor-pointer">
              <input type="checkbox" checked={urgent} onChange={(e) => { setUrgent(e.target.checked); }} className="rounded" />
              急ぎ案件
            </label>
            <span className="text-[10px] text-slate-500">
              現在の初期表示：<span className="font-bold text-brand-dark">{RECIPIENT_VIEWS.find((v) => v.id === initialView)?.label}</span>
            </span>
          </div>
          {!viewOverride && (
            <p className="text-[10px] text-slate-400 mt-1.5">理由：{recommended.reason}</p>
          )}
        </div>

        {/* 出力ボタン */}
        <div className="px-4 py-3 border-t border-slate-200 bg-slate-50">
          <p className="text-[10px] text-slate-500 mb-2 flex items-center gap-1">
            <Info className="w-3 h-3" />
            出力形式は候補件数に関わらず常に選べます（2件でもPDF・PPT・図面可）。送付側の初期表示は下の設定に従います。
          </p>
          <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setShowPreview(true)}
            disabled={finalProps.length === 0}
            className="px-3 py-1.5 text-[12px] border border-brand text-brand rounded hover:bg-brand-light disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center gap-1"
          >
            <Eye className="w-3.5 h-3.5" />
            プレビュー
          </button>
          <div className="ml-auto flex items-center gap-2 flex-wrap">
            <button
              onClick={() => alert(`Excel形式（${template?.name}）で提案資料を出力しました（モック）`)}
              disabled={finalProps.length === 0}
              className="px-3 py-1.5 text-[12px] font-bold text-white rounded bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center gap-1"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              Excel出力
            </button>
            <button
              onClick={() => alert(`図面写真（間取り図・外観写真）を ZIP 形式で一括ダウンロードしました（モック）`)}
              disabled={finalProps.length === 0}
              className="px-3 py-1.5 text-[12px] font-bold text-white rounded bg-purple-600 hover:bg-purple-700 disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center gap-1"
            >
              <ImageIcon className="w-3.5 h-3.5" />
              図面写真
            </button>
            <button
              onClick={() => alert(`PowerPoint形式（商談用スライド）で提案資料を出力しました（モック）`)}
              disabled={finalProps.length === 0}
              className="px-3 py-1.5 text-[12px] font-bold text-white rounded bg-orange-500 hover:bg-orange-600 disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center gap-1"
            >
              <FileText className="w-3.5 h-3.5" />
              PowerPoint出力
            </button>
            <button
              onClick={() => setShowShareDialog(true)}
              disabled={finalProps.length === 0}
              className="px-3 py-1.5 text-[12px] font-bold text-white rounded bg-brand hover:bg-brand-dark disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center gap-1"
            >
              <LinkIcon className="w-3.5 h-3.5" />
              URL共有
            </button>
            <button
              onClick={() => setShowMail(true)}
              disabled={finalProps.length === 0}
              className="px-3 py-1.5 text-[12px] font-bold text-white rounded bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center gap-1"
            >
              <Mail className="w-3.5 h-3.5" />
              メールで送信
            </button>
            <button
              onClick={() => alert(`PDF形式（${template?.name}）で提案資料を出力しました（モック）`)}
              disabled={finalProps.length === 0}
              className="px-3 py-1.5 text-[12px] font-bold text-white rounded bg-rose-600 hover:bg-rose-700 disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center gap-1"
            >
              <FileText className="w-3.5 h-3.5" />
              PDF出力
            </button>
          </div>
          </div>
        </div>
      </div>

      {/* ナビゲーション */}
      <div className="bg-white border border-slate-200 rounded-md px-4 py-3 flex items-center justify-between">
        <button
          onClick={onBack}
          className="px-3 py-1.5 text-[12px] border border-slate-300 rounded text-slate-700 hover:bg-slate-50 inline-flex items-center gap-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          物件検索に戻る
        </button>
        <button
          onClick={onReset}
          className="px-3 py-1.5 text-[12px] border border-slate-300 rounded text-slate-700 hover:bg-slate-50"
        >
          別の案件で提案作成を始める
        </button>
      </div>

      {/* プレビューモーダル */}
      {showPreview && (
        <PreviewDialog
          template={template}
          selectedCase={selectedCase}
          finalProps={finalProps}
          sections={sections}
          coverNote={coverNote}
          onClose={() => setShowPreview(false)}
        />
      )}

      {/* URL共有ダイアログ */}
      {showShareDialog && (
        <ShareUrlDialog
          selectedCase={selectedCase}
          finalProps={finalProps}
          initialView={initialView}
          onClose={() => setShowShareDialog(false)}
        />
      )}

      {/* メール送信ダイアログ item13 */}
      {showMail && (
        <MailComposeDialog
          selectedCase={selectedCase}
          finalProps={finalProps}
          coverNote={coverNote}
          onClose={() => setShowMail(false)}
          setCurrent={setCurrent}
        />
      )}
    </div>
  );
}

// ====================================================================
// プレビューダイアログ（テンプレートに応じた見た目）
// ====================================================================
function PreviewDialog({ template, selectedCase, finalProps, sections, coverNote, onClose }) {
  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-md shadow-xl w-full max-w-5xl max-h-[92vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="px-5 py-3 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="text-[14px] font-bold text-slate-900 flex items-center gap-2">
              <Eye className="w-4 h-4 text-brand" />
              提案資料プレビュー
            </h3>
            <p className="text-[10px] text-slate-500 mt-0.5">
              テンプレート: <span className="font-bold text-slate-700">{template?.name}</span>
              <span className={`ml-2 text-[9px] font-bold px-1.5 py-0.5 rounded ${
                template?.format === "excel" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" :
                "bg-rose-50 text-rose-700 border border-rose-200"
              }`}>{template?.format?.toUpperCase()}</span>
            </p>
          </div>
          <button onClick={onClose} className="w-8 h-8 inline-flex items-center justify-center rounded hover:bg-slate-200 text-slate-500">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto bg-slate-100 p-6">
          {template?.id === "T-001" && <PreviewExcelList selectedCase={selectedCase} finalProps={finalProps} sections={sections} coverNote={coverNote} />}
          {template?.id === "T-002" && <PreviewPdfCatalog selectedCase={selectedCase} finalProps={finalProps} sections={sections} coverNote={coverNote} />}
          {template?.id === "T-003" && <PreviewSiteDormitory selectedCase={selectedCase} finalProps={finalProps} sections={sections} coverNote={coverNote} />}
          {template?.id === "T-004" && <PreviewComparison selectedCase={selectedCase} finalProps={finalProps} sections={sections} coverNote={coverNote} />}
          {template?.id === "T-005" && <PreviewPremium selectedCase={selectedCase} finalProps={finalProps} sections={sections} coverNote={coverNote} />}
          {template?.id === "T-006" && <PreviewPpt selectedCase={selectedCase} finalProps={finalProps} coverNote={coverNote} />}
        </div>
      </div>
    </div>
  );
}

// テンプレート6: 提案PowerPoint（商談用スライド）
function PreviewPpt({ selectedCase, finalProps, coverNote }) {
  return (
    <div className="space-y-3">
      {/* 表紙スライド */}
      <div className="aspect-[16/9] bg-gradient-to-br from-brand to-brand-dark text-white rounded-md shadow flex flex-col justify-center px-8">
        <div className="text-[10px] opacity-80">物件ご提案資料</div>
        <div className="text-[20px] font-bold mt-1">{selectedCase?.customerName || "—"} 御中</div>
        <div className="text-[11px] opacity-90 mt-2">{coverNote || "ご希望条件に合わせた候補物件をご提案いたします。"}</div>
        <div className="text-[9px] opacity-70 mt-4">WORK HERO / レオパレス21　提案PowerPoint（{finalProps.length}件）</div>
      </div>
      {/* 物件スライド */}
      {finalProps.map((p, i) => (
        <div key={p.id} className="aspect-[16/9] bg-white border border-slate-200 rounded-md shadow p-5 flex flex-col">
          <div className="flex items-center justify-between">
            <div className="text-[13px] font-bold text-slate-900">スライド {i + 2}：{p.name}</div>
            <span className="text-[9px] font-mono text-slate-400">{p.id}</span>
          </div>
          <div className="grid grid-cols-3 gap-3 mt-3 flex-1">
            <div className="col-span-1 relative bg-slate-100 rounded flex items-center justify-center overflow-hidden min-h-[80px]"><BuildingPlaceholder /></div>
            <div className="col-span-2 text-[11px] text-slate-700 space-y-1">
              <div>賃料：<span className="font-bold text-rose-600">¥{Number(p.rent).toLocaleString()}/月</span>（管理費 ¥{Number(p.fee || 0).toLocaleString()}）</div>
              <div>間取り：{p.layout}・{p.size}㎡・築{p.age}年</div>
              <div>最寄り：{p.station}駅 徒歩{p.walkMin}分</div>
              <div>設備：{(p.features || []).join("・")}</div>
            </div>
          </div>
        </div>
      ))}
      {finalProps.length === 0 && (
        <div className="text-center text-[11px] text-slate-400 py-8">物件が未選択です。</div>
      )}
    </div>
  );
}

// テンプレート1: 標準Excel - 物件一覧
function PreviewExcelList({ selectedCase, finalProps, sections, coverNote }) {
  return (
    <div className="max-w-4xl mx-auto bg-white shadow-lg p-8 space-y-4">
      <div className="border-b-2 border-emerald-600 pb-2 flex items-center justify-between">
        <div>
          <div className="text-[10px] text-slate-500">標準Excel・物件一覧フォーマット</div>
          <h1 className="text-[18px] font-bold">{selectedCase?.customerName} 様 ご提案物件一覧</h1>
        </div>
        <div className="text-right text-[10px] text-slate-500">
          案件: <span className="font-mono">{selectedCase?.id}</span>
        </div>
      </div>
      {sections.cover && (
        <div className="whitespace-pre-wrap text-[11px] text-slate-800 leading-relaxed">{coverNote}</div>
      )}
      {sections.detail && (
        <table className="w-full text-[10px] border-collapse">
          <thead className="bg-emerald-50">
            <tr>
              <th className="border border-emerald-200 px-2 py-1.5 text-left">No.</th>
              <th className="border border-emerald-200 px-2 py-1.5 text-left">物件名</th>
              <th className="border border-emerald-200 px-2 py-1.5 text-left">所在地</th>
              <th className="border border-emerald-200 px-2 py-1.5 text-left">最寄駅</th>
              <th className="border border-emerald-200 px-2 py-1.5 text-right">賃料</th>
              <th className="border border-emerald-200 px-2 py-1.5 text-right">管理費</th>
              <th className="border border-emerald-200 px-2 py-1.5 text-left">間取/面積</th>
              <th className="border border-emerald-200 px-2 py-1.5 text-right">築年</th>
            </tr>
          </thead>
          <tbody>
            {finalProps.map((p, i) => (
              <tr key={p.id}>
                <td className="border border-emerald-200 px-2 py-1 text-right">{i + 1}</td>
                <td className="border border-emerald-200 px-2 py-1 font-medium">{p.name}</td>
                <td className="border border-emerald-200 px-2 py-1">{p.address}</td>
                <td className="border border-emerald-200 px-2 py-1">{p.station}駅 徒歩{p.walkMin}分</td>
                <td className="border border-emerald-200 px-2 py-1 text-right">¥{Number(p.rent).toLocaleString()}</td>
                <td className="border border-emerald-200 px-2 py-1 text-right">¥{Number(p.fee || 0).toLocaleString()}</td>
                <td className="border border-emerald-200 px-2 py-1">{p.layout} / {p.size}㎡</td>
                <td className="border border-emerald-200 px-2 py-1 text-right">{p.age}年</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {sections.cost && (
        <div className="mt-4 p-3 bg-emerald-50/50 border border-emerald-200 rounded text-[11px]">
          <div className="font-bold mb-1">費用試算（{finalProps.length}物件・1ヶ月分）</div>
          <div className="text-[10px]">
            合計賃料：¥{finalProps.reduce((s, p) => s + p.rent, 0).toLocaleString()}　
            合計管理費：¥{finalProps.reduce((s, p) => s + (p.fee || 0), 0).toLocaleString()}
          </div>
        </div>
      )}
      <div className="pt-3 border-t border-slate-200 text-[10px] text-slate-500 text-right">
        株式会社レオパレス21 / 担当：{selectedCase?.mainAssignee}
      </div>
    </div>
  );
}

// テンプレート2: 詳細PDF - 物件カタログ
function PreviewPdfCatalog({ selectedCase, finalProps, sections, coverNote }) {
  return (
    <div className="space-y-6">
      {/* カバーページ */}
      {sections.cover && (
        <div className="max-w-2xl mx-auto bg-white shadow-lg p-12" style={{ minHeight: 700 }}>
          <div className="border-b-4 border-rose-600 pb-4">
            <div className="text-[10px] text-slate-500 tracking-widest">PROPOSAL</div>
            <h1 className="text-[28px] font-bold mt-1">物件のご提案</h1>
            <div className="text-[12px] text-slate-600 mt-2">{selectedCase?.customerName} 様</div>
          </div>
          <div className="whitespace-pre-wrap text-[12px] text-slate-800 leading-loose mt-8">{coverNote}</div>
          <div className="text-right mt-12 text-[10px] text-slate-500">
            <div>株式会社レオパレス21</div>
            <div>担当：{selectedCase?.mainAssignee}</div>
            <div>案件ID：{selectedCase?.id}</div>
          </div>
        </div>
      )}
      {/* 物件詳細1物件1ページ */}
      {sections.detail && finalProps.map((p, i) => (
        <div key={p.id} className="max-w-2xl mx-auto bg-white shadow-lg p-8" style={{ minHeight: 700 }}>
          <div className="text-[9px] text-slate-500">物件 {i + 1} / {finalProps.length}</div>
          <h2 className="text-[20px] font-bold border-l-4 border-rose-600 pl-3 mt-1">{p.name}</h2>
          <div className="text-[11px] text-slate-600 mt-1">{p.address}</div>
          <div className="relative h-32 bg-gradient-to-br from-slate-200 to-slate-300 rounded mt-4 flex items-center justify-center overflow-hidden">
            <BuildingPlaceholder />
          </div>
          <div className="grid grid-cols-2 gap-3 mt-4 text-[11px]">
            <div className="bg-rose-50/40 p-3 rounded">
              <div className="text-[24px] font-bold text-rose-600">¥{Number(p.rent).toLocaleString()}</div>
              <div className="text-[9px] text-slate-500">/月（管理費 ¥{Number(p.fee || 0).toLocaleString()}）</div>
            </div>
            <div className="bg-slate-50 p-3 rounded text-[10px] space-y-0.5">
              <div>間取り：<span className="font-bold">{p.layout}</span></div>
              <div>専有面積：<span className="font-bold">{p.size}㎡</span></div>
              <div>築年数：<span className="font-bold">{p.age}年</span></div>
              <div>最寄駅：<span className="font-bold">{p.station}駅 徒歩{p.walkMin}分</span></div>
            </div>
          </div>
          <div className="mt-4">
            <div className="text-[10px] font-bold text-slate-700 mb-1">設備</div>
            <div className="flex flex-wrap gap-1">
              {(p.features || []).map((f) => (
                <span key={f} className="text-[9px] px-1.5 py-0.5 bg-sky-50 text-sky-700 rounded">{f}</span>
              ))}
            </div>
          </div>
          <div className="h-24 bg-slate-100 border border-slate-200 rounded mt-4 flex items-center justify-center text-[10px] text-slate-500">
            （間取り図）
          </div>
        </div>
      ))}
      {/* 比較表 */}
      {sections.comparison && (
        <div className="max-w-2xl mx-auto bg-white shadow-lg p-8">
          <h2 className="text-[16px] font-bold border-l-4 border-rose-600 pl-3 mb-3">比較表</h2>
          <table className="w-full text-[10px] border-collapse">
            <thead className="bg-rose-50">
              <tr>
                <th className="border border-rose-200 px-2 py-1.5 text-left">物件名</th>
                <th className="border border-rose-200 px-2 py-1.5 text-right">賃料</th>
                <th className="border border-rose-200 px-2 py-1.5 text-right">徒歩</th>
                <th className="border border-rose-200 px-2 py-1.5 text-right">面積</th>
                <th className="border border-rose-200 px-2 py-1.5 text-right">築</th>
              </tr>
            </thead>
            <tbody>
              {finalProps.map((p) => (
                <tr key={p.id}>
                  <td className="border border-rose-200 px-2 py-1">{p.name}</td>
                  <td className="border border-rose-200 px-2 py-1 text-right">¥{Number(p.rent).toLocaleString()}</td>
                  <td className="border border-rose-200 px-2 py-1 text-right">{p.walkMin}分</td>
                  <td className="border border-rose-200 px-2 py-1 text-right">{p.size}㎡</td>
                  <td className="border border-rose-200 px-2 py-1 text-right">{p.age}年</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// テンプレート3: 建設業向け - 現場社員寮提案書
function PreviewSiteDormitory({ selectedCase, finalProps, sections, coverNote }) {
  return (
    <div className="max-w-4xl mx-auto bg-white shadow-lg p-8 space-y-4">
      <div className="border-b-2 border-amber-600 pb-2 flex items-center justify-between">
        <div>
          <div className="text-[10px] text-slate-500">建設業向け・現場社員寮提案書</div>
          <h1 className="text-[18px] font-bold">{selectedCase?.customerName} 様 現場社員寮ご提案</h1>
        </div>
        <div className="text-right text-[10px] text-slate-500">
          現場：<span className="font-bold">{selectedCase?.workplace}</span>
        </div>
      </div>
      {sections.cover && (
        <div className="whitespace-pre-wrap text-[11px] text-slate-800 leading-relaxed bg-amber-50/30 p-3 rounded border border-amber-100">{coverNote}</div>
      )}
      {sections.detail && (
        <table className="w-full text-[10px] border-collapse">
          <thead className="bg-amber-50">
            <tr>
              <th className="border border-amber-200 px-2 py-1.5 text-left">No.</th>
              <th className="border border-amber-200 px-2 py-1.5 text-left">物件名</th>
              <th className="border border-amber-200 px-2 py-1.5 text-left">所在地</th>
              <th className="border border-amber-200 px-2 py-1.5 text-right">現場距離</th>
              <th className="border border-amber-200 px-2 py-1.5 text-right">空室数</th>
              <th className="border border-amber-200 px-2 py-1.5 text-right">賃料</th>
              <th className="border border-amber-200 px-2 py-1.5 text-left">間取/面積</th>
              <th className="border border-amber-200 px-2 py-1.5 text-left">備考</th>
            </tr>
          </thead>
          <tbody>
            {finalProps.map((p, i) => (
              <tr key={p.id}>
                <td className="border border-amber-200 px-2 py-1 text-right">{i + 1}</td>
                <td className="border border-amber-200 px-2 py-1 font-medium">{p.name}</td>
                <td className="border border-amber-200 px-2 py-1">{p.address}</td>
                <td className="border border-amber-200 px-2 py-1 text-right">{Math.floor(Math.random() * 5 + 1)}km</td>
                <td className="border border-amber-200 px-2 py-1 text-right font-bold text-amber-700">{p.available || "-"}部屋</td>
                <td className="border border-amber-200 px-2 py-1 text-right">¥{Number(p.rent).toLocaleString()}</td>
                <td className="border border-amber-200 px-2 py-1">{p.layout} / {p.size}㎡</td>
                <td className="border border-amber-200 px-2 py-1 text-[9px]">複数入居可</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <div className="pt-3 border-t border-slate-200 text-[10px] text-slate-500 text-right">
        担当：{selectedCase?.mainAssignee} / レオパレス21 法人営業
      </div>
    </div>
  );
}

// テンプレート4: 比較重視 - 横並びシート
function PreviewComparison({ selectedCase, finalProps, sections, coverNote }) {
  return (
    <div className="max-w-5xl mx-auto bg-white shadow-lg p-8 space-y-4">
      <div className="border-b-2 border-indigo-600 pb-2">
        <div className="text-[10px] text-slate-500">比較重視・横並び比較シート</div>
        <h1 className="text-[18px] font-bold">{selectedCase?.customerName} 様 物件比較シート</h1>
      </div>
      {sections.cover && (
        <div className="whitespace-pre-wrap text-[11px] text-slate-800 leading-relaxed">{coverNote}</div>
      )}
      {sections.detail && (
        <table className="w-full text-[10px] border-collapse">
          <thead className="bg-indigo-50">
            <tr>
              <th className="border border-indigo-200 px-2 py-1.5 text-left w-32">項目</th>
              {finalProps.map((p, i) => (
                <th key={p.id} className="border border-indigo-200 px-2 py-1.5 text-left">候補 {i + 1}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-indigo-200 px-2 py-1.5 font-bold bg-indigo-50/40">物件名</td>
              {finalProps.map((p) => <td key={p.id} className="border border-indigo-200 px-2 py-1.5 font-medium">{p.name}</td>)}
            </tr>
            <tr>
              <td className="border border-indigo-200 px-2 py-1.5 font-bold bg-indigo-50/40">所在地</td>
              {finalProps.map((p) => <td key={p.id} className="border border-indigo-200 px-2 py-1.5">{p.address}</td>)}
            </tr>
            <tr>
              <td className="border border-indigo-200 px-2 py-1.5 font-bold bg-indigo-50/40">賃料</td>
              {finalProps.map((p) => <td key={p.id} className="border border-indigo-200 px-2 py-1.5 text-rose-600 font-bold">¥{Number(p.rent).toLocaleString()}</td>)}
            </tr>
            <tr>
              <td className="border border-indigo-200 px-2 py-1.5 font-bold bg-indigo-50/40">管理費</td>
              {finalProps.map((p) => <td key={p.id} className="border border-indigo-200 px-2 py-1.5">¥{Number(p.fee || 0).toLocaleString()}</td>)}
            </tr>
            <tr>
              <td className="border border-indigo-200 px-2 py-1.5 font-bold bg-indigo-50/40">最寄駅</td>
              {finalProps.map((p) => <td key={p.id} className="border border-indigo-200 px-2 py-1.5">{p.station}駅 徒歩{p.walkMin}分</td>)}
            </tr>
            <tr>
              <td className="border border-indigo-200 px-2 py-1.5 font-bold bg-indigo-50/40">間取/面積</td>
              {finalProps.map((p) => <td key={p.id} className="border border-indigo-200 px-2 py-1.5">{p.layout} / {p.size}㎡</td>)}
            </tr>
            <tr>
              <td className="border border-indigo-200 px-2 py-1.5 font-bold bg-indigo-50/40">築年数</td>
              {finalProps.map((p) => <td key={p.id} className="border border-indigo-200 px-2 py-1.5">{p.age}年</td>)}
            </tr>
            <tr>
              <td className="border border-indigo-200 px-2 py-1.5 font-bold bg-indigo-50/40">設備</td>
              {finalProps.map((p) => (
                <td key={p.id} className="border border-indigo-200 px-2 py-1.5">
                  <div className="flex flex-wrap gap-0.5">
                    {(p.features || []).slice(0, 4).map((f) => (
                      <span key={f} className="text-[8px] px-1 py-0.5 bg-sky-50 text-sky-700 rounded">{f}</span>
                    ))}
                  </div>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      )}
    </div>
  );
}

// テンプレート5: プレミアム - 役員向け
function PreviewPremium({ selectedCase, finalProps, sections, coverNote }) {
  return (
    <div className="max-w-2xl mx-auto bg-white shadow-lg p-12 space-y-6">
      <div className="text-center border-b-4 border-slate-900 pb-4">
        <div className="text-[9px] text-slate-500 tracking-[0.3em]">PREMIUM PROPOSAL</div>
        <h1 className="text-[24px] font-bold mt-1 tracking-wide">役員向け短期出張物件のご提案</h1>
        <div className="text-[11px] text-slate-600 mt-2">{selectedCase?.customerName} 様</div>
      </div>
      {sections.cover && (
        <div className="whitespace-pre-wrap text-[12px] text-slate-800 leading-loose">{coverNote}</div>
      )}
      {sections.detail && finalProps.map((p, i) => (
        <div key={p.id} className="border border-slate-900 p-4">
          <div className="text-[9px] text-slate-500 tracking-widest">PROPERTY {String(i + 1).padStart(2, "0")}</div>
          <h3 className="text-[16px] font-bold mt-1">{p.name}</h3>
          <div className="text-[10px] text-slate-600">{p.address}</div>
          <div className="relative h-28 bg-gradient-to-br from-slate-300 to-slate-400 mt-3 flex items-center justify-center overflow-hidden">
            <BuildingPlaceholder />
          </div>
          <div className="grid grid-cols-2 mt-3 text-[11px] gap-2">
            <div>
              <div className="text-[16px] font-bold">¥{Number(p.rent).toLocaleString()}<span className="text-[9px] text-slate-500"> /月</span></div>
              <div className="text-[9px] text-slate-500 mt-0.5">{p.layout} / {p.size}㎡ / 築{p.age}年</div>
              <div className="text-[9px] text-slate-500">{p.station}駅 徒歩{p.walkMin}分</div>
            </div>
            <div className="text-[9px] text-slate-700">
              <div className="font-bold mb-0.5">＼ コンシェルジュサービス対応 ／</div>
              <div>・24時間フロント</div>
              <div>・専用クリーニング</div>
              <div>・空港送迎手配</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ====================================================================
// URL共有ダイアログ
// ====================================================================
// ====================================================================
// メール送信ダイアログ item13（CCに上長・自チームを固定／送信後 反響システムに記録）
// ====================================================================
function MailComposeDialog({ selectedCase, finalProps, coverNote, onClose, setCurrent }) {
  // CC固定（上長・自チーム）。抜け漏れ防止のため削除不可。
  const lockedCc = ["上長：マネージャー（社内ID）", "自チーム：賃貸提案G メーリングリスト"];
  const [to, setTo] = useState("（顧客の宛先メールは送信時に選択。本画面では保持しません）");
  const [subject, setSubject] = useState(`【レオパレス21】${selectedCase?.customerName || ""}様 物件のご提案（${finalProps.length}件）`);
  const [body, setBody] = useState(
    `${coverNote || ""}\n\n■ ご提案物件（${finalProps.length}件）\n` +
    finalProps.map((p, i) => `${i + 1}. ${p.name}／${(p.rent / 10000).toFixed(1)}万円・${p.station}駅 徒歩${p.walkMin}分・${p.layout}`).join("\n") +
    `\n\n詳細・最新の空室状況は共有URLよりご確認ください。\nレオパレス21`
  );
  const [sent, setSent] = useState(false);
  const [reactionId, setReactionId] = useState(null);

  const send = () => {
    const id = addReactionRecord({
      caseId: selectedCase?.id || "—",
      customerName: selectedCase?.customerName || "—",
      status: "提案中",
      properties: finalProps.length,
      note: `提案メール送信（${finalProps.length}件）`,
    });
    setReactionId(id);
    setSent(true);
  };

  return (
    <div className="fixed inset-0 z-[2000] bg-slate-900/50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-md shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="px-5 py-3 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-[14px] font-bold text-slate-900 flex items-center gap-2">
            <Mail className="w-4 h-4 text-indigo-600" />
            提案メールの作成・送信
          </h3>
          <button onClick={onClose} className="w-8 h-8 inline-flex items-center justify-center rounded hover:bg-slate-100 text-slate-500"><X className="w-4 h-4" /></button>
        </div>

        {sent ? (
          <div className="p-6 text-center">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
            <h4 className="text-[14px] font-bold text-slate-900 mb-1">メールを送信しました（モック）</h4>
            <p className="text-[11px] text-slate-600">送信内容を反響システムに記録しました（反響ID：<span className="font-mono">{reactionId}</span>・ステータス「提案中」）。</p>
            <div className="flex items-center justify-center gap-2 mt-4">
              <button onClick={onClose} className="px-3 py-1.5 text-[12px] border border-slate-300 rounded text-slate-700">閉じる</button>
              <button
                onClick={() => { onClose(); setCurrent && setCurrent("reaction"); }}
                className="px-4 py-1.5 text-[12px] font-bold text-white rounded bg-sky-600 hover:bg-sky-700 inline-flex items-center gap-1"
              >
                <Cloud className="w-3.5 h-3.5" />
                反響システムを開く
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-5 space-y-3">
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">宛先（To）</label>
                <input value={to} onChange={(e) => setTo(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded text-[11px] text-slate-500" />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">CC（自動付与・削除不可）</label>
                <div className="flex flex-wrap gap-1.5">
                  {lockedCc.map((c) => (
                    <span key={c} className="inline-flex items-center gap-1 text-[10px] px-2 py-1 rounded bg-slate-100 text-slate-700 border border-slate-300">
                      <Lock className="w-2.5 h-2.5" />{c}
                    </span>
                  ))}
                </div>
                <p className="text-[9px] text-slate-400 mt-1">※ 送信漏れ防止のため、上長と自チームは常にCCに含まれます。</p>
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">件名</label>
                <input value={subject} onChange={(e) => setSubject(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded text-[12px]" />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">本文（送信前に手直しできます）</label>
                <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={10} className="w-full px-3 py-2 border border-slate-300 rounded text-[12px] leading-relaxed" />
              </div>
            </div>
            <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-2">
              <button onClick={onClose} className="px-3 py-1.5 text-[12px] border border-slate-300 rounded text-slate-700">キャンセル</button>
              <button onClick={send} className="px-4 py-1.5 text-[12px] font-bold text-white rounded bg-indigo-600 hover:bg-indigo-700 inline-flex items-center gap-1">
                <Mail className="w-3.5 h-3.5" />
                送信（CC自動付与）
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ====================================================================
// URL共有ダイアログ
// ====================================================================
function ShareUrlDialog({ selectedCase, finalProps, initialView, onClose }) {
  const shareUrl = `https://leopalace21.internal/proposals/${selectedCase?.id}/share/${Math.random().toString(36).slice(2, 10)}`;
  const [expireDays, setExpireDays] = useState("7");
  const [withPassword, setWithPassword] = useState(true);
  const [copied, setCopied] = useState(false);
  const viewLabel = RECIPIENT_VIEWS.find((v) => v.id === initialView)?.label || "リスト＋地図連動";

  const handleCopy = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    } else {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const confirmShare = () => {
    // 受取側ビューが参照する共有ペイロードを保存（個人情報は含めない）
    setSharedProposal({
      caseId: selectedCase?.id,
      customerName: selectedCase?.customerName,
      properties: finalProps,
      initialView: initialView || "list_map",
      password: withPassword ? "1234" : null, // モック固定PW
      sharedAt: new Date().toLocaleString("ja-JP"),
      expireDays,
    });
    alert(`URL 共有を確定しました（モック）\n受取側プレビューから開封できます${withPassword ? "（PW: 1234）" : ""}。`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-md shadow-xl w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
        <div className="px-5 py-3 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-[14px] font-bold text-slate-900 flex items-center gap-2">
            <LinkIcon className="w-4 h-4 text-brand" />
            提案資料を URL で共有
          </h3>
          <button onClick={onClose} className="w-8 h-8 inline-flex items-center justify-center rounded hover:bg-slate-100 text-slate-500">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-5 space-y-4">
          <p className="text-[11px] text-slate-600">
            {finalProps.length} 件の物件を含む提案資料を、専用 URL で顧客に共有できます。
            メール添付ではなく URL を送付することで、ファイルサイズ制限を回避し、開封状況も追跡可能です。
          </p>

          <div>
            <label className="text-[11px] font-bold text-slate-700 block mb-1">共有 URL</label>
            <div className="flex items-center gap-1">
              <input
                value={shareUrl}
                readOnly
                className="flex-1 px-3 py-2 border border-slate-300 rounded text-[11px] font-mono bg-slate-50 select-all"
              />
              <button
                onClick={handleCopy}
                className={`px-3 py-2 text-[11px] font-bold rounded inline-flex items-center gap-1 ${
                  copied
                    ? "bg-emerald-500 text-white"
                    : "bg-brand text-white hover:bg-brand-dark"
                }`}
              >
                {copied ? <><CheckCircle2 className="w-3 h-3" />コピー済</> : <><Copy className="w-3 h-3" />コピー</>}
              </button>
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-700 block mb-1">有効期限</label>
            <select value={expireDays} onChange={(e) => setExpireDays(e.target.value)} className="w-full px-2 py-2 border border-slate-300 rounded text-[11px]">
              <option value="1">1日</option>
              <option value="3">3日</option>
              <option value="7">7日</option>
              <option value="14">14日</option>
              <option value="30">30日</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-700 block mb-1">受取側の初期表示</label>
            <div className="text-[11px] text-slate-700 bg-slate-50 border border-slate-200 rounded px-2 py-2">{viewLabel}</div>
          </div>

          <div>
            <label className="flex items-center gap-2 text-[11px] cursor-pointer">
              <input type="checkbox" checked={withPassword} onChange={() => setWithPassword(!withPassword)} className="rounded text-brand" />
              パスワード保護を有効にする
            </label>
            {withPassword && (
              <div className="text-[10px] text-slate-500 mt-1 ml-5">
                パスワードは別途 SMS or 電話で顧客にお伝えください（モックPW: 1234）
              </div>
            )}
          </div>
        </div>
        <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-[12px] border border-slate-300 rounded text-slate-700 hover:bg-slate-50"
          >
            閉じる
          </button>
          <button
            onClick={confirmShare}
            className="px-4 py-1.5 text-[12px] font-bold text-white rounded bg-brand hover:bg-brand-dark inline-flex items-center gap-1"
          >
            <LinkIcon className="w-3.5 h-3.5" />
            この設定で共有を確定
          </button>
        </div>
      </div>
    </div>
  );
}

// ====================================================================
// メイン：4ステップフロー
// ====================================================================
export default function Proposal({ setCurrent }) {
  const [step, setStep] = useState(1);
  const [selectedCase, setSelectedCase] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [candidates, setCandidates] = useState([]);

  const reset = () => {
    setStep(1);
    setSelectedCase(null);
    setAnalysis(null);
    setCandidates([]);
  };

  return (
    <div className="p-5 space-y-3">
      <StepIndicator step={step} />

      {step === 1 && (
        <Step1CaseSelector
          onSelect={(c) => {
            setSelectedCase(c);
            setAnalysis(null);
            setCandidates([]);
            setStep(2);
          }}
        />
      )}
      {step === 2 && selectedCase && (
        <Step2AiAnalysis
          selectedCase={selectedCase}
          analysis={analysis}
          setAnalysis={setAnalysis}
          onNext={() => setStep(3)}
          onBack={() => setStep(1)}
        />
      )}
      {step === 3 && analysis && (
        <Step3PropertySearch
          analysis={analysis}
          candidates={candidates}
          setCandidates={setCandidates}
          onNext={() => setStep(4)}
          onBack={() => setStep(2)}
        />
      )}
      {step === 4 && selectedCase && (
        <Step4Output
          selectedCase={selectedCase}
          candidates={candidates}
          setCandidates={setCandidates}
          onBack={() => setStep(3)}
          onReset={reset}
          setCurrent={setCurrent}
        />
      )}
    </div>
  );
}
