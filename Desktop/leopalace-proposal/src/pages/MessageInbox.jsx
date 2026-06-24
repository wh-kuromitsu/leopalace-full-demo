import React, { useState, useMemo } from "react";
import {
  Inbox, Mail, MessageCircle, Instagram, Sparkles, Clock, Reply, X, Send,
  CheckCircle2, Eye, Star, AlertTriangle, ShieldCheck,
} from "lucide-react";
import { MESSAGES, MSG_CATEGORIES } from "../data/messagesData";

const CHANNELS = {
  mail: { label: "メール", Icon: Mail, color: "text-sky-600", bg: "bg-sky-50" },
  line: { label: "LINE", Icon: MessageCircle, color: "text-green-600", bg: "bg-green-50" },
  insta: { label: "Instagram", Icon: Instagram, color: "text-pink-600", bg: "bg-pink-50" },
};

export default function MessageInbox() {
  const [channelFilter, setChannelFilter] = useState("all");
  const [reply, setReply] = useState(null);
  const [handled, setHandled] = useState({});

  const sorted = useMemo(() => {
    return [...MESSAGES]
      .filter((m) => channelFilter === "all" || m.channel === channelFilter)
      .sort((a, b) => {
        const ra = MSG_CATEGORIES[a.category].rank, rb = MSG_CATEGORIES[b.category].rank;
        if (ra !== rb) return ra - rb;
        return b.ageHours - a.ageHours; // 同ランクなら経過が長い順
      });
  }, [channelFilter]);

  const ageLabel = (h) => (h < 24 ? `${h}時間前` : `${Math.floor(h / 24)}日前`);
  const unhandled = sorted.filter((m) => !handled[m.id] && m.status !== "対応中").length;

  return (
    <div className="p-5 space-y-3">
      <div className="bg-white border border-slate-200 rounded-md px-4 py-3">
        <h2 className="text-[15px] font-bold text-slate-900 flex items-center gap-2">
          <Inbox className="w-4 h-4 text-brand" />
          メッセージ受信（メール / LINE / Instagram 集約）
        </h2>
        <p className="text-[11px] text-slate-500 mt-0.5">
          個人・法人、既存・新規を問わず各チャネルのメッセージを集約。AIが重要度を判定し、対応すべき順に上から表示します。
        </p>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <button onClick={() => setChannelFilter("all")} className={`text-[11px] px-2.5 py-1 rounded border ${channelFilter === "all" ? "bg-brand text-white border-brand" : "bg-white text-slate-600 border-slate-300"}`}>すべて</button>
        {Object.entries(CHANNELS).map(([k, c]) => {
          const Icon = c.Icon;
          return (
            <button key={k} onClick={() => setChannelFilter(k)} className={`text-[11px] px-2.5 py-1 rounded border inline-flex items-center gap-1 ${channelFilter === k ? "bg-brand text-white border-brand" : "bg-white text-slate-600 border-slate-300"}`}>
              <Icon className="w-3 h-3" />{c.label}
            </button>
          );
        })}
        <span className="text-[11px] text-slate-500 ml-2">未対応 <span className="font-bold text-rose-600">{unhandled}</span> 件</span>
      </div>

      {/* メッセージリスト（重要度順） */}
      <div className="space-y-2">
        {sorted.map((m, i) => {
          const cat = MSG_CATEGORIES[m.category];
          const ch = CHANNELS[m.channel];
          const ChIcon = ch.Icon;
          const isHandled = handled[m.id];
          return (
            <div key={m.id} className={`bg-white border border-slate-200 rounded-md overflow-hidden ${isHandled ? "opacity-60" : ""}`} style={{ borderLeft: `4px solid ${cat.accent}` }}>
              <div className="p-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-bold text-slate-400 w-5">{i + 1}</span>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${cat.color}`}>{cat.label}</span>
                  <span className={`inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded ${ch.bg} ${ch.color}`}><ChIcon className="w-3 h-3" />{ch.label}</span>
                  <span className="text-[11px] font-bold text-slate-800">{m.sender}</span>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded ${m.customerKind === "既存" ? "bg-slate-100 text-slate-600" : "bg-emerald-50 text-emerald-700"}`}>{m.customerKind}</span>
                  <span className="text-[10px] text-slate-400 ml-auto inline-flex items-center gap-1"><Clock className="w-3 h-3" />{ageLabel(m.ageHours)}</span>
                </div>

                <div className="text-[12px] text-slate-700 mt-1.5 pl-7">{m.snippet}</div>

                {(m.opened != null) && (
                  <div className="pl-7 mt-1 flex items-center gap-3 text-[10px] text-violet-700">
                    <span className="inline-flex items-center gap-1"><Eye className="w-3 h-3" />開封 {m.opened}回</span>
                    {m.favorited > 0 && <span className="inline-flex items-center gap-1"><Star className="w-3 h-3" />お気に入り {m.favorited}件</span>}
                  </div>
                )}

                <div className="pl-7 mt-1.5 flex items-start gap-1 text-[10px] text-slate-500">
                  <Sparkles className="w-3 h-3 mt-0.5 text-ai flex-shrink-0" />
                  <span><span className="font-bold text-ai-dark">重要度の理由：</span>{m.reason}</span>
                </div>

                <div className="pl-7 mt-2 flex items-center gap-2">
                  {isHandled ? (
                    <span className="text-[11px] text-emerald-600 font-bold inline-flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" />対応済み</span>
                  ) : (
                    <>
                      <button onClick={() => setReply(m)} className="px-3 py-1 text-[11px] font-bold text-white rounded bg-brand hover:bg-brand-dark inline-flex items-center gap-1"><Reply className="w-3.5 h-3.5" />返信</button>
                      <button onClick={() => setHandled((h) => ({ ...h, [m.id]: true }))} className="px-3 py-1 text-[11px] border border-slate-300 rounded text-slate-700 hover:bg-slate-50">対応済みにする</button>
                      {m.category === "complaint" && <span className="text-[10px] text-rose-600 inline-flex items-center gap-1"><AlertTriangle className="w-3 h-3" />即時対応推奨</span>}
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {reply && <ReplyDialog message={reply} onClose={() => setReply(null)} onSent={() => { setHandled((h) => ({ ...h, [reply.id]: true })); setReply(null); }} />}
    </div>
  );
}

// 返信ダイアログ（同一チャネルで返信。AIが下書きを用意）
function ReplyDialog({ message, onClose, onSent }) {
  const ch = CHANNELS[message.channel];
  const drafts = {
    complaint: "ご不便をおかけし申し訳ございません。至急、設備担当より本日中にご連絡し対応手配いたします。応急対応として可能な点もご案内します。",
    intent: "ご決裁ありがとうございます。契約手続きのご案内と必要書類をお送りします。ご希望の入居日を教えてください。",
    newneed: "お問い合わせありがとうございます。ご条件に合う家具家電付き物件をいくつかお送りします。オンライン内見も可能です。",
    delayed: "ご連絡が遅くなり申し訳ございません。お問い合わせの件、最新の空室状況をまとめてお送りします。",
    no_reaction: "先日お送りした物件はいかがでしたか。お気に入りに近い条件で新着もございます。ご不明点があればお気軽にどうぞ。",
    normal: "お問い合わせありがとうございます。レオネットは標準対応で在宅勤務にもご利用いただけます。詳細をお送りします。",
  };
  const [text, setText] = useState(drafts[message.category] || "");

  return (
    <div className="fixed inset-0 z-[60] bg-slate-900/50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-md shadow-xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="px-5 py-3 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-[14px] font-bold text-slate-900 flex items-center gap-2"><ch.Icon className={`w-4 h-4 ${ch.color}`} />{ch.label}で返信</h3>
          <button onClick={onClose} className="w-7 h-7 inline-flex items-center justify-center rounded hover:bg-slate-100 text-slate-500"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-5 space-y-3">
          <div className="text-[11px] text-slate-500">宛先：{message.sender}（{ch.label}・システム経由）</div>
          <div className="text-[11px] text-slate-700 bg-slate-50 border border-slate-200 rounded px-2 py-1.5">受信内容：{message.snippet}</div>
          <div>
            <label className="text-[11px] font-bold text-slate-700 block mb-1 flex items-center gap-1"><Sparkles className="w-3 h-3 text-ai" />AI下書き（手直し可）</label>
            <textarea value={text} onChange={(e) => setText(e.target.value)} rows={5} className="w-full px-3 py-2 border border-slate-300 rounded text-[12px] leading-relaxed" />
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={onClose} className="px-3 py-1.5 text-[12px] border border-slate-300 rounded text-slate-700">キャンセル</button>
            <button onClick={onSent} className="px-4 py-1.5 text-[12px] font-bold text-white rounded bg-brand hover:bg-brand-dark inline-flex items-center gap-1"><Send className="w-3.5 h-3.5" />送信</button>
          </div>
        </div>
      </div>
    </div>
  );
}
