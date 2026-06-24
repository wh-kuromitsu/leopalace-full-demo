import React, { useMemo } from "react";
import {
  ClipboardList,
  Building2,
  Users,
  FileText,
  ArrowRight,
  Train,
  FileSpreadsheet,
} from "lucide-react";
import { CASES, WORKFLOW_STEPS, CASE_STATUSES, caseStatusBadge } from "../data/casesData";
import { CUSTOMERS } from "../data/customersData";
import { PROPERTIES } from "../data/propertiesData";

// ====================================================================
// シンプルダッシュボード
// ====================================================================
export default function Dashboard({ setCurrent }) {
  // KPI集計
  const stats = useMemo(() => {
    const activeCases = CASES.filter((c) => c.status === "active").length;
    const wonCases = CASES.filter((c) => c.status === "won").length;
    const customers = CUSTOMERS.length;
    const properties = PROPERTIES.length;
    return { activeCases, wonCases, customers, properties };
  }, []);

  // 最近の案件（更新が新しい順、最大5件）
  const recentCases = useMemo(() => {
    return [...CASES]
      .sort((a, b) => (b.receivedAt || "").localeCompare(a.receivedAt || ""))
      .slice(0, 5);
  }, []);

  return (
    <div className="p-5 space-y-4">
      {/* ヘッダ */}
      <div>
        <h1 className="text-[18px] font-bold text-slate-900">ダッシュボード</h1>
        <p className="text-[11px] text-slate-500 mt-0.5">案件・顧客・物件・提案の状況をひと目で確認できます</p>
      </div>

      {/* KPI カード（4つ） */}
      <div className="grid grid-cols-4 gap-3">
        <KpiCard
          icon={ClipboardList}
          color="brand"
          label="進行中の案件"
          value={stats.activeCases}
          unit="件"
          onClick={() => setCurrent?.("cases")}
        />
        <KpiCard
          icon={Users}
          color="emerald"
          label="顧客"
          value={stats.customers}
          unit="社"
          onClick={() => setCurrent?.("customers")}
        />
        <KpiCard
          icon={Building2}
          color="sky"
          label="登録物件"
          value={stats.properties}
          unit="件"
          onClick={() => setCurrent?.("properties")}
        />
        <KpiCard
          icon={FileText}
          color="amber"
          label="今月の成約"
          value={stats.wonCases}
          unit="件"
          onClick={() => setCurrent?.("cases")}
        />
      </div>

      {/* 2カラム：最近の案件 / 物件サンプル */}
      <div className="grid grid-cols-12 gap-3">
        {/* 最近の案件 */}
        <section className="col-span-7 bg-white border border-slate-200 rounded-md">
          <div className="px-4 py-2.5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ClipboardList className="w-3.5 h-3.5 text-brand" />
              <h2 className="text-[12px] font-bold text-slate-800">最近の案件</h2>
            </div>
            <button
              onClick={() => setCurrent?.("cases")}
              className="text-[10px] text-brand hover:text-brand-dark inline-flex items-center gap-0.5"
            >
              すべて見る
              <ArrowRight className="w-2.5 h-2.5" />
            </button>
          </div>
          <ul className="divide-y divide-slate-100">
            {recentCases.map((c) => {
              const status = CASE_STATUSES.find((s) => s.id === c.status);
              const step = WORKFLOW_STEPS.find((s) => s.key === c.currentStepKey);
              return (
                <li key={c.id}>
                  <button
                    onClick={() => setCurrent?.("cases")}
                    className="w-full px-4 py-2.5 hover:bg-slate-50 text-left transition"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] font-mono text-slate-500">{c.id}</span>
                          {status && (
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${caseStatusBadge(c.status)}`}>
                              {status.label}
                            </span>
                          )}
                          {step && (
                            <span className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-brand-light text-brand-dark">
                              STEP {step.order}/10
                            </span>
                          )}
                        </div>
                        <div className="text-[12px] font-bold text-slate-900 mt-0.5 truncate">{c.customerName}</div>
                        <div className="text-[10px] text-slate-500 mt-0.5">
                          {c.purpose} / {c.occupant} / 主担当: {c.mainAssignee}
                        </div>
                      </div>
                      <div className="flex-shrink-0 text-right">
                        <div className="text-[10px] text-slate-400">期限</div>
                        <div className="text-[11px] font-medium text-slate-700">{c.deadline}</div>
                      </div>
                    </div>
                    {/* 進捗バー */}
                    <div className="mt-1.5">
                      <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${c.progressPct >= 100 ? "bg-emerald-500" : c.progressPct >= 50 ? "bg-brand" : "bg-sky-400"}`}
                          style={{ width: `${c.progressPct}%` }}
                        />
                      </div>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>

        {/* 物件サンプル */}
        <section className="col-span-5 bg-white border border-slate-200 rounded-md">
          <div className="px-4 py-2.5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building2 className="w-3.5 h-3.5 text-sky-600" />
              <h2 className="text-[12px] font-bold text-slate-800">物件マスタ（最新）</h2>
            </div>
            <button
              onClick={() => setCurrent?.("properties")}
              className="text-[10px] text-brand hover:text-brand-dark inline-flex items-center gap-0.5"
            >
              すべて見る
              <ArrowRight className="w-2.5 h-2.5" />
            </button>
          </div>
          <ul className="divide-y divide-slate-100">
            {PROPERTIES.slice(0, 5).map((p) => (
              <li key={p.id}>
                <button
                  onClick={() => setCurrent?.("properties")}
                  className="w-full px-4 py-2.5 hover:bg-slate-50 text-left transition flex items-center gap-3"
                >
                  <div className="flex-shrink-0 w-10 h-10 rounded bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center">
                    <Building2 className="w-4 h-4 text-slate-500" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[12px] font-bold text-slate-900 truncate">{p.name}</div>
                    <div className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                      <Train className="w-2.5 h-2.5" />
                      {p.station}駅 徒歩{p.walkMin}分 / {p.layout}
                    </div>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <div className="text-[13px] font-bold text-rose-600">¥{(p.rent / 10000).toFixed(1)}万</div>
                    <div className="text-[9px] text-slate-500">/月</div>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* クイックアクション */}
      <div className="bg-white border border-slate-200 rounded-md p-4">
        <h2 className="text-[12px] font-bold text-slate-800 mb-3">クイックアクション</h2>
        <div className="grid grid-cols-4 gap-3">
          <QuickAction
            icon={FileSpreadsheet}
            label="提案資料を作成"
            desc="案件を選んでAIで観点抽出"
            onClick={() => setCurrent?.("proposal")}
            color="brand"
          />
          <QuickAction
            icon={ClipboardList}
            label="案件を新規登録"
            desc="新たな依頼を案件管理に登録"
            onClick={() => setCurrent?.("cases")}
            color="sky"
          />
          <QuickAction
            icon={Building2}
            label="物件を新規登録"
            desc="物件マスタに新規物件を追加"
            onClick={() => setCurrent?.("properties")}
            color="emerald"
          />
          <QuickAction
            icon={Users}
            label="顧客を新規登録"
            desc="顧客マスタに新規顧客を追加"
            onClick={() => setCurrent?.("customers")}
            color="amber"
          />
        </div>
      </div>
    </div>
  );
}

// KPIカードコンポーネント
function KpiCard({ icon: Icon, color, label, value, unit, onClick }) {
  const colorMap = {
    brand: { bg: "bg-brand-light", text: "text-brand-dark", icon: "text-brand" },
    emerald: { bg: "bg-emerald-50", text: "text-emerald-800", icon: "text-emerald-600" },
    sky: { bg: "bg-sky-50", text: "text-sky-800", icon: "text-sky-600" },
    amber: { bg: "bg-amber-50", text: "text-amber-800", icon: "text-amber-600" },
  };
  const c = colorMap[color] || colorMap.brand;

  return (
    <button
      onClick={onClick}
      className={`bg-white border border-slate-200 rounded-md p-4 text-left hover:shadow-md transition group`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className={`w-9 h-9 rounded ${c.bg} flex items-center justify-center`}>
          <Icon className={`w-4 h-4 ${c.icon}`} />
        </div>
        <ArrowRight className="w-3 h-3 text-slate-300 group-hover:text-slate-600" />
      </div>
      <div className="text-[10px] text-slate-500">{label}</div>
      <div className="flex items-baseline gap-1 mt-0.5">
        <span className="text-[26px] font-bold text-slate-900 leading-none">{value}</span>
        <span className="text-[10px] text-slate-500">{unit}</span>
      </div>
    </button>
  );
}

// クイックアクションコンポーネント
function QuickAction({ icon: Icon, label, desc, color, onClick }) {
  const colorMap = {
    brand: { bg: "bg-brand-light", text: "text-brand-dark", icon: "text-brand", border: "border-brand/20 hover:border-brand" },
    sky: { bg: "bg-sky-50", text: "text-sky-800", icon: "text-sky-600", border: "border-sky-200 hover:border-sky-400" },
    emerald: { bg: "bg-emerald-50", text: "text-emerald-800", icon: "text-emerald-600", border: "border-emerald-200 hover:border-emerald-400" },
    amber: { bg: "bg-amber-50", text: "text-amber-800", icon: "text-amber-600", border: "border-amber-200 hover:border-amber-400" },
  };
  const c = colorMap[color] || colorMap.brand;

  return (
    <button
      onClick={onClick}
      className={`p-3 border rounded text-left hover:bg-slate-50 transition group flex items-center gap-3 ${c.border}`}
    >
      <div className={`w-9 h-9 rounded ${c.bg} flex items-center justify-center flex-shrink-0`}>
        <Icon className={`w-4 h-4 ${c.icon}`} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[12px] font-bold text-slate-900">{label}</div>
        <div className="text-[10px] text-slate-500 truncate">{desc}</div>
      </div>
      <ArrowRight className="w-3 h-3 text-slate-300 group-hover:text-slate-600 flex-shrink-0" />
    </button>
  );
}
