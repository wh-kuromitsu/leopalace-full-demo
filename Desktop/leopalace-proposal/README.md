# レオパレス21様 顧客提案支援システム（モック）

法人顧客向け物件提案業務（依頼受領 → 検索条件設定 → 物件選定 → 提案資料出力）を一気通貫で支援する社内Webシステムのモック。

## 設計思想（3つの軸）

このモックは以下の3軸を念頭に設計されています：

| 軸 | 内容 | 主な表現 |
|---|---|---|
| **A. 自動化** | 人手作業を最小化し、AIが下処理する | AI抽出・自動分類・確信度・推薦理由・自動下書き・「○h削減」可視化 |
| **B. 人間が判断** | AIに任せ過ぎず、最終判断は人間 | 要確認バッジ・修正履歴・選定理由メモ・2段階承認・送付前確認・人間確認済バッジ |
| **C. 認証・セキュリティ** | エンタープライズ水準のガバナンス | Azure AD SSO + MFA・セッション管理・PIIマスキング・改ざん検知ハッシュ・WORM保管・操作ログ透明性 |

色軸：
- **AI機能** = `ai` 色（紫系 #7c3aed）
- **人間判断・要確認** = `human` 色（琥珀系 #d97706）
- **セキュリティ** = `secure` 色（緑系 #059669）

## ディレクトリ構成

```
.
├── index.html
├── middleware.js              # Azure AD SSO検証用の雛形（監査要件コメント付き）
├── package-lock.json
├── package.json
├── README.md
├── src
│   ├── App.css
│   ├── App.jsx                # 11ページのルーティング
│   ├── components             # 4ファイル
│   │   ├── Header.jsx         # AI処理中・セッション情報ドロップダウン
│   │   ├── PropertyMap.jsx
│   │   ├── Sidebar.jsx        # メニュー権限・確認待ち件数・セッション残時間
│   │   └── PendingCasesPanel.jsx
│   ├── data                   # 6ファイル
│   │   ├── casesData.js       # AI分類・人間確認・機密度を追加
│   │   ├── customersData.js   # AIインサイト・PII マスキング
│   │   ├── propertiesData.js  # AI市場分析・暗号化情報
│   │   ├── regulationsData.js # AI解釈・変更履歴
│   │   ├── salesforceData.js  # 認証詳細
│   │   └── usersData.js       # SSO/MFA/セッション
│   ├── index.css
│   ├── main.jsx
│   └── pages                  # 11ファイル
│       ├── Cases.jsx
│       ├── Customers.jsx
│       ├── Dashboard.jsx
│       ├── Logs.jsx           # 改ざん検知ハッシュ・WORM保管
│       ├── Notifications.jsx
│       ├── Properties.jsx
│       ├── Proposal.jsx       # 4ステップフロー（力作）
│       ├── ProposalHistory.jsx
│       ├── SalesforceSync.jsx
│       ├── Settings.jsx       # 6タブ（AI機能・セキュリティ含む）
│       └── Templates.jsx
├── vercel.json                # セキュリティヘッダ設定
└── vite.config.js
```

## セットアップ

```bash
npm install
npm run dev
```

## 技術スタック

- Vite + React 18
- TailwindCSS 3（独自カラー：brand / ai / human / secure）
- lucide-react
- MapLibre GL JS（地図。スタイルは `src/data/mapStyle.js`／APIキー不要の OSM ラスタタイル）

## デプロイ

Vercel 前提。`middleware.js` に Azure AD SSO 検証を後付け。
`vercel.json` に基本セキュリティヘッダ（X-Frame-Options 等）を設定済み。

## 改修履歴（S0〜S5）

本モックは手順書に沿って以下を実装済み（各段階で `npm run build` 確認済み）。

- **S0 個人情報スイープ**：全画面・データから入居者/顧客の個人情報（氏名・個人電話・個人メール・緊急連絡先）を除去。`PiiFreeBanner` を全ページ常設。法人公開情報（代表電話・公式サイト等）のみ保持。
- **S1 インプット自動読込＋確信度ゲート**：STEP2 に依頼ファイル取込→AI抽出→初期値化。`CONFIDENCE_THRESHOLD = 0.97` 未満は「要確認」、人間確認まで次へ進めない。確認者・時刻も記録。
- **S2 社内→顧客 表現変換**：`expressionMap.js` の対訳辞書で社内特記を顧客向けに変換。STEP3 に対訳パネル（編集可・低確信度/未登録は要確認）。
- **S3 出力形式選択**：PowerPoint テンプレ（T-006）と出力ボタン、PPTプレビュー。地図ピン⇔リストを通し番号で連動。全形式は件数に関わらず選択可。
- **S4 送付側 初期表示ルール**：`recommendInitialView()` が候補件数・急ぎフラグで初期表示形式を自動提案（手動上書き可）。共有ペイロードに `initialView` を保持。
- **S5 受取側ビュー**：`RecipientView.jsx`（Sidebar「受取側プレビュー」）。リンク→PW開封（モックPW 1234）→初期表示→お気に入り/追加質問/「ここが惜しい」/契約申込。個人情報は収集しない。送付者への申し送りサマリ付き。

**非実装（方針）**：法人規定PDFの事前学習は自動化しない。S1の確信度しきい値・読込件数は要確認事項。

- **S6 地図ライブラリ移行（Leaflet → MapLibre GL JS）**：`Proposal.jsx`（提案STEP・価格ピン地図）と `RecipientView.jsx`（受取側 地図検索）の地図実装を react-leaflet から MapLibre GL JS に置換。スタイルは APIキー不要の OSM ラスタタイルを共有モジュール `src/data/mapStyle.js` に集約。価格ピン／番号ピンはカスタムDOMマーカー、ホバー詳細は `maplibregl.Popup` で再現。座標順は MapLibre 仕様の `[経度, 緯度]` に統一。物件範囲への自動フィット（`fitBounds`）も移植済み。`PropertyMap.jsx`（自前SVGマップ）は地図ライブラリ非依存のため変更なし。
