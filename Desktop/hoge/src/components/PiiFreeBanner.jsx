import React from "react";
import { ShieldCheck, EyeOff } from "lucide-react";

// ====================================================================
// 個人情報非取扱いの明示コンポーネント
// --------------------------------------------------------------------
// 本システムは「入居者・顧客個人を特定する情報（氏名・電話・メール・
// 個人住所・生年月日等）を保持／処理しない」設計です。
// AI が受け取るのは部屋探しの【条件情報のみ】であり、個人情報は
// マスキング後も生成AIに到達しません（提案資料スライドの設計方針に準拠）。
//
//  - <PiiFreeBanner />  … 画面上部などに常設する横長バナー
//  - <PiiFreeBadge />   … 表の見出し横などに添える小型バッジ
//  - PII_FREE_NOTE      … 個人情報欄の代替表示テキスト
// ====================================================================

export const PII_FREE_NOTE = "個人情報は本システムでは保持しません";

export function PiiFreeBadge({ className = "" }) {
  return (
    <span
      className={`inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded border bg-secure-light text-secure border-secure/30 ${className}`}
      title="入居者・顧客個人を特定する情報は保持・処理しません"
    >
      <EyeOff className="w-2.5 h-2.5" />
      個人情報なし
    </span>
  );
}

export default function PiiFreeBanner({ variant = "bar" }) {
  if (variant === "compact") {
    return (
      <div className="flex items-center gap-2 text-[10.5px] text-secure bg-secure-light border border-secure/30 rounded px-2.5 py-1.5">
        <ShieldCheck className="w-3.5 h-3.5 flex-shrink-0" />
        <span>
          このフローで AI が扱うのは<strong>部屋探しの条件情報のみ</strong>です。氏名・電話・メール等の個人情報は処理しません。
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 bg-secure-light border-b border-secure/20 px-5 py-1.5">
      <ShieldCheck className="w-3.5 h-3.5 text-secure flex-shrink-0" />
      <span className="text-[11px] text-secure-dark">
        本システムは<strong>個人情報（氏名・連絡先・個人住所等）を取り扱いません</strong>。
        受け付けた依頼は条件情報（エリア・賃料・間取り・入居時期など）に変換して処理し、個人情報は生成AIに渡しません。
      </span>
    </div>
  );
}
