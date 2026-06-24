import React, { useState, useMemo } from "react";
import {
  Search,
  Eye,
  X,
  Trash2,
  FileSpreadsheet,
  FileText,
  Layers,
  Image as ImageIcon,
  Link as LinkIcon,
  Copy,
  CheckCircle2,
} from "lucide-react";

// ====================================================================
// 提案資料出力履歴データ（Excel/PDF 化された都度ここに残る）
// ====================================================================
const INITIAL_HISTORY = [
  {
    id: "PRP-2026-0513-014",
    caseId: "REQ-2026-0513-031",
    customerName: "サンプルE医療株式会社",
    contact: "人事課 サンプル 賢治",
    templateId: "T-002",
    templateName: "詳細PDF - 物件カタログ",
    format: "pdf",
    properties: [
      { id: "P-001", name: "レオパレスサンプル001", address: "東京都江東区豊洲4-1-1", station: "豊洲", walkMin: 5, layout: "1K", size: 23.4, age: 8, rent: 78000, fee: 4500, features: ["家具家電付き", "オートロック", "宅配BOX"] },
      { id: "P-007", name: "レオパレスサンプル004", address: "東京都江東区門前仲町2-3-5", station: "門前仲町", walkMin: 4, layout: "1K", size: 22.0, age: 12, rent: 75000, fee: 4000, features: ["家具家電付き", "オートロック"] },
      { id: "P-012", name: "レオパレスサンプル006", address: "東京都江東区清澄3-3-21", station: "清澄白河", walkMin: 7, layout: "1K", size: 24.5, age: 6, rent: 82000, fee: 5000, features: ["家具家電付き", "オートロック", "宅配BOX", "Wi-Fi"] },
    ],
    createdAt: "2026/05/13 16:42",
    createdBy: "サンプル",
    coverNote: "サンプルE医療株式会社様\n\nお世話になっております。レオパレス21のサンプルです。\n夜勤シフト考慮の上、駅近物件を中心に3物件をご提案いたします。",
    pages: 8,
    fileSize: 2456000,
  },
  {
    id: "PRP-2026-0512-008",
    caseId: "REQ-2026-0515-022",
    customerName: "サンプルC商事株式会社",
    contact: "人事部 サンプル 花子",
    templateId: "T-005",
    templateName: "プレミアム - 役員向け短期出張提案",
    format: "pdf",
    properties: [
      { id: "P-020", name: "レオパレスサンプル008", address: "東京都港区六本木3-2-1", station: "六本木", walkMin: 3, layout: "1LDK", size: 38.0, age: 4, rent: 145000, fee: 8000, features: ["家具家電付き", "オートロック", "コンシェルジュ", "Wi-Fi", "宅配BOX"] },
      { id: "P-021", name: "レオパレスサンプル009", address: "東京都港区赤坂6-3-12", station: "赤坂", walkMin: 5, layout: "1LDK", size: 35.5, age: 7, rent: 132000, fee: 7000, features: ["家具家電付き", "オートロック", "Wi-Fi"] },
    ],
    createdAt: "2026/05/12 11:30",
    createdBy: "サンプル 二郎",
    coverNote: "サンプルC商事株式会社様\n\nお世話になっております。ご依頼の出張利用物件として、駅徒歩5分以内のハイグレード物件をご提案いたします。",
    pages: 6,
    fileSize: 3120000,
  },
  {
    id: "PRP-2026-0511-002",
    caseId: "REQ-2026-0511-051",
    customerName: "サンプルA株式会社",
    contact: "総務部 サンプル 太郎",
    templateId: "T-001",
    templateName: "標準Excel - 物件一覧（8列）",
    format: "excel",
    properties: [
      { id: "P-005", name: "レオパレスサンプル002", address: "東京都江東区豊洲5-1-8", station: "豊洲", walkMin: 10, layout: "1K", size: 24.0, age: 5, rent: 82000, fee: 5000, features: ["家具家電付き", "オートロック", "宅配BOX"] },
      { id: "P-008", name: "レオパレスサンプル007", address: "東京都江東区東陽4-2-3", station: "東陽町", walkMin: 6, layout: "1K", size: 25.5, age: 9, rent: 78000, fee: 4500, features: ["家具家電付き", "オートロック"] },
      { id: "P-014", name: "レオパレスサンプル005", address: "東京都江東区富岡1-5-22", station: "門前仲町", walkMin: 8, layout: "1K", size: 23.0, age: 11, rent: 75000, fee: 4000, features: ["家具家電付き", "オートロック", "Wi-Fi"] },
    ],
    createdAt: "2026/05/11 14:08",
    createdBy: "サンプル",
    coverNote: "サンプルA株式会社様\n\n新卒社員3名分の社宅候補として、ご予算内で豊洲駅徒歩20分圏内の物件を3件ご提案いたします。",
    pages: "—",
    fileSize: 156000,
  },
  {
    id: "PRP-2026-0510-019",
    caseId: "REQ-2026-0509-067",
    customerName: "サンプルB建設株式会社",
    contact: "管理本部 サンプル 次郎",
    templateId: "T-003",
    templateName: "建設業向け - 現場社員寮提案書",
    format: "excel",
    properties: [
      { id: "P-030", name: "レオパレスサンプル011", address: "埼玉県さいたま市大宮区桜木町3-1", station: "大宮", walkMin: 8, layout: "1K", size: 22.5, age: 10, rent: 58000, fee: 3500, features: ["家具家電付き", "複数入居可"] },
      { id: "P-031", name: "レオパレスサンプル012", address: "埼玉県さいたま市大宮区大門町2-2-5", station: "大宮", walkMin: 12, layout: "1K", size: 21.0, age: 13, rent: 55000, fee: 3000, features: ["家具家電付き", "複数入居可"] },
    ],
    createdAt: "2026/05/10 09:25",
    createdBy: "サンプル",
    coverNote: "サンプルB建設株式会社様\n\n現場社員12名様分として、大宮現場から3km圏内の物件をご提案いたします。",
    pages: "—",
    fileSize: 198000,
  },
  {
    id: "PRP-2026-0509-005",
    caseId: "REQ-2026-0507-082",
    customerName: "サンプルD物流株式会社",
    contact: "総務部 サンプル 美咲",
    templateId: "T-001",
    templateName: "標準Excel - 物件一覧（8列）",
    format: "excel",
    properties: [
      { id: "P-040", name: "レオパレスサンプル013", address: "千葉県市川市市川南1-2-3", station: "市川", walkMin: 7, layout: "1K", size: 23.0, age: 8, rent: 68000, fee: 4000, features: ["家具家電付き", "オートロック", "駐輪場"] },
      { id: "P-041", name: "レオパレスサンプル014", address: "千葉県市川市八幡3-1-12", station: "本八幡", walkMin: 5, layout: "1K", size: 24.0, age: 6, rent: 72000, fee: 4500, features: ["家具家電付き", "オートロック", "宅配BOX", "駐輪場"] },
      { id: "P-042", name: "レオパレスサンプル015", address: "千葉県船橋市本町5-3-8", station: "船橋", walkMin: 9, layout: "1K", size: 22.5, age: 10, rent: 65000, fee: 3800, features: ["家具家電付き", "駐輪場"] },
    ],
    createdAt: "2026/05/09 16:15",
    createdBy: "サンプル 三郎",
    coverNote: "サンプルD物流株式会社様\n\n新卒社員5名分として、駐輪場完備の物件を中心にご提案いたします。",
    pages: "—",
    fileSize: 142000,
  },
  {
    id: "PRP-2026-0508-011",
    caseId: "REQ-2026-0512-040",
    customerName: "サンプルF技術株式会社",
    contact: "総務 サンプル 健一",
    templateId: "T-004",
    templateName: "比較重視 - 横並び比較シート",
    format: "excel",
    properties: [
      { id: "P-050", name: "レオパレスサンプル016", address: "神奈川県横浜市西区南幸2-1-1", station: "横浜", walkMin: 6, layout: "1K", size: 26.0, age: 5, rent: 82000, fee: 5000, features: ["家具家電付き", "オートロック", "Wi-Fi"] },
      { id: "P-051", name: "レオパレスサンプル017", address: "神奈川県横浜市西区みなとみらい4-2-1", station: "みなとみらい", walkMin: 8, layout: "1K", size: 28.0, age: 3, rent: 88000, fee: 5500, features: ["家具家電付き", "オートロック", "宅配BOX", "Wi-Fi"] },
      { id: "P-052", name: "レオパレスサンプル018", address: "神奈川県横浜市中区桜木町1-1-7", station: "桜木町", walkMin: 7, layout: "1K", size: 25.5, age: 7, rent: 79000, fee: 4500, features: ["家具家電付き", "オートロック", "Wi-Fi"] },
    ],
    createdAt: "2026/05/08 10:50",
    createdBy: "サンプル 三郎",
    coverNote: "サンプルF技術株式会社様\n\n横浜西区・中区エリアの3物件を比較表形式でご提案いたします。在宅勤務考慮で Wi-Fi 対応物件を中心としています。",
    pages: 1,
    fileSize: 89000,
  },
  {
    id: "PRP-2026-0506-022",
    caseId: "REQ-2026-0517-001",
    customerName: "サンプルA株式会社",
    contact: "総務部 サンプル 太郎",
    templateId: "T-006",
    templateName: "シンプル - 即入居・スピード提案",
    format: "pdf",
    properties: [
      { id: "P-060", name: "レオパレスサンプル003", address: "東京都江東区豊洲6-2-1", station: "豊洲", walkMin: 4, layout: "1K", size: 22.0, age: 3, rent: 84000, fee: 5000, features: ["家具家電付き", "オートロック", "即入居可"] },
      { id: "P-061", name: "レオパレスサンプル010", address: "東京都江東区辰巳1-2-15", station: "辰巳", walkMin: 6, layout: "1K", size: 21.5, age: 9, rent: 70000, fee: 4000, features: ["家具家電付き", "即入居可"] },
    ],
    createdAt: "2026/05/06 14:30",
    createdBy: "サンプル",
    coverNote: "サンプルA株式会社様\n\n急ぎご対応の必要な案件として、即入居可能な物件を2件ご提案いたします。",
    pages: 1,
    fileSize: 412000,
  },
];

