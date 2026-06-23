import React, { useState, useEffect, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Tooltip } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  Lock, Star, MessageSquarePlus, ThumbsDown, FileSignature, CheckCircle2,
  ShieldCheck, Train, Send, X, List, MapPin, Share2, Mail, FileSpreadsheet,
  FileText, ArrowUpDown, Ban,
} from "lucide-react";
import { getSharedProposal, subscribeSharedProposal } from "../data/sharedProposal";

const SHORTFALL_TAGS = ["駅から遠い", "予算オーバー", "間取りが狭い", "築年数が古い", "設備不足", "エリアが希望と違う"];

// 指定住所（勤務地など）の座標プリセット（モック）
const REF_ADDRESSES = [
  { label: "勤務地：板橋本社（板橋区板橋1）", lat: 35.7456, lng: 139.7090 },
  { label: "上板橋駅", lat: 35.769, lng: 139.671 },
  { label: "ときわ台駅", lat: 35.774, lng: 139.685 },
];

// 2点間の概算距離(km)
function distKm(a, b) {
  if (!a || !b || !a.lat) return null;
  const R = 6371, toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat), dLng = toRad(b.lng - a.lng);
  const s = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s));
}

// 詳細な間取り図SVG（駐車場・フェンス・オートロック位置まで）item2
function FloorPlan({ height = 150 }) {
  return (
    <svg viewBox="0 0 240 160" style={{ width: "100%", height }} className="bg-white">
      <rect x="0" y="0" width="240" height="160" fill="#f8fafc" />
      {/* 敷地フェンス */}
      <rect x="6" y="6" width="228" height="148" fill="none" stroke="#94a3b8" strokeDasharray="4 3" strokeWidth="1.5" />
      <text x="10" y="18" fontSize="7" fill="#94a3b8">フェンス</text>
      {/* 建物 */}
      <rect x="20" y="40" width="120" height="100" fill="#fff" stroke="#334155" strokeWidth="2" />
      {/* 居室 */}
      <rect x="24" y="44" width="72" height="62" fill="#eef2ff" stroke="#cbd5e1" />
      <text x="30" y="78" fontSize="9" fill="#475569">洋室 6.0帖</text>
      {/* キッチン */}
      <rect x="100" y="44" width="36" height="34" fill="#fef9c3" stroke="#cbd5e1" />
      <text x="104" y="63" fontSize="6.5" fill="#475569">キッチン</text>
      {/* UB */}
      <rect x="100" y="82" width="18" height="24" fill="#e0f2fe" stroke="#cbd5e1" />
      <text x="101" y="96" fontSize="5.5" fill="#475569">UB</text>
      {/* WC */}
      <rect x="120" y="82" width="16" height="24" fill="#e0f2fe" stroke="#cbd5e1" />
      <text x="122" y="96" fontSize="5.5" fill="#475569">WC</text>
      {/* 玄関 */}
      <rect x="24" y="110" width="40" height="26" fill="#f1f5f9" stroke="#cbd5e1" />
      <text x="30" y="126" fontSize="7" fill="#475569">玄関</text>
      {/* バルコニー */}
      <rect x="68" y="110" width="68" height="26" fill="#dcfce7" stroke="#cbd5e1" />
      <text x="78" y="126" fontSize="7" fill="#475569">バルコニー</text>
      {/* オートロック位置 */}
      <circle cx="22" cy="123" r="6" fill="#2563eb" />
      <text x="16" y="148" fontSize="6.5" fill="#2563eb">●オートロック</text>
      {/* 駐車場 */}
      <rect x="156" y="40" width="72" height="46" fill="#f1f5f9" stroke="#94a3b8" />
      <text x="168" y="66" fontSize="8" fill="#64748b">駐車場</text>
      <line x1="180" y1="40" x2="180" y2="86" stroke="#cbd5e1" />
      <line x1="204" y1="40" x2="204" y2="86" stroke="#cbd5e1" />
      {/* 駐輪場 */}
      <rect x="156" y="94" width="72" height="40" fill="#f8fafc" stroke="#94a3b8" />
      <text x="168" y="118" fontSize="7.5" fill="#64748b">駐輪場</text>
      {/* 北矢印 */}
      <text x="222" y="20" fontSize="8" fill="#64748b">N↑</text>
    </svg>
  );
}

