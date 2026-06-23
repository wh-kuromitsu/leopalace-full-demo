import React, { useState } from "react";
import {
  Bell,
  Inbox,
  Clock,
  Settings as SettingsIcon,
  CheckCircle2,
  Check,
  Filter,
  UserCheck,
  ShieldCheck,
} from "lucide-react";
import { NOTIFICATIONS } from "../data/usersData";

const TYPE_META = {
  case_received: {
    label: "新規依頼",
    icon: Inbox,
    color: "bg-sky-100 text-sky-700",
  },
  deadline: {
    label: "期限",
    icon: Clock,
    color: "bg-amber-100 text-amber-700",
  },
  verification_needed: {
    label: "AI確認要請",
    icon: UserCheck,
    color: "bg-human-light text-human-dark",
  },
  system: {
    label: "システム",
    icon: SettingsIcon,
    color: "bg-slate-100 text-slate-600",
  },
  case_completed: {
    label: "成約",
    icon: CheckCircle2,
    color: "bg-emerald-100 text-emerald-700",
  },
  security: {
    label: "セキュリティ",
    icon: ShieldCheck,
    color: "bg-secure-light text-secure-dark",
  },
};

export default function Notifications() {
  const [filter, setFilter] = useState("all");
  const [items, setItems] = useState(NOTIFICATIONS);

  const filtered = items.filter((n) => {
    if (filter === "all") return true;
    if (filter === "unread") return n.unread;
    if (filter === "action") return n.requiresAction;
    if (filter === "high") return n.priorityByAi === "high";
    return n.type === filter;
  });

  const markAllRead = () =>
    setItems((prev) => prev.map((n) => ({ ...n, unread: false })));

  const markRead = (id) =>
    setItems((prev) =>
      prev.map((n) => (n.id === id ? { ...n, unread: false } : n))
    );

  const unreadCount = items.filter((n) => n.unread).length;
  const actionCount = items.filter((n) => n.requiresAction).length;

  return (
    <div className="p-5 max-w-4xl space-y-3">
      {/* ヘッダ */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[16px] font-bold text-slate-900 flex items-center gap-2">
            <Bell className="w-4 h-4" />
            通知
            {unreadCount > 0 && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 bg-rose-500 text-white rounded-full">
                {unreadCount}件未読
              </span>
            )}
            {actionCount > 0 && (
              <span className="inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 bg-human text-white rounded-full">
                <UserCheck className="w-2.5 h-2.5" />
                {actionCount}件要対応
              </span>
            )}
          </h2>
        </div>
        <button
          onClick={markAllRead}
          disabled={unreadCount === 0}
          className="px-3 py-1.5 text-[11px] border border-slate-300 rounded text-slate-700 hover:bg-slate-50 inline-flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Check className="w-3 h-3" />
          すべて既読にする
        </button>
      </div>

      {/* フィルタ */}
      <div className="bg-white border border-slate-200 rounded-md overflow-hidden">
        <div className="flex items-center gap-1 px-3 border-b border-slate-100 overflow-x-auto">
          {[
            { id: "all", label: "すべて" },
            { id: "action", label: "要対応", attention: true },
            { id: "unread", label: "未読のみ" },
            { id: "case_received", label: "新規依頼" },
            { id: "deadline", label: "期限" },
            { id: "security", label: "セキュリティ" },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setFilter(t.id)}
              className={`px-3 py-2.5 text-[12px] border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
                filter === t.id
                  ? "border-brand text-brand-dark font-bold"
                  : "border-transparent text-slate-600 hover:text-slate-900"
              }`}
            >
              {t.attention && <span className="w-1.5 h-1.5 rounded-full bg-human" />}
              {t.label}
            </button>
          ))}
          <button className="ml-auto px-2 py-1 text-[11px] text-slate-500 hover:text-slate-800 inline-flex items-center gap-1">
            <Filter className="w-3 h-3" />
            通知設定
          </button>
        </div>

        {/* リスト */}
        <ul className="divide-y divide-slate-100">
          {filtered.map((n) => {
            const meta = TYPE_META[n.type];
            const Icon = meta.icon;
            return (
              <li
                key={n.id}
                onClick={() => markRead(n.id)}
                className={`px-4 py-3 cursor-pointer hover:bg-slate-50 transition flex items-start gap-3 ${
                  n.unread ? "bg-sky-50/30" : ""
                }`}
              >
                <div className={`w-9 h-9 rounded flex items-center justify-center flex-shrink-0 ${meta.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] font-medium px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded">
                      {meta.label}
                    </span>
                    {n.requiresAction && (
                      <span className="inline-flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 bg-human text-white rounded font-bold">
                        <UserCheck className="w-2.5 h-2.5" />
                        要対応
                      </span>
                    )}
                    {n.unread && <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />}
                  </div>
                  <div className={`text-[13px] mt-1 ${
                    n.unread ? "font-bold text-slate-900" : "font-medium text-slate-700"
                  }`}>
                    {n.title}
                  </div>
                  <div className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                    {n.body}
                  </div>
                </div>
                <div className="text-[10px] text-slate-400 flex-shrink-0 whitespace-nowrap">
                  {n.time}
                </div>
              </li>
            );
          })}
          {filtered.length === 0 && (
            <li className="px-4 py-12 text-center text-[12px] text-slate-400">
              該当する通知はありません
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}
