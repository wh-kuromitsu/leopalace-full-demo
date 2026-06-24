import React from "react";
import { Cloud, Sparkles } from "lucide-react";

export default function SalesforceSync() {
  return (
    <div className="p-5">
      <div className="bg-white border border-slate-200 rounded-md p-10 flex flex-col items-center justify-center text-center min-h-[480px]">
        {/* アイコン */}
        <div className="relative mb-6">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-sky-100 to-sky-200 flex items-center justify-center">
            <Cloud className="w-10 h-10 text-sky-600" />
          </div>
          <div className="absolute -top-1 -right-1 w-8 h-8 rounded-full bg-amber-400 flex items-center justify-center shadow-md">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
        </div>

        {/* Coming Soon */}
        <div className="text-[10px] font-bold tracking-[0.2em] text-amber-600 mb-2">
          COMING SOON
        </div>
        <h2 className="text-[24px] font-bold text-slate-900 mb-2">
          Salesforce 連携
        </h2>
        <p className="text-[13px] text-slate-600 max-w-md leading-relaxed">
          案件・顧客・活動履歴を Salesforce と双方向で連携する機能を
          <br />
          ご提供予定です。
        </p>
      </div>
    </div>
  );
}