function poiIcon(num, fav) {
  return L.divIcon({
    className: "rv-pin",
    html: `<div style="position:relative;"><div style="width:24px;height:24px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);background:${fav ? "#f59e0b" : "#003087"};border:2px solid #fff;box-shadow:0 1px 3px rgba(0,0,0,.3);"></div><div style="position:absolute;top:2px;left:0;width:24px;text-align:center;font-size:11px;font-weight:800;color:#fff;">${num}</div></div>`,
    iconSize: [24, 24], iconAnchor: [12, 24],
  });
}

export default function RecipientView() {
  const [shared, setShared] = useState(getSharedProposal());
  useEffect(() => subscribeSharedProposal(setShared), []);

  const [phase, setPhase] = useState("landing"); // landing → password → opened
  const [pw, setPw] = useState("");
  const [pwError, setPwError] = useState("");

  // 表示モード A=リスト（法人向け） / B=地図検索（item3 A/B）
  const [mode, setMode] = useState("list");
  const [favorites, setFavorites] = useState({});
  const [onlyFav, setOnlyFav] = useState(false);
  const [questions, setQuestions] = useState({});
  const [shortfalls, setShortfalls] = useState({});
  const [applied, setApplied] = useState(null);
  const [applyTarget, setApplyTarget] = useState(null);
  const [showReshare, setShowReshare] = useState(false);

  // A：ソート＋指定住所からの距離
  const [refAddr, setRefAddr] = useState(REF_ADDRESSES[0]);
  const [sortKey, setSortKey] = useState("rent");
  const [sortDir, setSortDir] = useState("asc");

  // 送付担当の推奨初期表示（item1：手入力前提プルダウンは廃止し、推奨初期値を採用）
  useEffect(() => {
    if (shared?.initialView) setMode(shared.initialView === "list_map" ? "map" : "list");
  }, [shared]);

  // item4: 紹介中に他申込が入った想定 → 一部を「募集対象外」に（空き状況連携モック）
  const props = (shared?.properties || []).map((p, i) => ({ ...p, unavailable: i === 1 }));
  const requiresPw = !!shared?.password;

  // 距離付与＋ソート（A）※Hooksは早期returnより前で必ず実行する
  const listProps = useMemo(() => {
    let arr = props.map((p) => ({ ...p, _dist: distKm(refAddr, p) }));
    if (onlyFav) arr = arr.filter((p) => favorites[p.id]);
    arr.sort((a, b) => {
      let av, bv;
      if (sortKey === "rent") { av = a.rent; bv = b.rent; }
      else if (sortKey === "dist") { av = a._dist ?? 1e9; bv = b._dist ?? 1e9; }
      else if (sortKey === "walk") { av = a.walkMin; bv = b.walkMin; }
      else { av = a.age; bv = b.age; }
      return sortDir === "asc" ? av - bv : bv - av;
    });
    return arr;
  }, [props, refAddr, onlyFav, favorites, sortKey, sortDir]);

  if (!shared) {
    return (
      <div className="p-10 text-center">
        <div className="max-w-md mx-auto bg-white border border-slate-200 rounded-md p-8">
          <ShieldCheck className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h2 className="text-[14px] font-bold text-slate-800 mb-1">共有された提案がありません</h2>
          <p className="text-[11px] text-slate-500">提案作成（STEP4）で「URL共有」を確定すると、ここで受取側の画面を確認できます。</p>
        </div>
      </div>
    );
  }

  if (phase === "landing") {
    return (
      <div className="p-8">
        <div className="max-w-lg mx-auto bg-white border border-slate-200 rounded-md overflow-hidden">
          <div className="bg-gradient-to-br from-brand to-brand-dark text-white px-6 py-8 text-center">
            <div className="text-[11px] opacity-80">物件ご提案</div>
            <h1 className="text-[18px] font-bold mt-1">{shared.customerName || "お客様"} 御中</h1>
            <p className="text-[11px] opacity-90 mt-2">レオパレス21より{props.length}件の候補物件をご提案します</p>
          </div>
          <div className="p-6 text-center">
            <p className="text-[11px] text-slate-600 mb-4">共有リンクが開かれました。下のボタンから閲覧を開始してください。</p>
            <button onClick={() => setPhase(requiresPw ? "password" : "opened")} className="px-5 py-2 text-[12px] font-bold text-white rounded bg-brand hover:bg-brand-dark">提案を開く</button>
            <p className="text-[10px] text-slate-400 mt-3">有効期限：共有から{shared.expireDays}日 / 共有日時：{shared.sharedAt}</p>
          </div>
        </div>
      </div>
    );
  }

  if (phase === "password") {
    const submit = () => { if (pw === shared.password) { setPwError(""); setPhase("opened"); } else setPwError("パスワードが違います（モックPW: 1234）"); };
    return (
      <div className="p-8">
        <div className="max-w-sm mx-auto bg-white border border-slate-200 rounded-md p-6 text-center">
          <Lock className="w-9 h-9 text-brand mx-auto mb-3" />
          <h2 className="text-[14px] font-bold text-slate-800 mb-1">パスワードを入力</h2>
          <p className="text-[10px] text-slate-500 mb-4">送付者から別途お伝えしたパスワードを入力してください。</p>
          <input type="password" value={pw} onChange={(e) => setPw(e.target.value)} onKeyDown={(e) => e.key === "Enter" && submit()} placeholder="パスワード" className="w-full px-3 py-2 border border-slate-300 rounded text-[13px] text-center tracking-widest" />
          {pwError && <div className="text-[10px] text-rose-600 mt-2">{pwError}</div>}
          <button onClick={submit} className="mt-4 w-full px-4 py-2 text-[12px] font-bold text-white rounded bg-brand hover:bg-brand-dark">開封する</button>
        </div>
      </div>
    );
  }

  const toggleFav = (id) => setFavorites((f) => ({ ...f, [id]: !f[id] }));
  const favCount = props.filter((p) => favorites[p.id]).length;
  const center = props.length ? [props.reduce((s, p) => s + (p.lat || 35.77), 0) / props.length, props.reduce((s, p) => s + (p.lng || 139.68), 0) / props.length] : [35.77, 139.68];

  const setShortfallTag = (id, tag) => setShortfalls((s) => {
    const cur = s[id] || { tags: [], note: "" };
    const has = cur.tags.includes(tag);
    return { ...s, [id]: { ...cur, tags: has ? cur.tags.filter((t) => t !== tag) : [...cur.tags, tag] } };
  });
  const setShortfallNote = (id, note) => setShortfalls((s) => ({ ...s, [id]: { ...(s[id] || { tags: [] }), note } }));

  const questionList = Object.entries(questions).filter(([, v]) => v && v.trim());
  const shortfallList = Object.entries(shortfalls).filter(([, v]) => (v.tags?.length || v.note));

  return (
    <div className="p-5 space-y-3 max-w-6xl mx-auto">
      {/* ヘッダ */}
      <div className="bg-white border border-slate-200 rounded-md px-4 py-3 flex items-center justify-between flex-wrap gap-2">
        <div>
          <div className="text-[15px] font-bold text-slate-900">{shared.customerName} 御中 ご提案</div>
          <div className="text-[11px] text-slate-500">候補 {props.length} 件 ／ 送付担当のおすすめ表示：{shared.initialView === "list_map" ? "地図検索" : "リスト"}（変更できます）</div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowReshare(true)} className="px-3 py-1.5 text-[11px] font-bold text-white rounded bg-indigo-600 hover:bg-indigo-700 inline-flex items-center gap-1">
            <Share2 className="w-3.5 h-3.5" />入居者に共有
          </button>
          <div className="flex items-center gap-1 bg-slate-100 rounded p-0.5">
            <button onClick={() => setMode("list")} className={`px-3 py-1 text-[11px] font-medium rounded inline-flex items-center gap-1 ${mode === "list" ? "bg-white shadow-sm text-slate-900" : "text-slate-600"}`}><List className="w-3 h-3" />リスト</button>
            <button onClick={() => setMode("map")} className={`px-3 py-1 text-[11px] font-medium rounded inline-flex items-center gap-1 ${mode === "map" ? "bg-white shadow-sm text-slate-900" : "text-slate-600"}`}><MapPin className="w-3 h-3" />地図検索</button>
          </div>
        </div>
      </div>

      {/* item4: 空き状況連携の注記 */}
      {props.some((p) => p.unavailable) && (
        <div className="flex items-center gap-2 text-[10.5px] text-rose-700 bg-rose-50 border border-rose-200 rounded px-2.5 py-1.5">
          <Ban className="w-3.5 h-3.5" />
          紹介中に他のお申込みが入った物件は「募集対象外」と表示されます（コアシステムの空き状況とリアルタイム連携）。
        </div>
      )}

      <label className="inline-flex items-center gap-1 text-[11px] text-slate-600 cursor-pointer">
        <input type="checkbox" checked={onlyFav} onChange={(e) => setOnlyFav(e.target.checked)} className="rounded" />
        お気に入りのみ表示（{favCount}）
      </label>

      {/* B: 地図検索 */}
      {mode === "map" && (
        <div className="bg-white border border-slate-200 rounded-md overflow-hidden">
          <div className="h-[460px]">
            <MapContainer center={center} zoom={14} scrollWheelZoom style={{ height: "100%", width: "100%" }}>
              <TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              {props.filter((p) => p.lat).map((p, i) => (
                <Marker key={p.id} position={[p.lat, p.lng]} icon={poiIcon(i + 1, favorites[p.id])}>
                  <Tooltip direction="top" offset={[0, -22]}>
                    <div style={{ fontWeight: 700, fontSize: 12 }}>{i + 1}. {p.name}{p.unavailable ? "（募集対象外）" : ""}</div>
                    <div style={{ fontSize: 11, color: "#e11d48", fontWeight: 700 }}>{(p.rent / 10000).toFixed(1)}万円</div>
                    <div style={{ fontSize: 10, color: "#64748b" }}>{p.station}駅 徒歩{p.walkMin}分</div>
                  </Tooltip>
                </Marker>
              ))}
            </MapContainer>
          </div>
          <div className="px-3 py-2 text-[10px] text-slate-500 border-t border-slate-100">ピン番号はリストの番号と連動。★はお気に入り。</div>
        </div>
      )}

      {/* A: 法人向けリスト一覧（金額・距離でソート可／20件でも見やすい） */}
      {mode === "list" && (
        <div className="bg-white border border-slate-200 rounded-md overflow-hidden">
          <div className="px-3 py-2 border-b border-slate-100 bg-slate-50 flex items-center gap-2 flex-wrap text-[11px]">
            <span className="text-slate-500">指定住所からの距離基準：</span>
            <select value={refAddr.label} onChange={(e) => setRefAddr(REF_ADDRESSES.find((r) => r.label === e.target.value))} className="border border-slate-300 rounded px-1.5 py-1">
              {REF_ADDRESSES.map((r) => <option key={r.label} value={r.label}>{r.label}</option>)}
            </select>
            <span className="text-slate-500 ml-2">並び替え：</span>
            <select value={sortKey} onChange={(e) => setSortKey(e.target.value)} className="border border-slate-300 rounded px-1.5 py-1">
              <option value="rent">金額</option>
              <option value="dist">指定住所からの距離</option>
              <option value="walk">駅徒歩</option>
              <option value="age">築年数</option>
            </select>
            <button onClick={() => setSortDir((d) => (d === "asc" ? "desc" : "asc"))} className="border border-slate-300 rounded px-2 py-1 inline-flex items-center gap-1">
              <ArrowUpDown className="w-3 h-3" />{sortDir === "asc" ? "昇順" : "降順"}
            </button>
          </div>
          <table className="w-full text-[11px]">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-100">
              <tr>
                <th className="px-2 py-2 text-left">#</th>
                <th className="px-2 py-2 text-left">物件</th>
                <th className="px-2 py-2 text-right">金額</th>
                <th className="px-2 py-2 text-right">距離</th>
                <th className="px-2 py-2 text-left">特徴</th>
                <th className="px-2 py-2 text-center">リンク</th>
                <th className="px-2 py-2 text-center">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {listProps.map((p, i) => (
                <tr key={p.id} className={`hover:bg-slate-50 ${p.unavailable ? "opacity-60" : ""}`}>
                  <td className="px-2 py-2 font-bold text-brand-accent">{props.indexOf(props.find((x) => x.id === p.id)) + 1}</td>
                  <td className="px-2 py-2">
                    <div className="font-bold text-slate-900 flex items-center gap-1">
                      {p.name}
                      {p.unavailable && <span className="text-[9px] font-bold px-1 py-0.5 rounded bg-rose-100 text-rose-700 border border-rose-300">募集対象外</span>}
                    </div>
                    <div className="text-[10px] text-slate-500"><Train className="w-2.5 h-2.5 inline" /> {p.station}駅 徒歩{p.walkMin}分・{p.layout}・築{p.age}年</div>
                  </td>
                  <td className="px-2 py-2 text-right font-bold text-rose-600 whitespace-nowrap">{(p.rent / 10000).toFixed(1)}万円</td>
                  <td className="px-2 py-2 text-right text-slate-700 whitespace-nowrap">{p._dist != null ? `${p._dist.toFixed(1)}km` : "—"}</td>
                  <td className="px-2 py-2">
                    <div className="flex flex-wrap gap-0.5">
                      {[...(p.kodawari || []), ...(p.features || [])].slice(0, 3).map((f) => (
                        <span key={f} className="text-[9px] px-1 py-0.5 bg-sky-50 text-sky-700 rounded">{f}</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-2 py-2 text-center whitespace-nowrap">
                    <button onClick={() => setMode("map")} className="text-[10px] text-brand underline">地図</button>
                    <span className="text-slate-300 mx-1">/</span>
                    {p.officialUrl ? <a href={p.officialUrl} target="_blank" rel="noreferrer" className="text-[10px] text-brand underline">概要</a> : <span className="text-slate-300 text-[10px]">概要</span>}
                  </td>
                  <td className="px-2 py-2 text-center whitespace-nowrap">
                    <button onClick={() => toggleFav(p.id)} className={`mr-1 ${favorites[p.id] ? "text-amber-500" : "text-slate-300"}`}><Star className="w-4 h-4 inline" fill={favorites[p.id] ? "currentColor" : "none"} /></button>
                    {applied === p.id ? (
                      <span className="text-[10px] text-emerald-600 font-bold">申込済</span>
                    ) : p.unavailable ? (
                      <span className="text-[10px] text-rose-400">申込不可</span>
                    ) : (
                      <button onClick={() => setApplyTarget(p)} className="text-[10px] text-white bg-brand px-2 py-0.5 rounded">申込</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 物件カード（間取り図・質問・惜しい） */}
      <div className="grid grid-cols-2 gap-3">
        {(onlyFav ? props.filter((p) => favorites[p.id]) : props).map((p) => {
          const num = props.indexOf(p) + 1;
          const isFav = !!favorites[p.id];
          const isApplied = applied === p.id;
          return (
            <article key={p.id} className={`border rounded-md overflow-hidden bg-white ${p.unavailable ? "border-rose-200" : "border-slate-200"}`}>
              <div className="grid grid-cols-2">
                <div className="relative border-r border-slate-100">
                  <FloorPlan height={150} />
                  <div className="absolute top-1 left-1 w-5 h-5 rounded-full bg-brand-accent text-white text-[11px] font-extrabold flex items-center justify-center">{num}</div>
                  {p.unavailable && <div className="absolute inset-0 bg-white/60 flex items-center justify-center"><span className="text-[12px] font-bold text-rose-600 border-2 border-rose-400 px-2 py-1 rounded -rotate-12 bg-white">募集対象外</span></div>}
                </div>
                <div className="p-2">
                  <div className="flex items-start justify-between">
                    <div className="text-[12px] font-bold text-slate-900">{p.name}</div>
                    <button onClick={() => toggleFav(p.id)} className={isFav ? "text-amber-500" : "text-slate-300"}><Star className="w-4 h-4" fill={isFav ? "currentColor" : "none"} /></button>
                  </div>
                  <div className="text-[14px] font-bold text-rose-600">{(p.rent / 10000).toFixed(1)}万円<span className="text-[9px] text-slate-500 font-normal">（共益費 ¥{Number(p.fee || 0).toLocaleString()}）</span></div>
                  <div className="text-[9px] text-slate-500">仲介手数料 <b className="text-emerald-600">不要</b> / 敷金 <b className="text-emerald-600">不要</b></div>
                  <div className="text-[10px] text-slate-600 mt-0.5"><Train className="w-2.5 h-2.5 inline" /> {p.station}駅 徒歩{p.walkMin}分・{p.layout}・{p.size}㎡</div>
                  {p.catchphrase && <div className="text-[10px] text-rose-600 mt-1 leading-snug">{p.catchphrase}</div>}
                </div>
              </div>
              <div className="p-2 border-t border-slate-100">
                <label className="text-[9px] text-slate-400 flex items-center gap-1"><MessageSquarePlus className="w-3 h-3" />追加質問</label>
                <input value={questions[p.id] || ""} onChange={(e) => setQuestions((q) => ({ ...q, [p.id]: e.target.value }))} placeholder="例：駐車場は空いていますか？" className="w-full mt-0.5 px-2 py-1 text-[11px] border border-slate-200 rounded" />
                <label className="text-[9px] text-slate-400 flex items-center gap-1 mt-1.5"><ThumbsDown className="w-3 h-3" />ここが惜しい</label>
                <div className="flex flex-wrap gap-1 mt-0.5">
                  {SHORTFALL_TAGS.map((tag) => {
                    const on = shortfalls[p.id]?.tags?.includes(tag);
                    return <button key={tag} onClick={() => setShortfallTag(p.id, tag)} className={`text-[9px] px-1.5 py-0.5 rounded border ${on ? "bg-human-light text-human-dark border-human/40" : "bg-white text-slate-500 border-slate-200"}`}>{tag}</button>;
                  })}
                </div>
                <button onClick={() => setApplyTarget(p)} disabled={isApplied || p.unavailable}
                  className={`mt-2 w-full px-3 py-1.5 text-[12px] font-bold rounded inline-flex items-center justify-center gap-1 ${isApplied ? "bg-emerald-100 text-emerald-700" : p.unavailable ? "bg-slate-100 text-slate-400 cursor-not-allowed" : "text-white bg-brand hover:bg-brand-dark"}`}>
                  {isApplied ? <><CheckCircle2 className="w-3.5 h-3.5" />お申込み受付済み</> : p.unavailable ? <><Ban className="w-3.5 h-3.5" />募集対象外</> : <><FileSignature className="w-3.5 h-3.5" />この物件を申し込む</>}
                </button>
              </div>
            </article>
          );
        })}
      </div>

      {/* 申し送りサマリ */}
      <div className="bg-white border border-slate-200 rounded-md p-4">
        <h3 className="text-[12px] font-bold text-slate-800 mb-2">送付者への申し送りサマリ</h3>
        <div className="grid grid-cols-3 gap-3 text-[11px]">
          <div>
            <div className="text-[10px] text-slate-400 mb-1">お気に入り（{favCount}）</div>
            {favCount === 0 ? <div className="text-slate-300">—</div> : props.filter((p) => favorites[p.id]).map((p) => <div key={p.id} className="text-slate-700">★ {p.name}</div>)}
          </div>
          <div>
            <div className="text-[10px] text-slate-400 mb-1">追加質問（{questionList.length}）</div>
            {questionList.length === 0 ? <div className="text-slate-300">—</div> : questionList.map(([id, q]) => { const p = props.find((x) => x.id === id); return <div key={id} className="text-slate-700">Q（{p?.name}）：{q}</div>; })}
          </div>
          <div>
            <div className="text-[10px] text-slate-400 mb-1">ここが惜しい（{shortfallList.length}）</div>
            {shortfallList.length === 0 ? <div className="text-slate-300">—</div> : shortfallList.map(([id, v]) => { const p = props.find((x) => x.id === id); return <div key={id} className="text-slate-700">{p?.name}：{[...(v.tags || []), v.note].filter(Boolean).join(" / ")}</div>; })}
          </div>
        </div>
        {applied && (
          <div className="mt-3 text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-200 rounded px-2 py-1.5 inline-flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />申込：{props.find((p) => p.id === applied)?.name}（個人情報は未収集。担当者が別途ご連絡します）
          </div>
        )}
      </div>

      {/* 申込確認モーダル */}
      {applyTarget && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4" onClick={() => setApplyTarget(null)}>
          <div className="bg-white rounded-md shadow-xl w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
            <div className="px-5 py-3 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-[13px] font-bold text-slate-900">お申込みの確認</h3>
              <button onClick={() => setApplyTarget(null)} className="w-7 h-7 inline-flex items-center justify-center rounded hover:bg-slate-100 text-slate-500"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-5 text-[12px] text-slate-700">
              <div className="font-bold text-slate-900 mb-1">{applyTarget.name}</div>
              <div className="text-[11px] text-slate-600">{(applyTarget.rent / 10000).toFixed(1)}万円・{applyTarget.station}駅 徒歩{applyTarget.walkMin}分</div>
              <p className="text-[10px] text-slate-500 mt-3">この内容で申込意思を送付者へ通知します。氏名・連絡先などの個人情報はこの画面では収集しません（担当者が別途ご案内します）。</p>
            </div>
            <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 flex justify-end gap-2">
              <button onClick={() => setApplyTarget(null)} className="px-3 py-1.5 text-[12px] border border-slate-300 rounded text-slate-700">キャンセル</button>
              <button onClick={() => { setApplied(applyTarget.id); setApplyTarget(null); }} className="px-4 py-1.5 text-[12px] font-bold text-white rounded bg-brand hover:bg-brand-dark inline-flex items-center gap-1"><Send className="w-3.5 h-3.5" />申込を送信</button>
            </div>
          </div>
        </div>
      )}

      {/* C: 入居者へ再共有（メール認証付き） */}
      {showReshare && <ReshareDialog favCount={favCount} onClose={() => setShowReshare(false)} />}
    </div>
  );
}

// item3-C: 選択分を入居者へメール認証付きで再共有
function ReshareDialog({ favCount, onClose }) {
  const [emails, setEmails] = useState("");
  const [onlyFav, setOnlyFav] = useState(favCount > 0);
  const [format, setFormat] = useState("url");
  const [sent, setSent] = useState(false);
  const formats = [
    { id: "url", label: "共有URL（おすすめ）", icon: Share2 },
    { id: "pdf", label: "PDF", icon: FileText },
    { id: "excel", label: "Excel一覧", icon: FileSpreadsheet },
  ];
  return (
    <div className="fixed inset-0 z-[60] bg-slate-900/50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-md shadow-xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="px-5 py-3 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-[14px] font-bold text-slate-900 flex items-center gap-2"><Share2 className="w-4 h-4 text-indigo-600" />入居者へ共有（メール認証付き）</h3>
          <button onClick={onClose} className="w-7 h-7 inline-flex items-center justify-center rounded hover:bg-slate-100 text-slate-500"><X className="w-4 h-4" /></button>
        </div>
        {sent ? (
          <div className="p-6 text-center">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
            <h4 className="text-[14px] font-bold text-slate-900 mb-1">共有リンクを送信しました（モック）</h4>
            <p className="text-[11px] text-slate-600">入居予定者のメールに<strong>認証付きリンク</strong>を送信しました。受け取った方はお気に入り絞り込み・出力フォーマット選択ができます。</p>
            <button onClick={onClose} className="mt-4 px-4 py-1.5 text-[12px] font-bold text-white rounded bg-brand">閉じる</button>
          </div>
        ) : (
          <div className="p-5 space-y-3">
            <p className="text-[11px] text-slate-600">人事・総務の方が、実際に入居する社員へ提案を転送できます。リンクは<strong>メール認証付き</strong>で、宛先本人のみ開封できます。</p>
            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">入居者のメールアドレス（カンマ区切り）</label>
              <textarea value={emails} onChange={(e) => setEmails(e.target.value)} rows={2} placeholder="taro@example.co.jp, hanako@example.co.jp" className="w-full px-3 py-2 border border-slate-300 rounded text-[11px]" />
              <p className="text-[9px] text-slate-400 mt-1">※ 認証コードが各メールに送られ、本人確認後に開封できます。</p>
            </div>
            <label className="flex items-center gap-2 text-[11px] cursor-pointer">
              <input type="checkbox" checked={onlyFav} onChange={(e) => setOnlyFav(e.target.checked)} className="rounded" />
              お気に入り（{favCount}件）に絞って共有する
            </label>
            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">出力フォーマット</label>
              <div className="flex gap-2">
                {formats.map((f) => {
                  const Icon = f.icon;
                  return <button key={f.id} onClick={() => setFormat(f.id)} className={`flex-1 text-[10px] py-1.5 rounded border inline-flex items-center justify-center gap-1 ${format === f.id ? "border-brand bg-brand-light text-brand-dark font-bold" : "border-slate-300 text-slate-600"}`}><Icon className="w-3 h-3" />{f.label}</button>;
                })}
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <button onClick={onClose} className="px-3 py-1.5 text-[12px] border border-slate-300 rounded text-slate-700">キャンセル</button>
              <button onClick={() => setSent(true)} disabled={!emails.trim()} className="px-4 py-1.5 text-[12px] font-bold text-white rounded bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 inline-flex items-center gap-1"><Mail className="w-3.5 h-3.5" />認証付きリンクを送信</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
