import React, { useMemo } from "react";
import { MapPin, Plus, Minus, Train, Sparkles, ShieldCheck } from "lucide-react";
import { STATION_MARKERS } from "../data/propertiesData";

export default function PropertyMap({
  properties,
  selected,
  hovered,
  setHovered,
  onSelect,
  addedIds = [],
}) {
  const positions = useMemo(() => {
    return properties.map((p) => {
      const left = 50 + (p.lng - 139.808) * 700;
      const top = 50 - (p.lat - 35.675) * 1200;
      return { id: p.id, left: `${left}%`, top: `${top}%` };
    });
  }, [properties]);

  const IconBtn = ({ children, title }) => (
    <button
      title={title}
      className="w-9 h-9 inline-flex items-center justify-center rounded border border-slate-200 bg-white text-slate-600 hover:border-slate-400 hover:text-slate-900"
    >
      {children}
    </button>
  );

  return (
    <div className="flex-1 relative bg-[#e9eef3] overflow-hidden">
      <div className="absolute inset-0 map-grid" />

      {/* 道路 */}
      <div className="absolute" style={{ top: "30%", left: 0, right: 0, height: "12px", background: "linear-gradient(to bottom, transparent, #fff 30%, #fff 70%, transparent)", opacity: 0.8 }} />
      <div className="absolute" style={{ top: 0, bottom: 0, left: "55%", width: "10px", background: "linear-gradient(to right, transparent, #fff 30%, #fff 70%, transparent)", opacity: 0.8 }} />

      {/* 川 */}
      <div className="absolute" style={{ top: "10%", bottom: "10%", left: "20%", width: "30px", background: "linear-gradient(to right, transparent, #bcd7e8 30%, #bcd7e8 70%, transparent)", transform: "rotate(8deg)" }} />

      {/* 公園 */}
      <div className="absolute rounded-full" style={{ top: "60%", left: "70%", width: "80px", height: "80px", background: "radial-gradient(circle, #c9e2c9, #c9e2c9 60%, transparent)" }} />
      <div className="absolute rounded-full" style={{ top: "20%", left: "75%", width: "60px", height: "60px", background: "radial-gradient(circle, #c9e2c9, #c9e2c9 60%, transparent)" }} />

      {/* 駅マーカー */}
      {STATION_MARKERS.map((s) => (
        <div
          key={s.name}
          className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-0.5"
          style={{ left: s.left, top: s.top }}
        >
          <div className="w-3 h-3 rounded-full bg-white border-2 border-slate-600" />
          <div className="text-[10px] font-bold text-slate-700 bg-white/90 px-1 rounded">
            <Train className="w-2.5 h-2.5 inline" />
            {s.name}
          </div>
        </div>
      ))}

      {/* 物件ピン */}
      {properties.map((p) => {
        const pos = positions.find((x) => x.id === p.id);
        const isSelected = selected === p.id;
        const isHovered = hovered === p.id;
        const isAdded = addedIds.includes(p.id);
        return (
          <button
            key={p.id}
            onClick={() => onSelect && onSelect(p.id)}
            onMouseEnter={() => setHovered && setHovered(p.id)}
            onMouseLeave={() => setHovered && setHovered(null)}
            className="absolute -translate-x-1/2 -translate-y-full group z-10"
            style={{ left: pos.left, top: pos.top }}
          >
            <div
              className={`relative px-2 py-1 rounded-md shadow-md text-[11px] font-bold whitespace-nowrap transition-all
                ${
                  isSelected || isHovered
                    ? "bg-rose-500 text-white scale-110 z-20"
                    : isAdded
                    ? "bg-emerald-500 text-white"
                    : p.recommend
                    ? "bg-sky-500 text-white"
                    : "bg-white text-slate-800 border border-slate-300"
                }`}
            >
              ¥{(p.rent / 10000).toFixed(1)}万
              {/* AI推薦バッジ */}
              {p.recommend && !isSelected && !isHovered && (
                <span
                  className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-ai rounded-full border border-white flex items-center justify-center"
                  title="AI推薦物件"
                >
                  <Sparkles className="w-2.5 h-2.5 text-white" />
                </span>
              )}
              <div
                className={`absolute left-1/2 -bottom-1.5 -translate-x-1/2 w-0 h-0
                  border-l-[6px] border-r-[6px] border-t-[6px] border-l-transparent border-r-transparent
                  ${
                    isSelected || isHovered
                      ? "border-t-rose-500"
                      : isAdded
                      ? "border-t-emerald-500"
                      : p.recommend
                      ? "border-t-sky-500"
                      : "border-t-white"
                  }`}
              />
            </div>

            {/* ホバー時のミニ吹き出し（AI推薦理由付き） */}
            {isHovered && (
              <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-60 bg-white border border-slate-200 rounded shadow-xl p-2.5 text-left z-30">
                <div className="text-[11px] font-bold text-slate-900 truncate">
                  {p.name}
                </div>
                <div className="text-[10px] text-slate-500">
                  {p.station} 徒歩{p.walkMin}分
                </div>
                <div className="flex items-center gap-2 mt-1 text-[10px]">
                  <span className="font-bold text-rose-600">
                    ¥{p.rent.toLocaleString()}
                  </span>
                  <span className="text-slate-500">
                    {p.layout} / {p.size}㎡
                  </span>
                  <span className="ml-auto text-[9px] px-1 py-0.5 bg-sky-100 text-sky-700 rounded font-bold">
                    適合度 {p.matched}%
                  </span>
                </div>
                {p.aiAnalysis && (
                  <div className="mt-2 pt-2 border-t border-slate-100">
                    <div className="text-[9px] text-ai-dark font-bold flex items-center gap-1">
                      <Sparkles className="w-2.5 h-2.5" />
                      AI推薦理由（確信度 {Math.round(p.aiAnalysis.confidence * 100)}%）
                    </div>
                    <div className="text-[10px] text-slate-700 mt-0.5 leading-tight">
                      {p.aiAnalysis.recommendReason}
                    </div>
                  </div>
                )}
              </div>
            )}
          </button>
        );
      })}

      {/* 地図UI */}
      <div className="absolute top-4 right-4 flex flex-col gap-1 z-20">
        <IconBtn title="拡大">
          <Plus className="w-4 h-4" />
        </IconBtn>
        <IconBtn title="縮小">
          <Minus className="w-4 h-4" />
        </IconBtn>
        <div className="h-px bg-slate-200 my-1" />
        <IconBtn title="現在地">
          <MapPin className="w-4 h-4" />
        </IconBtn>
      </div>

      {/* 凡例 */}
      <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur border border-slate-200 rounded-md p-3 text-[10px] z-20 shadow">
        <div className="font-bold text-slate-700 mb-1.5">凡例</div>
        <div className="space-y-1">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-sky-500 relative">
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-ai rounded-full" />
            </span>
            <span>AI推薦物件</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-white border border-slate-400" />
            <span>その他物件</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-emerald-500" />
            <span>候補に追加済み</span>
          </div>
        </div>
      </div>

      {/* 表示件数 + データソース */}
      <div className="absolute top-4 left-4 z-20 space-y-1">
        <div className="bg-white/95 backdrop-blur border border-slate-200 rounded-full px-3 py-1.5 text-[11px] shadow">
          <span className="text-slate-500">表示中</span>{" "}
          <span className="font-bold text-slate-900">{properties.length}</span>
          <span className="text-slate-500"> / 142 件</span>
        </div>
        <div className="bg-white/95 backdrop-blur border border-secure/20 rounded-full px-3 py-1 text-[9px] shadow flex items-center gap-1 text-secure-dark">
          <ShieldCheck className="w-2.5 h-2.5" />
          全社CSV / TLS暗号化通信
        </div>
      </div>
    </div>
  );
}
