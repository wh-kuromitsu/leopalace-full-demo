import React, { useState, useMemo } from "react";
import {
  Activity,
  Search,
  Download,
  LogIn,
  FilePlus,
  Eye,
  Edit3,
  Trash2,
  Users as UsersIcon,
  AlertTriangle,
  Fingerprint,
  Send,
} from "lucide-react";

// 改ざん検知ハッシュ（チェーン構造を模す）
const LOG_ENTRIES = [
  { time: "2026/05/13 13:42:18", user: "サンプル", action: "案件参照", target: "REQ-2026-0517-001", type: "view", ip: "10.0.12.45", hash: "8f3a…b7c4", anomaly: false },
  { time: "2026/05/13 13:40:02", user: "サンプル", action: "検索条件変更", target: "提案作成画面", type: "edit", ip: "10.0.12.45", hash: "9e21…cd11", anomaly: false },
  { time: "2026/05/13 13:35:47", user: "サンプル", action: "候補物件追加", target: "LP-13120-0006", type: "edit", ip: "10.0.12.45", hash: "1a9c…0f73", anomaly: false },
  { time: "2026/05/13 13:30:11", user: "サンプル", action: "提案作成開始", target: "REQ-2026-0517-001", type: "create", ip: "10.0.12.45", hash: "4b80…aa28", anomaly: false },
  { time: "2026/05/13 13:22:55", user: "サンプル", action: "ログイン", target: "Azure AD SSO (MFA成功)", type: "login", ip: "10.0.12.45", hash: "f12d…39e6", anomaly: false },
  { time: "2026/05/13 11:18:30", user: "サンプル 二郎", action: "提案資料ダウンロード", target: "PRP-2026-0510-008.pdf", type: "download", ip: "10.0.12.58", hash: "7c4e…b031", anomaly: false },
  { time: "2026/05/13 10:42:09", user: "サンプル 四郎", action: "ユーザー権限変更", target: "U-0044 サンプル 三郎", type: "admin", ip: "10.0.12.32", hash: "5d92…7e84", anomaly: false },
  { time: "2026/05/13 10:15:48", user: "サンプル", action: "提案資料出力", target: "PRP-2026-0512-001.xlsx", type: "create", ip: "10.0.12.45", hash: "3f87…c4d2", anomaly: false },
  { time: "2026/05/13 09:55:12", user: "サンプル 三郎", action: "顧客マスタ参照", target: "C-0001 サンプルA株式会社", type: "view", ip: "10.0.22.78", hash: "ae13…6f50", anomaly: false },
  { time: "2026/05/13 06:00:02", user: "システム", action: "物件マスタ自動同期", target: "569,182件 / 全社CSV", type: "system", ip: "—", hash: "0099…1100", anomaly: false },
  { time: "2026/05/12 23:15:47", user: "サンプル", action: "ログイン試行", target: "Azure AD SSO（成功・社外IP）", type: "login", ip: "203.0.113.42", hash: "2b45…f8a9", anomaly: true, anomalyReason: "社外IP からのアクセス。通常パターンと異なる時間帯（23時台）。要確認。" },
  { time: "2026/05/12 17:00:18", user: "サンプル", action: "提案資料送付", target: "共有URL発行（PRP-2026-0512-001）", type: "send", ip: "10.0.12.45", hash: "6a72…d109", anomaly: false },
  { time: "2026/05/12 16:42:09", user: "サンプル", action: "提案資料出力", target: "PRP-2026-0512-001.xlsx", type: "create", ip: "10.0.12.45", hash: "8c01…3f55", anomaly: false },
  { time: "2026/05/12 15:22:44", user: "サンプル", action: "案件編集（AI抽出結果の修正）", target: "REQ-2026-0517-001 / 予算項目", type: "edit", ip: "10.0.12.45", hash: "e4d8…7b22", anomaly: false },
  { time: "2026/05/12 14:23:01", user: "サンプル", action: "依頼書PDF取込", target: "依頼書_サンプルA.pdf", type: "create", ip: "10.0.12.45", hash: "9f1a…44c7", anomaly: false },
  { time: "2026/05/12 11:08:22", user: "サンプル 四郎", action: "テンプレート編集", target: "T-001 標準Excel v2.4", type: "admin", ip: "10.0.12.32", hash: "3a55…0b91", anomaly: false },
  { time: "2026/05/12 10:15:38", user: "サンプル 二郎", action: "提案削除", target: "PRP-2026-0511-099（下書き）", type: "delete", ip: "10.0.12.58", hash: "5e30…a872", anomaly: false },
  { time: "2026/05/12 09:30:15", user: "サンプル 二郎", action: "ログイン", target: "Azure AD SSO (MFA成功)", type: "login", ip: "10.0.12.58", hash: "1c89…f04a", anomaly: false },
  { time: "2026/05/12 09:00:33", user: "サンプル", action: "ログイン", target: "Azure AD SSO (MFA成功)", type: "login", ip: "10.0.12.45", hash: "7e21…b630", anomaly: false },
  { time: "2026/05/11 18:22:09", user: "サンプル 三郎", action: "提案資料出力", target: "PRP-2026-0511-088.xlsx", type: "create", ip: "10.0.22.78", hash: "b4e9…1c33", anomaly: false },
  { time: "2026/05/11 17:15:38", user: "サンプル 三郎", action: "案件編集", target: "REQ-2026-0510-019", type: "edit", ip: "10.0.22.78", hash: "8d11…7090", anomaly: false },
  { time: "2026/05/11 14:42:01", user: "サンプル 二郎", action: "顧客マスタ参照", target: "C-0002 サンプルC商事株式会社", type: "view", ip: "10.0.12.58", hash: "a2f7…0e58", anomaly: false },
  { time: "2026/05/11 11:08:22", user: "サンプル 四郎", action: "ユーザー追加", target: "U-0050 新規ユーザー", type: "admin", ip: "10.0.12.32", hash: "f01c…b243", anomaly: false },
  { time: "2026/05/11 10:30:14", user: "サンプル", action: "案件参照", target: "REQ-2026-0510-005", type: "view", ip: "10.0.12.45", hash: "3e8a…5d77", anomaly: false },
  { time: "2026/05/11 09:18:44", user: "サンプル", action: "ログイン", target: "Azure AD SSO (MFA成功)", type: "login", ip: "10.0.12.45", hash: "9b04…2af1", anomaly: false },
  { time: "2026/05/10 16:55:09", user: "サンプル 二郎", action: "提案資料送付", target: "共有URL発行（PRP-2026-0510-008）", type: "send", ip: "10.0.12.58", hash: "c7d2…84e0", anomaly: false },
  { time: "2026/05/10 15:30:18", user: "サンプル 二郎", action: "提案資料出力", target: "PRP-2026-0510-008.pdf", type: "create", ip: "10.0.12.58", hash: "6e91…30c5", anomaly: false },
  { time: "2026/05/10 13:42:55", user: "サンプル 二郎", action: "候補物件追加", target: "LP-13120-0003", type: "edit", ip: "10.0.12.58", hash: "1f4b…ad97", anomaly: false },
  { time: "2026/05/10 11:08:30", user: "サンプル 三郎", action: "ログイン", target: "Azure AD SSO (MFA成功)", type: "login", ip: "10.0.22.78", hash: "5c30…8b12", anomaly: false },
  { time: "2026/05/10 09:42:18", user: "サンプル 四郎", action: "テンプレート承認", target: "T-003 v1.3", type: "admin", ip: "10.0.12.32", hash: "ae87…f4d8", anomaly: false },
  { time: "2026/05/09 17:20:33", user: "サンプル", action: "成約処理", target: "REQ-2026-0513-031 / サンプルE医療様", type: "edit", ip: "10.0.12.45", hash: "0d52…91a4", anomaly: false },
  { time: "2026/05/09 14:05:12", user: "サンプル", action: "提案資料送付", target: "共有URL発行（PRP-2026-0509-014）", type: "send", ip: "10.0.12.45", hash: "7b3e…62ff", anomaly: false },
];

