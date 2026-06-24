import React, { useState } from "react";
import {
  HelpCircle,
  Bell,
  ChevronDown,
  ShieldCheck,
  Lock,
  Fingerprint,
  LogOut,
  Settings as SettingsIcon,
  Globe,
} from "lucide-react";
import { CURRENT_USER } from "../data/usersData";

const PAGE_TITLES = {
  dashboard: "ダッシュボード",
  cases: "案件管理",
  proposal: "提案作成",
  customers: "顧客マスタ",
  properties: "物件マスタ",
  history: "提案資料履歴",
  templates: "テンプレート管理",
  salesforce: "Salesforce連携",
  notifications: "通知",
  logs: "操作ログ",
  settings: "設定",
};

export default function Header({ current, setCurrent }) {
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
      <div className="px-5 h-14 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-[16px] font-bold text-slate-900">
            {PAGE_TITLES[current] || "—"}
          </h1>
          <div className="text-[11px] text-slate-400">
            最終更新：2026/05/13 13:42
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className="w-8 h-8 inline-flex items-center justify-center rounded hover:bg-slate-100 text-slate-600">
            <HelpCircle className="w-4 h-4" />
          </button>

          <button
            onClick={() => setCurrent && setCurrent("notifications")}
            className="w-8 h-8 inline-flex items-center justify-center rounded hover:bg-slate-100 text-slate-600 relative"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1 right-1 w-3.5 h-3.5 text-[9px] bg-rose-500 text-white rounded-full flex items-center justify-center">
              4
            </span>
          </button>

          <div className="h-7 w-px bg-slate-200" />

          {/* ユーザーアバター + Azure ADドロップダウン */}
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen((v) => !v)}
              className="flex items-center gap-2 px-2 py-1 rounded hover:bg-slate-100"
            >
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-sky-400 to-sky-600 text-white text-[11px] font-bold flex items-center justify-center relative">
                {CURRENT_USER.avatar}
                {/* MFA 認証済バッジ */}
                <span
                  className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-secure border border-white flex items-center justify-center"
                  title="MFA認証済み"
                >
                  <Fingerprint className="w-2 h-2 text-white" />
                </span>
              </div>
              <div className="text-left leading-tight">
                <div className="text-[12px] font-medium text-slate-800">
                  {CURRENT_USER.name}
                </div>
                <div className="text-[10px] text-slate-500">
                  {CURRENT_USER.department}
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {/* ドロップダウン */}
            {userMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setUserMenuOpen(false)}
                />
                <div className="absolute right-0 top-full mt-1 w-80 bg-white border border-slate-200 rounded-md shadow-xl z-50">
                  {/* プロフィール */}
                  <div className="p-4 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-sky-400 to-sky-600 text-white text-[14px] font-bold flex items-center justify-center">
                        {CURRENT_USER.avatar}
                      </div>
                      <div className="min-w-0">
                        <div className="text-[14px] font-bold text-slate-900">
                          {CURRENT_USER.name}
                        </div>
                        <div className="text-[10px] text-slate-500 truncate font-mono">
                          {CURRENT_USER.email}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {CURRENT_USER.department} / {CURRENT_USER.office}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-3">
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-secure-light text-secure-dark border border-secure/20 rounded text-[10px] font-medium">
                        <Lock className="w-2.5 h-2.5" />
                        SSO
                      </span>
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-secure-light text-secure-dark border border-secure/20 rounded text-[10px] font-medium">
                        <Fingerprint className="w-2.5 h-2.5" />
                        MFA 有効
                      </span>
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-slate-100 text-slate-600 border border-slate-200 rounded text-[10px] font-medium">
                        {CURRENT_USER.role}
                      </span>
                    </div>
                  </div>

                  {/* 認証セッション情報 */}
                  <div className="p-4 border-b border-slate-100 bg-secure-light/30">
                    <div className="text-[10px] font-bold text-secure-dark mb-2 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" />
                      認証セッション
                    </div>
                    <div className="space-y-1.5 text-[11px]">
                      <div className="flex justify-between">
                        <span className="text-slate-500">ログイン時刻</span>
                        <span className="text-slate-800">
                          {CURRENT_USER.session.startedAt.split(" ")[1]}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">IPアドレス</span>
                        <span className="text-slate-800 font-mono">
                          {CURRENT_USER.session.ipAddress}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">デバイス</span>
                        <span className="text-slate-800 text-[10px]">
                          {CURRENT_USER.session.device}
                        </span>
                      </div>
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-slate-500 flex-shrink-0">
                          <Globe className="w-2.5 h-2.5 inline" /> 接続元
                        </span>
                        <span className="text-slate-800 text-right text-[10px]">
                          {CURRENT_USER.session.location}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* メニュー */}
                  <div className="p-1.5">
                    <button
                      onClick={() => {
                        setCurrent && setCurrent("settings");
                        setUserMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-[12px] text-slate-700 hover:bg-slate-50 rounded"
                    >
                      <SettingsIcon className="w-3.5 h-3.5 text-slate-400" />
                      アカウント設定
                    </button>
                    <button className="w-full flex items-center gap-2 px-3 py-2 text-[12px] text-rose-600 hover:bg-rose-50 rounded">
                      <LogOut className="w-3.5 h-3.5" />
                      ログアウト
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
