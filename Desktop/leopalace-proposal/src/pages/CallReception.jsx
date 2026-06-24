import React, { useState, useEffect, useRef } from "react";
import {
  Phone, PhoneCall, PhoneOff, PhoneIncoming, Sparkles, Building2, ShieldCheck,
  Save, Clock, X, CheckCircle2, History,
} from "lucide-react";
import { CUSTOMERS } from "../data/customersData";
import { CASES } from "../data/casesData";

// 電話の主旨タイプ
const PURPOSE_TYPES = [
  "新規部屋探し依頼", "追加依頼", "進捗・状況確認", "条件変更", "内見・申込", "クレーム・問い合わせ", "その他",
];

// 着信シナリオ（番号→顧客はマスタ照合。発信者名は着信時のみ表示し記録は部署のみ）
const SCENARIOS = [
  { phone: "03-1234-5678", callerName: "サンプル 太郎", purpose: "新規部屋探し依頼",
    transcriptHint: "新卒社員5名分の社宅を板橋区周辺で。家賃8万円まで、4月入居希望。" },
  { phone: "03-2345-6789", callerName: "サンプル 花子", purpose: "進捗・状況確認",
    transcriptHint: "先日提案いただいた中台2の空室状況の確認。社内決裁が下りそう。" },
  { phone: "03-3456-7890", callerName: "サンプル 次郎", purpose: "条件変更",
    transcriptHint: "予算を7万円までに変更したい。駅徒歩も10分以内で再提案してほしい。" },
];

// AIによる電話メモ案の自動生成（モック）
function draftMemo(customer, sc) {
  const cust = customer?.companyName || "（未照合）";
  const dept = customer?.contactDepartment ? `${customer.contactDepartment}ご担当` : "ご担当窓口";
  const lines = {
    "新規部屋探し依頼": `【新規依頼】${cust}（${dept}）より、${sc.transcriptHint}\n・受付条件：エリア=板橋区周辺／賃料上限=8万円／間取り=1K／入居=2026/04\n・次アクション：条件をAI抽出し提案作成（STEP2）へ。`,
    "進捗・状況確認": `【進捗確認】${cust}（${dept}）より、${sc.transcriptHint}\n・対応：対象物件の最新空室をコアシステムで確認し、共有URLを再送予定。\n・次アクション：反響システムのステータスを更新。`,
    "条件変更": `【条件変更】${cust}（${dept}）より、${sc.transcriptHint}\n・変更後条件：賃料上限=7万円／駅徒歩=10分以内。\n・次アクション：条件を更新して再検索・再提案。`,
  };
  return lines[sc.purpose] || `【${sc.purpose}】${cust}（${dept}）より問い合わせ。\n・要旨：${sc.transcriptHint}\n・次アクション：担当にて対応。`;
}