// バイト数フォーマット
const formatSize = (bytes) => {
  if (!bytes && bytes !== 0) return "-";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

// 履歴プレビューに統合する URL 共有モーダル
function HistoryShareUrlDialog({ history, onClose }) {
  const shareUrl = `https://leopalace21.internal/proposals/${history.caseId}/share/${history.id.toLowerCase()}`;
  const [expireDays, setExpireDays] = useState("7");
  const [withPassword, setWithPassword] = useState(true);
  const [copied, setCopied] = useState(false);

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

  return (
    <div className="fixed inset-0 z-[60] bg-slate-900/50 flex items-center justify-center p-4" onClick={onClose}>
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
            この提案資料履歴を専用 URL で共有できます。メール添付ではなく URL を送付することで、ファイルサイズ制限を回避でき、開封状況も追跡可能です。
          </p>
          <div>
            <label className="text-[11px] font-bold text-slate-700 block mb-1">共有 URL</label>
            <div className="flex items-center gap-1">
              <input value={shareUrl} readOnly className="flex-1 px-3 py-2 border border-slate-300 rounded text-[11px] font-mono bg-slate-50 select-all" />
              <button
                onClick={handleCopy}
                className={`px-3 py-2 text-[11px] font-bold rounded inline-flex items-center gap-1 ${
                  copied ? "bg-emerald-500 text-white" : "bg-brand text-white hover:bg-brand-dark"
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
            <label className="flex items-center gap-2 text-[11px] cursor-pointer">
              <input type="checkbox" checked={withPassword} onChange={() => setWithPassword(!withPassword)} className="rounded text-brand" />
              パスワード保護を有効にする
            </label>
            {withPassword && (
              <div className="text-[10px] text-slate-500 mt-1 ml-5">
                パスワードは別途 SMS or 電話で顧客にお伝えください
              </div>
            )}
          </div>
        </div>
        <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-2">
          <button onClick={onClose} className="px-3 py-1.5 text-[12px] border border-slate-300 rounded text-slate-700 hover:bg-slate-50">
            閉じる
          </button>
          <button
            onClick={() => { alert("URL 共有を確定しました（モック）"); onClose(); }}
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
// プレビューダイアログ（A4風）
// ====================================================================
function HistoryPreviewDialog({ history, onClose }) {
  const [showShare, setShowShare] = useState(false);
  if (!history) return null;
  const isExcel = history.format === "excel";

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-md shadow-xl w-full max-w-4xl max-h-[92vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="px-5 py-3 border-b border-slate-200 flex items-center justify-between bg-slate-50 flex-wrap gap-2">
          <div className="min-w-0">
            <h3 className="text-[14px] font-bold text-slate-900 flex items-center gap-2">
              <Eye className="w-4 h-4 text-brand" />
              提案資料プレビュー
            </h3>
            <p className="text-[10px] text-slate-500 mt-0.5">
              <span className="font-mono">{history.id}</span>　/　{history.templateName}
              <span className={`ml-2 text-[9px] font-bold px-1.5 py-0.5 rounded border ${
                isExcel ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-rose-50 text-rose-700 border-rose-200"
              }`}>
                {history.format.toUpperCase()}
              </span>
            </p>
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => alert(`Excel形式で再出力しました（モック）`)}
              className="px-2.5 py-1 text-[11px] font-bold text-white rounded bg-emerald-600 hover:bg-emerald-700 inline-flex items-center gap-1"
            >
              <FileSpreadsheet className="w-3 h-3" />
              Excel
            </button>
            <button
              onClick={() => alert(`図面写真（間取り図・外観写真）を ZIP 形式で一括ダウンロードしました（モック）`)}
              className="px-2.5 py-1 text-[11px] font-bold text-white rounded bg-purple-600 hover:bg-purple-700 inline-flex items-center gap-1"
            >
              <ImageIcon className="w-3 h-3" />
              図面写真
            </button>
            <button
              onClick={() => setShowShare(true)}
              className="px-2.5 py-1 text-[11px] font-bold text-white rounded bg-brand hover:bg-brand-dark inline-flex items-center gap-1"
            >
              <LinkIcon className="w-3 h-3" />
              URL共有
            </button>
            <button
              onClick={() => alert(`PDF形式で再出力しました（モック）`)}
              className="px-2.5 py-1 text-[11px] font-bold text-white rounded bg-rose-600 hover:bg-rose-700 inline-flex items-center gap-1"
            >
              <FileText className="w-3 h-3" />
              PDF
            </button>
            <button onClick={onClose} className="w-8 h-8 inline-flex items-center justify-center rounded hover:bg-slate-200 text-slate-500 ml-1">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto bg-slate-100 p-6">
          <div className="max-w-3xl mx-auto bg-white shadow-lg p-8 space-y-4">
            <div className="border-b-2 pb-3 flex items-center justify-between"
              style={{ borderBottomColor: isExcel ? "#059669" : "#e11d48" }}>
              <div>
                <div className="text-[10px] text-slate-500">提案書</div>
                <h1 className="text-[20px] font-bold text-slate-900">{history.customerName} 様 ご提案物件</h1>
              </div>
              <div className="text-right text-[10px] text-slate-500">
                <div>案件ID: <span className="font-mono">{history.caseId}</span></div>
                <div>提案日: {history.createdAt}</div>
              </div>
            </div>
            <div className="whitespace-pre-wrap text-[11px] text-slate-800 leading-relaxed">{history.coverNote}</div>

            <h2 className="text-[14px] font-bold border-l-4 pl-2 mt-4" style={{ borderColor: isExcel ? "#059669" : "#e11d48" }}>
              ご提案物件 ({history.properties.length}件)
            </h2>
            {history.properties.map((p, i) => (
              <div key={p.id} className="border border-slate-200 rounded p-3">
                <div className="flex justify-between items-baseline">
                  <div>
                    <span className="text-[9px] text-slate-500">物件 {i + 1}</span>
                    <h3 className="text-[14px] font-bold">{p.name}</h3>
                    <div className="text-[10px] text-slate-600">{p.address}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[16px] font-bold text-rose-600">¥{Number(p.rent).toLocaleString()}</div>
                    <div className="text-[9px] text-slate-500">管理費 ¥{Number(p.fee || 0).toLocaleString()}</div>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-2 mt-2 text-[10px]">
                  <div><span className="text-slate-500">最寄駅：</span>{p.station} 徒歩{p.walkMin}分</div>
                  <div><span className="text-slate-500">間取：</span>{p.layout}</div>
                  <div><span className="text-slate-500">面積：</span>{p.size}㎡</div>
                  <div><span className="text-slate-500">築：</span>{p.age}年</div>
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {(p.features || []).map((f) => (
                    <span key={f} className="text-[9px] px-1.5 py-0.5 bg-sky-50 text-sky-700 rounded">{f}</span>
                  ))}
                </div>
              </div>
            ))}

            <h2 className="text-[14px] font-bold border-l-4 pl-2 mt-4" style={{ borderColor: isExcel ? "#059669" : "#e11d48" }}>
              比較表
            </h2>
            <table className="w-full text-[10px] border-collapse">
              <thead style={{ backgroundColor: isExcel ? "#ecfdf5" : "#fff1f2" }}>
                <tr>
                  <th className="border border-slate-200 px-2 py-1 text-left">物件名</th>
                  <th className="border border-slate-200 px-2 py-1 text-right">賃料</th>
                  <th className="border border-slate-200 px-2 py-1 text-right">徒歩</th>
                  <th className="border border-slate-200 px-2 py-1 text-right">面積</th>
                  <th className="border border-slate-200 px-2 py-1 text-right">築</th>
                </tr>
              </thead>
              <tbody>
                {history.properties.map((p) => (
                  <tr key={p.id}>
                    <td className="border border-slate-200 px-2 py-1">{p.name}</td>
                    <td className="border border-slate-200 px-2 py-1 text-right">¥{Number(p.rent).toLocaleString()}</td>
                    <td className="border border-slate-200 px-2 py-1 text-right">{p.walkMin}分</td>
                    <td className="border border-slate-200 px-2 py-1 text-right">{p.size}㎡</td>
                    <td className="border border-slate-200 px-2 py-1 text-right">{p.age}年</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="pt-6 border-t border-slate-200 text-[10px] text-slate-500 text-center">
              株式会社レオパレス21 / 担当：{history.createdBy}
            </div>
          </div>
        </div>

        {/* URL共有ダイアログ */}
        {showShare && <HistoryShareUrlDialog history={history} onClose={() => setShowShare(false)} />}
      </div>
    </div>
  );
}

// ====================================================================
// メイン
// ====================================================================
export default function ProposalHistory() {
  const [history, setHistory] = useState(INITIAL_HISTORY);
  const [query, setQuery] = useState("");
  const [formatFilter, setFormatFilter] = useState("all");
  const [creatorFilter, setCreatorFilter] = useState("all");

  const [preview, setPreview] = useState(null);
  const [page, setPage] = useState(1);
  const pageSize = 5;

  const creators = useMemo(() => Array.from(new Set(history.map((h) => h.createdBy))), [history]);

  const filtered = useMemo(() => {
    return history.filter((h) => {
      if (formatFilter !== "all" && h.format !== formatFilter) return false;
      if (creatorFilter !== "all" && h.createdBy !== creatorFilter) return false;
      if (query) {
        const q = query.toLowerCase();
        if (
          !h.customerName?.toLowerCase().includes(q) &&
          !h.id?.toLowerCase().includes(q.toUpperCase()) &&
          !h.caseId?.toLowerCase().includes(q.toUpperCase()) &&
          !h.templateName?.toLowerCase().includes(q)
        ) return false;
      }
      return true;
    });
  }, [history, query, formatFilter, creatorFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paged = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  React.useEffect(() => {
    setPage(1);
  }, [query, formatFilter, creatorFilter, history.length]);

  const handleDelete = (id) => {
    if (window.confirm("この提案資料履歴を削除しますか？")) {
      setHistory((prev) => prev.filter((h) => h.id !== id));
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
            提案資料を Excel / PDF で出力すると、自動的に履歴として保存されます
          </div>
          <div className="text-[11px] text-slate-600 mt-1 leading-relaxed">
            過去に作成した提案資料はプレビューで内容を確認したり、Excel / PDF で再出力したりできます。
          </div>
        </div>
      </div>

      {/* ツールバー */}
      <div className="bg-white border border-slate-200 rounded-md px-4 py-3 flex items-center gap-2 flex-wrap">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="履歴ID・案件ID・顧客名・テンプレートで検索"
            className="w-80 pl-8 pr-3 py-1.5 text-[12px] bg-slate-50 border border-slate-200 rounded"
          />
        </div>
        <select value={formatFilter} onChange={(e) => setFormatFilter(e.target.value)} className="text-[11px] border border-slate-300 rounded px-2 py-1.5">
          <option value="all">全形式</option>
          <option value="excel">Excel</option>
          <option value="pdf">PDF</option>
        </select>
        <select value={creatorFilter} onChange={(e) => setCreatorFilter(e.target.value)} className="text-[11px] border border-slate-300 rounded px-2 py-1.5">
          <option value="all">全作成者</option>
          {creators.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <div className="text-[11px] text-slate-500 ml-2">
          <span className="font-bold text-slate-900">{filtered.length}</span> / {history.length} 件
        </div>
      </div>

      {/* テーブル */}
      <div className="bg-white border border-slate-200 rounded-md overflow-hidden">
        <table className="w-full text-[12px]">
          <thead className="bg-slate-50">
            <tr className="text-left text-slate-600 border-b border-slate-200">
              <th className="px-4 py-2.5 font-medium">履歴ID</th>
              <th className="px-4 py-2.5 font-medium">案件・顧客</th>
              <th className="px-4 py-2.5 font-medium">テンプレート</th>
              <th className="px-4 py-2.5 font-medium">形式</th>
              <th className="px-4 py-2.5 font-medium text-right">物件数</th>
              <th className="px-4 py-2.5 font-medium">サイズ</th>
              <th className="px-4 py-2.5 font-medium">作成</th>
              <th className="px-4 py-2.5 font-medium w-44">操作</th>
            </tr>
          </thead>
          <tbody>
            {paged.map((h) => {
              const isExcel = h.format === "excel";
              const FmtIcon = isExcel ? FileSpreadsheet : FileText;
              return (
                <tr key={h.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="px-4 py-3 font-mono text-[11px] text-slate-600">{h.id}</td>
                  <td className="px-4 py-3">
                    <div className="font-bold text-slate-900">{h.customerName}</div>
                    <div className="text-[10px] text-slate-500 font-mono">{h.caseId}</div>
                  </td>
                  <td className="px-4 py-3 text-[11px] text-slate-700">{h.templateName}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border inline-flex items-center gap-1 ${
                      isExcel ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-rose-50 text-rose-700 border-rose-200"
                    }`}>
                      <FmtIcon className="w-3 h-3" />
                      {h.format.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-[12px] font-bold text-slate-900">{h.properties.length}</span>
                    <span className="text-[10px] text-slate-500"> 件</span>
                  </td>
                  <td className="px-4 py-3 text-[11px] text-slate-600">{formatSize(h.fileSize)}</td>
                  <td className="px-4 py-3 text-[10px] text-slate-600">
                    <div>{h.createdAt}</div>
                    <div className="text-slate-500">{h.createdBy}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setPreview(h)}
                        className="w-7 h-7 inline-flex items-center justify-center rounded hover:bg-sky-50 text-slate-500 hover:text-sky-600"
                        title="プレビュー"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(h.id)}
                        className="w-7 h-7 inline-flex items-center justify-center rounded hover:bg-rose-50 text-slate-500 hover:text-rose-600"
                        title="削除"
                      >
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
            該当する提案資料履歴はありません
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

      {/* プレビューダイアログ */}
      {preview && <HistoryPreviewDialog history={preview} onClose={() => setPreview(null)} />}
    </div>
  );
}
