import React from "react";
import {
  Clock,
  ChevronRight,
  User,
  Sparkles,
  AlertTriangle,
  UserCheck,
  Lock,
} from "lucide-react";
import { CASES } from "../data/casesData";

const statusTone = {
  warning: "bg-amber-50 text-amber-700 border-amber-200",
  primary: "bg-sky-50 text-sky-700 border-sky-200",
  success: "bg-emerald-50 text-emerald-700 border-emerald-200",
  default: "bg-slate-100 text-slate-700 border-slate-200",
};

// AI緊急度スコアを赤/黄/緑にマップ
function urgencyClass(score) {
  if (score >= 80) return { color: "bg-rose-500", label: "高", text: "text-rose-600" };
  if (score >= 50) return { color: "bg-amber-500", label: "中", text: "text-amber-600" };
  return { color: "bg-emerald-500", label: "低", text: "text-emerald-600" };
}

export default function PendingCasesPanel({ onOpenCase }) {
  const pending = CASES.filter(
    (c) => c.status !== "成約" && c.status !== "提案完了"
  );

  return (
    <div className="bg-white border border-slate-200 rounded-md">
      <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-[13px] font-bold text-slate-800">
            進行中の案件
          </h3>
          <span className="text-[10px] px-1.5 py-0.5 bg-rose-100 text-rose-700 rounded-full font-bold">
            {pending.length}
          </span>
        </div>
        <button className="text-[11px] text-sky-600 hover:underline">
          すべて見る →
        </button>
      </div>

      <ul className="divide-y divide-slate-100">
        {pending.map((c) => {
          const urgency = urgencyClass(c.aiUrgencyScore);
          const isUnverified = !c.humanVerified?.verified;
          const isUnassigned = c.assignee === "未割当";
          return (
            <li
              key={c.id}
              onClick={() => onOpenCase && onOpenCase(c.id)}
              className="px-4 py-3 hover:bg-slate-50 cursor-pointer transition group"
            >
              <div className="flex items-start gap-3">
                {/* 緊急度ゲージ */}
                <div
                  className="w-1 self-stretch rounded-full"
                  style={{ minHeight: "60px" }}
                  title={`AI緊急度: ${c.aiUrgencyScore}/100`}
                >
                  <div className={`${urgency.color} w-full h-full rounded-full`} />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span
                      className={`text-[10px] font-medium px-1.5 py-0.5 rounded border ${
                        statusTone[c.statusTone]
                      }`}
                    >
                      {c.status}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {c.id}
                    </span>
                    {/* 機密度 */}
                    {c.securityLevel === "confidential" && (
                      <span
                        className="inline-flex items-center gap-0.5 text-[9px] font-bold px-1 py-0.5 bg-rose-50 text-rose-700 border border-rose-200 rounded"
                        title="社外秘"
                      >
                        <Lock className="w-2 h-2" />
                        社外秘
                      </span>
                    )}
                    {/* AI分類タグ（先頭1つ） */}
                    {c.aiClassification && (
                      <span
                        className="inline-flex items-center gap-0.5 text-[9px] font-medium px-1 py-0.5 bg-ai-light text-ai-dark border border-ai/20 rounded"
                        title={`AIによる自動分類（確信度 ${Math.round(c.aiClassification.confidence * 100)}%）`}
                      >
                        <Sparkles className="w-2 h-2" />
                        {c.aiClassification.category}
                      </span>
                    )}
                  </div>

                  <div className="text-[13px] font-bold text-slate-900 mt-1 truncate">
                    {c.customerName}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {c.purpose} ・ {c.occupant}
                  </div>

                  <div className="flex items-center gap-3 mt-1.5 text-[10px] flex-wrap">
                    <span className="flex items-center gap-1 text-slate-500">
                      <User className="w-3 h-3" />
                      {isUnassigned ? (
                        <span className="text-rose-600 font-bold">{c.assignee}</span>
                      ) : (
                        c.assignee
                      )}
                    </span>
                    <span
                      className={`flex items-center gap-1 ${
                        urgency.label === "高"
                          ? "text-rose-600 font-bold"
                          : "text-slate-500"
                      }`}
                    >
                      <Clock className="w-3 h-3" />
                      期限: {c.deadline}
                    </span>
                  </div>

                  {/* AI自動アサイン提案 */}
                  {isUnassigned && c.aiSuggestedAssignee && (
                    <div className="mt-2 bg-ai-light/50 border border-ai/20 rounded p-2 flex items-start gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-ai mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-[10px] font-bold text-ai-dark">
                          AI担当推薦：{c.aiSuggestedAssignee.name}
                        </div>
                        <div className="text-[9px] text-slate-600">
                          {c.aiSuggestedAssignee.reason}
                        </div>
                      </div>
                      <button
                        onClick={(e) => e.stopPropagation()}
                        className="text-[9px] px-1.5 py-0.5 bg-ai text-white rounded font-medium hover:bg-ai-dark"
                      >
                        承認
                      </button>
                    </div>
                  )}

                  {/* AI抽出を未確認の警告 */}
                  {isUnverified && c.channel.includes("PDF") && !isUnassigned && (
                    <div className="mt-2 bg-human-light border border-human/20 rounded p-2 flex items-center gap-2">
                      <AlertTriangle className="w-3.5 h-3.5 text-human flex-shrink-0" />
                      <div className="flex-1 text-[10px] text-human-dark">
                        AI抽出結果が未確認です。送付前にご確認ください。
                      </div>
                      <UserCheck className="w-3 h-3 text-human" />
                    </div>
                  )}
                </div>

                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-600 flex-shrink-0 mt-1" />
              </div>
            </li>
          );
        })}
      </ul>

      {pending.length === 0 && (
        <div className="px-4 py-8 text-center text-[12px] text-slate-400">
          進行中の案件はありません
        </div>
      )}
    </div>
  );
}