export default function CallReception({ setCurrent }) {
  const [phase, setPhase] = useState("idle"); // idle → ringing → incall → memo
  const [scenario, setScenario] = useState(null);
  const [seconds, setSeconds] = useState(0);
  const [memo, setMemo] = useState("");
  const [purpose, setPurpose] = useState(PURPOSE_TYPES[0]);
  const [log, setLog] = useState([]);
  const timerRef = useRef(null);

  const customer = scenario ? CUSTOMERS.find((c) => c.headPhone === scenario.phone) : null;
  const custCases = customer ? CASES.filter((cs) => cs.customerId === customer.id) : [];

  useEffect(() => {
    if (phase === "incall") {
      timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
      return () => clearInterval(timerRef.current);
    }
  }, [phase]);

  const simulateCall = () => {
    const sc = SCENARIOS[Math.floor(Math.random() * SCENARIOS.length)];
    setScenario(sc); setSeconds(0); setPhase("ringing");
  };
  const answer = () => setPhase("incall");
  const decline = () => { setPhase("idle"); setScenario(null); };
  const endCall = () => {
    setMemo(draftMemo(customer, scenario));
    setPurpose(scenario.purpose);
    setPhase("memo");
  };
  const saveMemo = () => {
    setLog((l) => [{
      id: `CALL-${Date.now()}`,
      company: customer?.companyName || "未照合",
      dept: customer?.contactDepartment || "—",
      purpose, memo, duration: seconds,
      at: new Date().toLocaleString("ja-JP"),
    }, ...l]);
    setPhase("idle"); setScenario(null); setSeconds(0); setMemo("");
  };

  const mmss = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  return (
    <div className="p-5 space-y-3">
      <div className="bg-white border border-slate-200 rounded-md px-4 py-3 flex items-center justify-between">
        <div>
          <h2 className="text-[15px] font-bold text-slate-900 flex items-center gap-2">
            <Phone className="w-4 h-4 text-brand" />
            電話受電（CTI）
          </h2>
          <p className="text-[11px] text-slate-500 mt-0.5">着信時に発信者を顧客マスタと照合し、通話後はAIが電話メモ案を作成。担当者が手修正して保存します。</p>
        </div>
        {phase === "idle" && (
          <button onClick={simulateCall} className="px-4 py-2 text-[12px] font-bold text-white rounded bg-emerald-600 hover:bg-emerald-700 inline-flex items-center gap-1">
            <PhoneIncoming className="w-4 h-4" />着信をシミュレート
          </button>
        )}
      </div>

      {/* 待受 */}
      {phase === "idle" && (
        <div className="bg-white border border-slate-200 rounded-md p-10 text-center">
          <Phone className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <div className="text-[13px] font-bold text-slate-700">着信待機中</div>
          <div className="text-[11px] text-slate-500 mt-1">「着信をシミュレート」で受電フローを確認できます。</div>
        </div>
      )}

      {/* 着信中 */}
      {phase === "ringing" && scenario && (
        <div className="bg-white border-2 border-emerald-300 rounded-md p-6 text-center animate-pulse-soft">
          <PhoneIncoming className="w-10 h-10 text-emerald-500 mx-auto mb-2 animate-bounce" />
          <div className="text-[11px] text-slate-500">着信中…</div>
          <div className="text-[16px] font-mono font-bold text-slate-900 mt-1">{scenario.phone}</div>
          <CallerCard customer={customer} callerName={scenario.callerName} custCases={custCases} />
          <div className="flex items-center justify-center gap-3 mt-4">
            <button onClick={decline} className="px-5 py-2 text-[12px] font-bold text-white rounded-full bg-rose-500 hover:bg-rose-600 inline-flex items-center gap-1"><PhoneOff className="w-4 h-4" />拒否</button>
            <button onClick={answer} className="px-5 py-2 text-[12px] font-bold text-white rounded-full bg-emerald-600 hover:bg-emerald-700 inline-flex items-center gap-1"><PhoneCall className="w-4 h-4" />応答</button>
          </div>
        </div>
      )}

      {/* 通話中 */}
      {phase === "incall" && scenario && (
        <div className="bg-white border border-slate-200 rounded-md p-6">
          <div className="flex items-center justify-between">
            <div className="text-[12px] font-bold text-emerald-700 inline-flex items-center gap-1"><PhoneCall className="w-4 h-4" />通話中</div>
            <div className="text-[14px] font-mono font-bold text-slate-900 inline-flex items-center gap-1"><Clock className="w-4 h-4 text-slate-400" />{mmss(seconds)}</div>
          </div>
          <CallerCard customer={customer} callerName={scenario.callerName} custCases={custCases} />
          <div className="mt-3 text-[10px] text-slate-400">※ AIが会話内容を要約し、通話終了後にメモ案を作成します。</div>
          <div className="text-right mt-4">
            <button onClick={endCall} className="px-5 py-2 text-[12px] font-bold text-white rounded bg-rose-500 hover:bg-rose-600 inline-flex items-center gap-1"><PhoneOff className="w-4 h-4" />通話終了</button>
          </div>
        </div>
      )}

      {/* 通話後：AIメモ案 → 手修正 */}
      {phase === "memo" && scenario && (
        <div className="bg-white border border-slate-200 rounded-md p-5">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-ai" />
            <h3 className="text-[13px] font-bold text-slate-800">電話メモ案（AI作成）</h3>
            <span className="text-[10px] text-slate-500">通話時間 {mmss(seconds)}。内容を確認し、必要に応じて手修正してください。</span>
          </div>
          <CallerCard customer={customer} callerName={scenario.callerName} custCases={custCases} compact />

          <label className="text-[11px] font-bold text-slate-700 block mt-3 mb-1">電話の主旨タイプ</label>
          <div className="flex flex-wrap gap-1.5">
            {PURPOSE_TYPES.map((t) => (
              <button key={t} onClick={() => setPurpose(t)} className={`text-[11px] px-2.5 py-1 rounded-full border ${purpose === t ? "bg-brand text-white border-brand" : "bg-white text-slate-600 border-slate-300 hover:border-brand"}`}>{t}</button>
            ))}
          </div>

          <label className="text-[11px] font-bold text-slate-700 block mt-3 mb-1">メモ本文（手修正可）</label>
          <textarea value={memo} onChange={(e) => setMemo(e.target.value)} rows={6} className="w-full px-3 py-2 border border-slate-300 rounded text-[12px] leading-relaxed" />

          <div className="flex items-center justify-between mt-3">
            {(purpose === "新規部屋探し依頼" || purpose === "条件変更") && (
              <button onClick={() => setCurrent && setCurrent("proposal")} className="px-3 py-1.5 text-[11px] border border-brand text-brand rounded hover:bg-brand-light inline-flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />このメモから提案作成へ
              </button>
            )}
            <div className="ml-auto flex gap-2">
              <button onClick={() => { setPhase("idle"); setScenario(null); }} className="px-3 py-1.5 text-[12px] border border-slate-300 rounded text-slate-700">破棄</button>
              <button onClick={saveMemo} className="px-4 py-1.5 text-[12px] font-bold text-white rounded bg-brand hover:bg-brand-dark inline-flex items-center gap-1"><Save className="w-3.5 h-3.5" />保存して終了</button>
            </div>
          </div>
        </div>
      )}

      {/* 受電履歴 */}
      <div className="bg-white border border-slate-200 rounded-md overflow-hidden">
        <div className="px-4 py-2.5 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
          <History className="w-3.5 h-3.5 text-slate-600" />
          <h3 className="text-[12px] font-bold text-slate-800">受電履歴（{log.length}）</h3>
          <span className="text-[10px] text-slate-400 ml-1">保存される記録は法人名・部署・主旨・メモのみ（発信者個人名は記録しません）</span>
        </div>
        {log.length ? (
          <ul className="divide-y divide-slate-100">
            {log.map((r) => (
              <li key={r.id} className="px-4 py-2.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-[12px] font-bold text-slate-800">{r.company}</span>
                  <span className="text-[10px] text-slate-500">{r.dept}</span>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-brand-light text-brand-dark">{r.purpose}</span>
                  <span className="text-[10px] text-slate-400 ml-auto">{r.at}・通話 {mmss(r.duration)}</span>
                </div>
                <div className="text-[11px] text-slate-600 mt-1 whitespace-pre-wrap pl-5">{r.memo}</div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="px-4 py-6 text-center text-[11px] text-slate-400">受電履歴はまだありません</div>
        )}
      </div>
    </div>
  );
}

// 発信者照合カード
function CallerCard({ customer, callerName, custCases, compact }) {
  return (
    <div className={`mt-3 mx-auto ${compact ? "" : "max-w-md"} bg-slate-50 border border-slate-200 rounded-md p-3 text-left`}>
      {customer ? (
        <>
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-brand" />
            <span className="text-[14px] font-bold text-slate-900">{customer.companyName}</span>
            <span className="text-[10px] text-slate-500">{customer.industry}</span>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 mt-2 text-[11px]">
            <div><span className="text-slate-500">発信者：</span>{callerName}<span className="text-[9px] text-slate-400">（着信時のみ表示）</span></div>
            <div><span className="text-slate-500">担当窓口：</span>{customer.contactDepartment} {customer.contactTitle}</div>
            <div><span className="text-slate-500">顧客ID：</span><span className="font-mono text-[10px]">{customer.id}</span></div>
            <div><span className="text-slate-500">代表電話：</span>{customer.headPhone}</div>
          </div>
          {custCases.length > 0 && (
            <div className="mt-2 pt-2 border-t border-slate-200">
              <div className="text-[10px] text-slate-500 mb-0.5">直近の案件</div>
              {custCases.slice(0, 2).map((cs) => (
                <div key={cs.id} className="text-[10.5px] text-slate-700">・{cs.purpose}<span className="text-[9px] text-slate-400 ml-1">({cs.id})</span></div>
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="text-[11px] text-slate-500">発信者は顧客マスタに未登録です。新規顧客として受付してください。</div>
      )}
    </div>
  );
}
