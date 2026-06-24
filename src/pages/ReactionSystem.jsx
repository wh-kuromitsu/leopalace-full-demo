import React, { useState, useEffect } from "react";
import { Cloud, CheckCircle2, RefreshCw, Home } from "lucide-react";
import { getReactionRecords, subscribeReactions, updateReactionStatus, REACTION_STATUSES } from "../data/reactionStore";

const STATUS_STYLE = {
  "新規反響登録": "bg-slate-100 text-slate-700 border-slate-300",
  "提案中": "bg-amber-100 text-amber-700 border-amber-300",
  "成約済み": "bg-emerald-100 text-emerald-700 border-emerald-300",
};

export default function ReactionSystem() {
  const [records, setRecords] = useState(getReactionRecords());
  useEffect(() => subscribeReactions(setRecords), []);

  const counts = REACTION_STATUSES.reduce((acc, s) => {
    acc[s] = records.filter((r) => r.status === s).length;
    return acc;
  }, {});
  const contracted = records.filter((r) => r.status === "成約済み");

  return (
    <div className="p-5 space-y-3">
      <div className="bg-white border border-slate-200 rounded-md px-4 py-3">
        <h2 className="text-[15px] font-bold text-slate-900 flex items-center gap-2">
          <Cloud className="w-4 h-4 text-sky-600" />
          反響システム連携
        </h2>
        <p className="text-[11px] text-slate-500 mt-0.5">
          統合システムから連携された案件の進捗ステータスを管理・更新できます。提案メールを送信すると自動で「提案中」として登録されます。
        </p>
      </div>

      {/* ステータスサマリ */}
      <div className="grid grid-cols-4 gap-3">
        {REACTION_STATUSES.map((s) => (
          <div key={s} className="bg-white border border-slate-200 rounded-md p-3 text-center">
            <div className="text-[10px] text-slate-500">{s}</div>
            <div className="text-[22px] font-bold text-slate-900 mt-0.5">{counts[s]}</div>
          </div>
        ))}
        <div className="bg-white border border-slate-200 rounded-md p-3 text-center">
          <div className="text-[10px] text-slate-500">成約物件</div>
          <div className="text-[22px] font-bold text-emerald-600 mt-0.5">{contracted.length}</div>
        </div>
      </div>

      {/* 案件一覧 */}
      <div className="bg-white border border-slate-200 rounded-md overflow-hidden">
        <div className="px-4 py-2.5 border-b border-slate-100 bg-slate-50">
          <h3 className="text-[12px] font-bold text-slate-800">連携案件（{records.length}）</h3>
        </div>
        <table className="w-full text-[11px]">
          <thead className="bg-slate-50 text-slate-500 border-b border-slate-100">
            <tr>
              <th className="px-3 py-2 text-left font-medium">反響ID</th>
              <th className="px-3 py-2 text-left font-medium">案件ID</th>
              <th className="px-3 py-2 text-left font-medium">顧客</th>
              <th className="px-3 py-2 text-left font-medium">提案数</th>
              <th className="px-3 py-2 text-left font-medium">ステータス</th>
              <th className="px-3 py-2 text-left font-medium">成約物件</th>
              <th className="px-3 py-2 text-left font-medium">更新</th>
              <th className="px-3 py-2 text-left font-medium">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {records.map((r) => (
              <tr key={r.id} className="hover:bg-slate-50">
                <td className="px-3 py-2 font-mono text-[10px] text-slate-600">{r.id}</td>
                <td className="px-3 py-2 font-mono text-[10px] text-slate-600">{r.caseId}</td>
                <td className="px-3 py-2 text-slate-800">{r.customerName}</td>
                <td className="px-3 py-2 text-slate-700">{r.properties}件</td>
                <td className="px-3 py-2">
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${STATUS_STYLE[r.status]}`}>{r.status}</span>
                </td>
                <td className="px-3 py-2 text-slate-700">{r.contractedProperty || "—"}</td>
                <td className="px-3 py-2 text-[10px] text-slate-500">{r.updatedAt}</td>
                <td className="px-3 py-2">
                  <select
                    value={r.status}
                    onChange={(e) => {
                      const ns = e.target.value;
                      const cp = ns === "成約済み" && !r.contractedProperty ? "（成約物件を選択）" : r.contractedProperty;
                      updateReactionStatus(r.id, ns, cp);
                    }}
                    className="text-[10px] border border-slate-300 rounded px-1.5 py-1"
                  >
                    {REACTION_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 成約物件一覧 */}
      <div className="bg-white border border-slate-200 rounded-md overflow-hidden">
        <div className="px-4 py-2.5 border-b border-slate-100 bg-emerald-50/60 flex items-center gap-2">
          <Home className="w-3.5 h-3.5 text-emerald-600" />
          <h3 className="text-[12px] font-bold text-emerald-800">成約物件（{contracted.length}）</h3>
        </div>
        {contracted.length > 0 ? (
          <ul className="divide-y divide-slate-100">
            {contracted.map((r) => (
              <li key={r.id} className="px-4 py-2.5 flex items-center gap-2 text-[11px]">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span className="font-bold text-slate-800">{r.contractedProperty || "（物件未設定）"}</span>
                <span className="text-slate-500">／ {r.customerName}</span>
                <span className="text-[10px] text-slate-400 ml-auto">{r.updatedAt}</span>
              </li>
            ))}
          </ul>
        ) : (
          <div className="px-4 py-6 text-center text-[11px] text-slate-400">成約物件はまだありません</div>
        )}
      </div>
    </div>
  );
}