const TYPE_ICON = {
  login: { icon: LogIn, color: "text-slate-500" },
  view: { icon: Eye, color: "text-sky-600" },
  create: { icon: FilePlus, color: "text-emerald-600" },
  edit: { icon: Edit3, color: "text-amber-600" },
  delete: { icon: Trash2, color: "text-rose-600" },
  send: { icon: Send, color: "text-indigo-600" },
  download: { icon: Download, color: "text-indigo-600" },
  admin: { icon: UsersIcon, color: "text-purple-600" },
  system: { icon: Activity, color: "text-slate-500" },
};

export default function Logs() {
  const [query, setQuery] = useState("");
  const [userFilter, setUserFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [anomalyOnly, setAnomalyOnly] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const filtered = useMemo(() => {
    return LOG_ENTRIES.filter((l) => {
      if (anomalyOnly && !l.anomaly) return false;
      if (query && !l.action.includes(query) && !l.target.includes(query) && !l.user.includes(query))
        return false;
      if (userFilter !== "all" && l.user !== userFilter) return false;
      if (typeFilter !== "all" && l.type !== typeFilter) return false;
      return true;
    });
  }, [query, userFilter, typeFilter, anomalyOnly]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paged = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // フィルタ変更時にページを1に戻す
  React.useEffect(() => {
    setPage(1);
  }, [query, userFilter, typeFilter, anomalyOnly]);

  const anomalyCount = LOG_ENTRIES.filter((l) => l.anomaly).length;

  return (
    <div className="p-5 space-y-3">
      {/* 異常検知サマリー */}
      {anomalyCount > 0 && (
        <div className="bg-rose-50 border border-rose-200 rounded-md p-3 flex items-center gap-3 text-[12px]">
          <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0" />
          <div className="flex-1">
            <div className="font-bold text-rose-900">
              AI異常検知：{anomalyCount} 件の通常と異なる操作パターンを検出しました
            </div>
            <div className="text-[11px] text-rose-700 mt-0.5">
              社外IP からのアクセス・通常と異なる時間帯のログインなど。管理者の確認が必要です。
            </div>
          </div>
          <button
            onClick={() => setAnomalyOnly(!anomalyOnly)}
            className="px-3 py-1.5 text-[11px] font-bold text-white rounded bg-rose-500 hover:bg-rose-600 whitespace-nowrap"
          >
            {anomalyOnly ? "全件表示" : "異常のみ表示"}
          </button>
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-md overflow-hidden">
        {/* フィルタ */}
        <div className="px-4 py-3 flex items-center gap-2 border-b border-slate-100 bg-slate-50">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="ユーザー・操作・対象で検索"
              className="w-72 pl-8 pr-3 py-1.5 text-[12px] bg-white border border-slate-200 rounded"
            />
          </div>
          <select
            value={userFilter}
            onChange={(e) => setUserFilter(e.target.value)}
            className="text-[11px] border border-slate-300 rounded px-2 py-1.5 bg-white"
          >
            <option value="all">全ユーザー</option>
            <option>サンプル</option>
            <option>サンプル 二郎</option>
            <option>サンプル 三郎</option>
            <option>サンプル 四郎</option>
            <option>システム</option>
          </select>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="text-[11px] border border-slate-300 rounded px-2 py-1.5 bg-white"
          >
            <option value="all">全操作種別</option>
            <option value="login">ログイン</option>
            <option value="view">参照</option>
            <option value="create">作成</option>
            <option value="edit">編集</option>
            <option value="delete">削除</option>
            <option value="send">送付</option>
            <option value="admin">管理操作</option>
            <option value="system">システム</option>
          </select>
          <select className="text-[11px] border border-slate-300 rounded px-2 py-1.5 bg-white">
            <option>過去24時間</option>
            <option>過去7日間</option>
            <option>過去30日間</option>
            <option>過去90日間（最大）</option>
          </select>
          <div className="ml-auto flex items-center gap-2 text-[11px] text-slate-500">
            <span>{filtered.length} / {LOG_ENTRIES.length} 件</span>
            <button className="px-2 py-1 border border-slate-300 rounded text-slate-700 hover:bg-slate-50 inline-flex items-center gap-1">
              <Download className="w-3 h-3" />
              CSV
              <span className="text-[9px] text-slate-400">(管理者承認必要)</span>
            </button>
          </div>
        </div>

        {/* ログテーブル */}
        <table className="w-full text-[12px]">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr className="text-left text-slate-600">
              <th className="px-4 py-2.5 font-medium">日時</th>
              <th className="px-4 py-2.5 font-medium">ユーザー</th>
              <th className="px-4 py-2.5 font-medium w-8"></th>
              <th className="px-4 py-2.5 font-medium">操作</th>
              <th className="px-4 py-2.5 font-medium">対象</th>
              <th className="px-4 py-2.5 font-medium">IP</th>
              <th className="px-4 py-2.5 font-medium">ハッシュ</th>
              <th className="px-4 py-2.5 font-medium w-8"></th>
            </tr>
          </thead>
          <tbody>
            {paged.map((l, i) => {
              const meta = TYPE_ICON[l.type];
              const Icon = meta?.icon || Activity;
              return (
                <tr
                  key={i}
                  className={`border-b border-slate-100 hover:bg-slate-50 ${
                    l.anomaly ? "bg-rose-50/40" : ""
                  }`}
                  title={l.anomaly ? l.anomalyReason : undefined}
                >
                  <td className="px-4 py-2.5 font-mono text-[11px] text-slate-600 whitespace-nowrap">
                    {l.time}
                  </td>
                  <td className="px-4 py-2.5 text-slate-800">
                    {l.user === "システム" ? (
                      <span className="text-[10px] font-medium px-1.5 py-0.5 bg-slate-200 text-slate-700 rounded">
                        SYS
                      </span>
                    ) : (
                      l.user
                    )}
                  </td>
                  <td className="px-4 py-2.5">
                    <Icon className={`w-3.5 h-3.5 ${meta?.color}`} />
                  </td>
                  <td className="px-4 py-2.5 text-slate-800">{l.action}</td>
                  <td className="px-4 py-2.5 font-mono text-[11px] text-slate-600">{l.target}</td>
                  <td className="px-4 py-2.5 font-mono text-[10px] text-slate-500">{l.ip}</td>
                  <td className="px-4 py-2.5 font-mono text-[10px] text-secure-dark">
                    <span className="inline-flex items-center gap-1">
                      <Fingerprint className="w-2.5 h-2.5" />
                      {l.hash}
                    </span>
                  </td>
                  <td className="px-4 py-2.5">
                    {l.anomaly && (
                      <span
                        className="inline-flex items-center justify-center w-5 h-5 bg-rose-500 text-white rounded-full"
                        title={l.anomalyReason}
                      >
                        <AlertTriangle className="w-3 h-3" />
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="px-4 py-12 text-center text-[12px] text-slate-400">
            該当するログはありません
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
    </div>
  );
}
