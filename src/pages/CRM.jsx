import React, { useState } from "react";
import {
  Users, Building2, Sparkles, CalendarClock, TrendingUp, Star, Eye,
  Send, X, Mail, MessageSquare, MessageCircle, ShieldCheck,
} from "lucide-react";
import { CORPORATE_LEADS, INDIVIDUAL_LEADS } from "../data/crmData";

const CHANNELS = [
  { id: "mail", label: "メール", icon: Mail },
  { id: "sms", label: "SMS", icon: MessageSquare },
  { id: "chat", label: "チャット", icon: MessageCircle },
];

export default function CRM({ setCurrent }) {
  const [tab, setTab] = useState("corp");
  const [composeLead, setComposeLead] = useState(null);

  return (
    <div className="p-5 space-y-3">
      <div className="bg-white border border-slate-200 rounded-md px-4 py-3">
        <h2 className="text-[15px] font-bold text-slate-900 flex items-center gap-2">
          <Users className="w-4 h-4 text-brand" />
          潜在顧客管理（CRM）
        </h2>
        <p className="text-[11px] text-slate-500 mt-0.5">
          過去問い合わせのあった法人へのリピート提案、行動データを取得済みの個人見込客への先回り提案をAIがサジェストします。
        </p>
      </div>

      <div className="flex items-center gap-1 bg-slate-100 rounded p-0.5 w-fit">
        <button onClick={() => setTab("corp")} className={`px-3 py-1.5 text-[11px] font-medium rounded inline-flex items-center gap-1 ${tab === "corp" ? "bg-white shadow-sm text-slate-900" : "text-slate-600"}`}>
          <Building2 className="w-3 h-3" />法人顧客（リピート提案）
        </button>
        <button onClick={() => setTab("indiv")} className={`px-3 py-1.5 text-[11px] font-medium rounded inline-flex items-center gap-1 ${tab === "indiv" ? "bg-white shadow-sm text-slate-900" : "text-slate-600"}`}>
          <Users className="w-3 h-3" />個人見込客（先回り提案）
        </button>
      </div>

      {/* 法人：過去と同時期の提案サジェスト */}
      {tab === "corp" && (
        <div className="space-y-2">
          {CORPORATE_LEADS.map((c) => (
            <div key={c.id} className="bg-white border border-slate-200 rounded-md p-4">
              <div className="flex items-start justify-between flex-wrap gap-2">
                <div>
                  <div className="text-[13px] font-bold text-slate-900">{c.company}</div>
                  <div className="text-[10px] text-slate-500">{c.industry}・{c.id}</div>
                </div>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-ai-light text-ai-dark border border-ai/20">
                  <Sparkles className="w-2.5 h-2.5" />サジェスト確度 {Math.round(c.confidence * 100)}%
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 mt-3">
                <div className="bg-slate-50 rounded p-2.5">
                  <div className="text-[10px] text-slate-500 mb-0.5">前回の問い合わせ</div>
                  <div className="text-[12px] font-bold text-slate-800">{c.lastInquiry}（{c.season}）</div>
                  <div className="text-[11px] text-slate-600 mt-1">{c.lastCase}</div>
                  <div className="text-[10px] text-slate-500 mt-1">{c.pattern}</div>
                </div>
                <div className="bg-brand-light/40 rounded p-2.5 border border-brand/20">
                  <div className="text-[10px] text-brand-dark mb-0.5 flex items-center gap-1"><CalendarClock className="w-3 h-3" />次回提案の推奨時期</div>
                  <div className="text-[12px] font-bold text-brand-dark">{c.nextSuggest}</div>
                  <div className="text-[11px] text-slate-700 mt-1 flex items-start gap-1"><TrendingUp className="w-3 h-3 mt-0.5 text-brand" />{c.suggestCase}</div>
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-3">
                <button onClick={() => alert(`「${c.company}」へのリマインドを登録しました（${c.nextSuggest}・モック）`)} className="px-3 py-1.5 text-[11px] border border-slate-300 rounded text-slate-700 hover:bg-slate-50">
                  リマインド登録
                </button>
                <button onClick={() => setCurrent && setCurrent("proposal")} className="px-4 py-1.5 text-[11px] font-bold text-white rounded bg-brand hover:bg-brand-dark inline-flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />この内容で提案を作成
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 個人：行動データに基づくメール/SMS/チャット サジェスト */}
      {tab === "indiv" && (
        <div className="space-y-2">
          {INDIVIDUAL_LEADS.map((l) => (
            <div key={l.id} className="bg-white border border-slate-200 rounded-md p-4">
              <div className="flex items-start justify-between flex-wrap gap-2">
                <div>
                  <div className="text-[12px] font-bold text-slate-900 font-mono">{l.id}</div>
                  <div className="text-[10px] text-slate-500">{l.contact}・希望チャネル：{l.channelPref}</div>
                </div>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-ai-light text-ai-dark border border-ai/20">
                  <Sparkles className="w-2.5 h-2.5" />見込み度 {Math.round(l.score * 100)}%
                </span>
              </div>

              <div className="grid grid-cols-4 gap-2 mt-3 text-[11px]">
                <div className="bg-slate-50 rounded p-2"><div className="text-[9px] text-slate-400">希望エリア</div><div className="font-bold text-slate-800">{l.area}</div></div>
                <div className="bg-slate-50 rounded p-2"><div className="text-[9px] text-slate-400">賃料帯 / 間取り</div><div className="font-bold text-slate-800">{l.budget} / {l.layout}</div></div>
                <div className="bg-slate-50 rounded p-2"><div className="text-[9px] text-slate-400">HP閲覧</div><div className="font-bold text-slate-800 flex items-center gap-1"><Eye className="w-3 h-3" />{l.views}回（{l.lastAccess}）</div></div>
                <div className="bg-slate-50 rounded p-2"><div className="text-[9px] text-slate-400">入居希望</div><div className="font-bold text-slate-800">{l.moveIn}</div></div>
              </div>

              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                <span className="text-[10px] text-slate-500">お気に入り：</span>
                {l.favorites.length ? l.favorites.map((f) => (
                  <span key={f} className="text-[10px] px-1.5 py-0.5 bg-amber-50 text-amber-700 rounded border border-amber-200 inline-flex items-center gap-0.5"><Star className="w-2.5 h-2.5" />{f}</span>
                )) : <span className="text-[10px] text-slate-400">なし（閲覧のみ）</span>}
              </div>

              <div className="mt-2 bg-ai-light/40 border border-ai/20 rounded p-2.5">
                <div className="text-[10px] text-ai-dark font-bold mb-1 flex items-center gap-1"><Sparkles className="w-3 h-3" />サジェスト案件</div>
                <div className="flex flex-wrap gap-1">
                  {l.suggestProps.map((s) => <span key={s} className="text-[10px] px-1.5 py-0.5 bg-white text-slate-700 rounded border border-slate-200">{s}</span>)}
                </div>
                <div className="text-[10px] text-slate-500 mt-2 mb-0.5">サジェスト文面（{l.channelPref}）</div>
                <div className="text-[11px] text-slate-700 bg-white border border-slate-200 rounded px-2 py-1.5 leading-relaxed">{l.draft}</div>
              </div>

              <div className="flex justify-end mt-3">
                <button onClick={() => setComposeLead(l)} className="px-4 py-1.5 text-[11px] font-bold text-white rounded bg-indigo-600 hover:bg-indigo-700 inline-flex items-center gap-1">
                  <Send className="w-3.5 h-3.5" />文面を確認して送信
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {composeLead && <ComposeDialog lead={composeLead} onClose={() => setComposeLead(null)} />}
    </div>
  );
}

// メール/SMS/チャット送信（システム経由・宛先はマスク）
function ComposeDialog({ lead, onClose }) {
  const [channel, setChannel] = useState(lead.channelPref.includes("チャット") ? "chat" : lead.channelPref.includes("SMS") ? "sms" : "mail");
  const [text, setText] = useState(lead.draft);
  const [sent, setSent] = useState(false);

  return (
    <div className="fixed inset-0 z-[60] bg-slate-900/50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-md shadow-xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="px-5 py-3 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-[14px] font-bold text-slate-900 flex items-center gap-2"><Send className="w-4 h-4 text-indigo-600" />見込客へ送信（{lead.id}）</h3>
          <button onClick={onClose} className="w-7 h-7 inline-flex items-center justify-center rounded hover:bg-slate-100 text-slate-500"><X className="w-4 h-4" /></button>
        </div>
        {sent ? (
          <div className="p-6 text-center">
            <Send className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
            <h4 className="text-[14px] font-bold text-slate-900 mb-1">送信しました（モック）</h4>
            <p className="text-[11px] text-slate-600">{CHANNELS.find((c) => c.id === channel)?.label}で {lead.id} へ送信しました。宛先の実アドレスはシステム内で秘匿されています。</p>
            <button onClick={onClose} className="mt-4 px-4 py-1.5 text-[12px] font-bold text-white rounded bg-brand">閉じる</button>
          </div>
        ) : (
          <div className="p-5 space-y-3">
            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">送信チャネル</label>
              <div className="flex gap-2">
                {CHANNELS.map((c) => {
                  const Icon = c.icon;
                  return <button key={c.id} onClick={() => setChannel(c.id)} className={`flex-1 text-[11px] py-1.5 rounded border inline-flex items-center justify-center gap-1 ${channel === c.id ? "border-brand bg-brand-light text-brand-dark font-bold" : "border-slate-300 text-slate-600"}`}><Icon className="w-3 h-3" />{c.label}</button>;
                })}
              </div>
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">本文（編集できます）</label>
              <textarea value={text} onChange={(e) => setText(e.target.value)} rows={6} className="w-full px-3 py-2 border border-slate-300 rounded text-[12px] leading-relaxed" />
              {channel === "sms" && <p className="text-[9px] text-slate-400 mt-1">※ SMSは文字数制限があります（{text.length}/660）。</p>}
            </div>
            <div className="text-[10px] text-slate-500">宛先：{lead.contact}（システム経由で送信。実アドレスは表示・保持しません）</div>
            <div className="flex justify-end gap-2">
              <button onClick={onClose} className="px-3 py-1.5 text-[12px] border border-slate-300 rounded text-slate-700">キャンセル</button>
              <button onClick={() => setSent(true)} className="px-4 py-1.5 text-[12px] font-bold text-white rounded bg-indigo-600 hover:bg-indigo-700 inline-flex items-center gap-1"><Send className="w-3.5 h-3.5" />送信</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
