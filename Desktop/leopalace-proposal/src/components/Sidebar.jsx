import React, { useState } from "react";
import {
  Home,
  ClipboardList,
  FilePlus,
  Users,
  Phone,
  Inbox,
  Building2,
  FileText,
  LayoutTemplate,
  Cloud,
  Bell,
  Activity,
  Settings,
  ChevronsUpDown,
  Check,
  MapPin,
  ExternalLink,
  Cloud as CloudIcon,
} from "lucide-react";
import { TENANTS, DEFAULT_TENANT_ID } from "../data/tenantsData";
// fix

const NAV = [
  // { id: "dashboard", label: "ダッシュボード", icon: Home, group: "main" },
  { id: "cases", label: "案件管理", icon: ClipboardList, group: "main", badge: 8, attention: 2 },
  { id: "proposal", label: "提案作成", icon: FilePlus, group: "main" },
  // { id: "crm", label: "潜在顧客管理(CRM)", icon: Users, group: "main" },
  // { id: "call", label: "電話受電(CTI)", icon: Phone, group: "main" },
  // { id: "inbox", label: "メッセージ受信", icon: Inbox, group: "main" },
  { id: "customers", label: "顧客", icon: Users, group: "master" },
  { id: "properties", label: "物件", icon: Building2, group: "master" },
  { id: "history", label: "提案資料履歴", icon: FileText, group: "output" },
  // { id: "reaction", label: "反響システム", icon: CloudIcon, group: "output" },
  { id: "templates", label: "テンプレート", icon: LayoutTemplate, group: "output" },
  // { id: "salesforce", label: "Salesforce連携", icon: Cloud, group: "system", soon: true },
  // { id: "notifications", label: "通知", icon: Bell, group: "system", badge: 4, attention: 3 },
  { id: "logs", label: "操作ログ", icon: Activity, group: "system", adminOnly: false },
  { id: "settings", label: "設定", icon: Settings, group: "system" },
  // { id: "recipient", label: "受取側プレビュー", icon: ExternalLink, group: "demo" },
];

const GROUPS = {
  main: "業務",
  master: "マスタ管理",
  output: "出力",
  system: "システム",
  // demo: "デモ（受取側）",
};

export default function Sidebar({ current, setCurrent }) {
  const grouped = Object.keys(GROUPS).map((g) => ({
    key: g,
    label: GROUPS[g],
    items: NAV.filter((n) => n.group === g),
  }));

  const [tenantId, setTenantId] = useState(DEFAULT_TENANT_ID);
  const [tenantOpen, setTenantOpen] = useState(false);
  const tenant = TENANTS.find((t) => t.id === tenantId) || TENANTS[0];

  return (
    <aside className="w-[220px] bg-white border-r border-slate-200 flex-shrink-0 flex flex-col relative">
      {/* テナント切替（ロゴ兼用） */}
      <div className="px-2 py-2 border-b border-slate-100 relative">
        <button
          onClick={() => setTenantOpen((v) => !v)}
          className="w-full px-2 py-2 rounded hover:bg-slate-50 flex items-center gap-2 transition group"
        >
          <div
            className="w-8 h-8 rounded-sm flex items-center justify-center text-white font-black text-sm flex-shrink-0"
            style={{ backgroundColor: tenant.color }}
          >
            {tenant.iconText}
          </div>
          <div className="leading-tight min-w-0 flex-1 text-left">
            <div className="text-[12px] font-bold tracking-tight text-slate-900 truncate">
              {tenant.name}
            </div>
            <div className="text-[9px] text-slate-500 -mt-0.5 truncate">
              {tenant.description}
            </div>
          </div>
          <ChevronsUpDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700 flex-shrink-0" />
        </button>

        {/* テナント切替ドロップダウン */}
        {tenantOpen && (
          <>
            {/* オーバーレイ（クリックで閉じる） */}
            <div
              onClick={() => setTenantOpen(false)}
              className="fixed inset-0 z-20"
            />
            <div className="absolute left-2 right-2 top-full mt-1 bg-white border border-slate-200 rounded-md shadow-xl z-30 overflow-hidden">
              <div className="px-3 py-2 border-b border-slate-100 bg-slate-50">
                <div className="text-[10px] font-bold text-slate-500 tracking-wider">
                  テナント切り替え
                </div>
                <div className="text-[9px] text-slate-400 mt-0.5">
                  {TENANTS.length} 件の組織から選択
                </div>
              </div>
              <ul className="max-h-80 overflow-y-auto">
                {TENANTS.map((t) => {
                  const active = t.id === tenantId;
                  return (
                    <li key={t.id}>
                      <button
                        onClick={() => {
                          setTenantId(t.id);
                          setTenantOpen(false);
                        }}
                        className={`w-full px-3 py-2 flex items-center gap-2 hover:bg-slate-50 transition text-left ${
                          active ? "bg-brand-light/50" : ""
                        }`}
                      >
                        <div
                          className="w-7 h-7 rounded-sm flex items-center justify-center text-white font-black text-[11px] flex-shrink-0"
                          style={{ backgroundColor: t.color }}
                        >
                          {t.iconText}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[12px] font-bold text-slate-900 truncate">
                            {t.name}
                          </div>
                          <div className="text-[9px] text-slate-500 flex items-center gap-0.5 mt-0.5">
                            <MapPin className="w-2.5 h-2.5" />
                            {t.region}
                          </div>
                        </div>
                        {active && (
                          <Check className="w-3.5 h-3.5 text-brand flex-shrink-0" />
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          </>
        )}
      </div>

      {/* ナビ */}
      <nav className="flex-1 overflow-y-auto py-2">
        {grouped.map((g) => (
          <div key={g.key} className="mb-3">
            <div className="px-4 text-[10px] font-bold text-slate-400 mb-1 tracking-wider">
              {g.label}
            </div>
            <ul>
              {g.items.map((item) => {
                const Icon = item.icon;
                const active = current === item.id;
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => setCurrent(item.id)}
                      className={`w-full flex items-center gap-2.5 px-4 py-2 text-[12.5px] transition-all relative
                        ${
                          active
                            ? "bg-sky-50 text-brand-dark font-bold"
                            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                        }`}
                    >
                      {active && (
                        <span className="absolute left-0 top-0 bottom-0 w-1 bg-brand" />
                      )}
                      <Icon
                        className={`w-4 h-4 ${
                          active ? "text-brand" : "text-slate-400"
                        }`}
                      />
                      <span className="flex-1 text-left">{item.label}</span>
                      {/* 人間判断（要対応）ドット */}
                      {item.attention > 0 && (
                        <span
                          className="w-2 h-2 rounded-full bg-human attention-dot"
                          title={`要対応 ${item.attention}件`}
                        />
                      )}
                      {/* 件数バッジ */}
                      {item.badge && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 bg-slate-200 text-slate-700 rounded-full">
                          {item.badge}
                        </span>
                      )}
                      {/* v2予定マーク */}
                      {item.soon && (
                        <span className="text-[8px] font-bold px-1 py-0.5 bg-slate-200 text-slate-600 rounded">
                          v2
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* セッション情報 */}
      <div className="px-4 py-2 border-t border-slate-100 text-[9px] text-slate-400">
        <div>Leopalace Corporate Proposal</div>
      </div>
    </aside>
  );
}
