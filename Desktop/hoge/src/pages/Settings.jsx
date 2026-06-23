import React, { useState } from "react";
import {
  User,
  Users,
  Bell,
  Cloud,
  Shield,
  Lock,
  Building2,
  CheckCircle2,
  AlertCircle,
  Fingerprint,
  ShieldCheck,
  BadgeCheck,
  UserPlus,
  Trash2,
  X,
} from "lucide-react";
import { CURRENT_USER, USERS, ROLES, roleBadgeClass } from "../data/usersData";

const TABS = [
  { id: "profile", label: "プロフィール", icon: User },
  // { id: "notifications", label: "通知設定", icon: Bell },
  // { id: "integrations", label: "外部連携", icon: Cloud },
  { id: "roles", label: "権限管理", icon: BadgeCheck },
];

export default function Settings() {
  const [tab, setTab] = useState("profile");

  return (
    <div className="p-5 max-w-5xl">
      <h2 className="text-[16px] font-bold text-slate-900 mb-4">設定</h2>

      <div className="bg-white border border-slate-200 rounded-md overflow-hidden">
        {/* タブ */}
        <div className="flex border-b border-slate-200 bg-slate-50 overflow-x-auto">
          {TABS.map((t) => {
            const Icon = t.icon;
            const isActive = tab === t.id;
            const accentColor =
              t.accent === "ai"
                ? "text-ai-dark"
                : t.accent === "secure"
                ? "text-secure-dark"
                : "text-brand-dark";
            const borderColor =
              t.accent === "ai"
                ? "border-ai"
                : t.accent === "secure"
                ? "border-secure"
                : "border-brand";
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`px-5 py-3 text-[12px] border-b-2 transition inline-flex items-center gap-2 whitespace-nowrap ${
                  isActive
                    ? `${borderColor} ${accentColor} font-bold bg-white`
                    : "border-transparent text-slate-600 hover:text-slate-900"
                }`}
              >
                <Icon className="w-4 h-4" />
                {t.label}
              </button>
            );
          })}
        </div>

        <div className="p-6">
          {/* ===================== プロフィール ===================== */}
          {tab === "profile" && (
            <div>
              <div className="flex items-start gap-4 pb-5 border-b border-slate-100">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-sky-400 to-sky-600 text-white text-[20px] font-bold flex items-center justify-center">
                  {CURRENT_USER.avatar}
                </div>
                <div className="flex-1">
                  <div className="text-[16px] font-bold text-slate-900">
                    {CURRENT_USER.name}
                  </div>
                  <div className="text-[12px] text-slate-500 mt-0.5">
                    {CURRENT_USER.department} ／ {CURRENT_USER.office}
                  </div>
                  <div className="mt-2 flex gap-1.5 flex-wrap">
                    <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 bg-secure-light text-secure-dark border border-secure/20 rounded">
                      <Lock className="w-2.5 h-2.5" />
                      Azure AD SSO
                    </span>
                    <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 bg-secure-light text-secure-dark border border-secure/20 rounded">
                      <Fingerprint className="w-2.5 h-2.5" />
                      MFA 有効
                    </span>
                    <span className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-600 border border-slate-200 rounded">
                      {CURRENT_USER.role}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-x-6 gap-y-4 mt-5 text-[12px]">
                <div>
                  <label className="text-[10px] text-slate-500 mb-1 block">氏名</label>
                  <input
                    defaultValue={CURRENT_USER.name}
                    className="w-full px-3 py-2 border border-slate-300 rounded"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 mb-1 block">
                    社員ID
                    <span className="ml-1 text-secure-dark">（Azure AD 連携 / 編集不可）</span>
                  </label>
                  <input
                    defaultValue={CURRENT_USER.id}
                    disabled
                    className="w-full px-3 py-2 border border-slate-200 rounded bg-slate-50 text-slate-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 mb-1 block">
                    メールアドレス
                    <span className="ml-1 text-secure-dark">（Azure AD 連携 / 編集不可）</span>
                  </label>
                  <input
                    defaultValue={CURRENT_USER.email}
                    disabled
                    className="w-full px-3 py-2 border border-slate-200 rounded bg-slate-50 text-slate-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 mb-1 block">所属</label>
                  <select
                    defaultValue={CURRENT_USER.department}
                    className="w-full px-3 py-2 border border-slate-300 rounded"
                  >
                    <option>法人営業部</option>
                    <option>情報システム部</option>
                    <option>内部監査室</option>
                    <option>マーケティング部</option>
                    <option>経営企画部</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 mb-1 block">勤務地</label>
                  <select
                    defaultValue={CURRENT_USER.office}
                    className="w-full px-3 py-2 border border-slate-300 rounded"
                  >
                    <option>東京本社（六本木）</option>
                    <option>大阪支社</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 mb-1 block">権限</label>
                  <input
                    defaultValue={CURRENT_USER.role}
                    disabled
                    className="w-full px-3 py-2 border border-slate-200 rounded bg-slate-50 text-slate-500"
                  />
                </div>
              </div>

              <div className="mt-6 pt-5 border-t border-slate-100 flex justify-end gap-2">
                <button className="px-4 py-2 text-[12px] border border-slate-300 rounded text-slate-700 hover:bg-slate-50">
                  キャンセル
                </button>
                <button className="px-4 py-2 text-[12px] font-bold text-white rounded bg-brand hover:bg-brand-dark">
                  変更を保存
                </button>
              </div>
            </div>
          )}

          {/* ===================== 通知設定 ===================== */}
          {tab === "notifications" && (
            <div className="space-y-5 text-[12px]">
              <div>
                <h3 className="text-[13px] font-bold text-slate-800 mb-2">
                  通知を受け取る対象
                </h3>
                {[
                  { l: "新規依頼を受信したとき", on: true },
                  { l: "案件の対応期限が3日前になったとき", on: true },
                  { l: "案件の対応期限が当日になったとき", on: true },
                  { l: "顧客が提案資料を開封したとき", on: true },
                  { l: "案件が成約に至ったとき", on: false },
                  { l: "セキュリティ：新規場所からのログイン検知", on: true, accent: "secure" },
                  { l: "システムメンテナンス情報", on: true },
                ].map((n, i) => (
                  <label
                    key={i}
                    className="flex items-center justify-between py-2 border-b border-slate-100"
                  >
                    <span className="text-slate-700 flex items-center gap-1.5">
                      {n.accent === "human" && <UserAlertIcon />}
                      {n.accent === "secure" && <ShieldCheck className="w-3 h-3 text-secure" />}
                      {n.l}
                    </span>
                    <input type="checkbox" defaultChecked={n.on} className="rounded text-sky-500" />
                  </label>
                ))}
              </div>
              <div>
                <h3 className="text-[13px] font-bold text-slate-800 mb-2">
                  通知方法
                </h3>
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked className="rounded text-sky-500" />
                    <span className="text-slate-700">アプリ内通知</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked className="rounded text-sky-500" />
                    <span className="text-slate-700">メール通知（{CURRENT_USER.email}）</span>
                  </label>
                  <label className="flex items-center gap-2 opacity-60">
                    <input type="checkbox" disabled className="rounded text-sky-500" />
                    <span className="text-slate-700">Microsoft Teams 通知</span>
                    <span className="text-[10px] px-1.5 py-0.5 bg-slate-200 text-slate-600 rounded">
                      v2予定
                    </span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* ===================== 外部連携 ===================== */}
          {tab === "integrations" && (
            <div className="space-y-3">
              {[
                { name: "Azure Active Directory", icon: Lock, desc: "シングルサインオン（SSO）認証 / MFA", status: "接続中", ok: true },
                { name: "物件マスタ", icon: Building2, desc: "社内の物件管理ツール（PMS / RMS / 設備管理 / SFA）と連携", status: "正常稼働", ok: true },
                { name: "顧客マスタ", icon: Users, desc: "社内の顧客管理ツール（CRM / SFA / 契約管理 / 請求・経理）と連携", status: "正常稼働", ok: true },
                { name: "Salesforce", icon: Cloud, desc: "案件・顧客・活動履歴の双方向連携", status: "未接続（v2予定）", ok: false },
              ].map((s, i) => {
                const Icon = s.icon;
                return (
                  <div
                    key={i}
                    className="flex items-center gap-4 p-4 border border-slate-200 rounded-md"
                  >
                    <div className="w-10 h-10 rounded bg-slate-100 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-slate-600" />
                    </div>
                    <div className="flex-1">
                      <div className="text-[13px] font-bold text-slate-900">{s.name}</div>
                      {s.desc && (
                        <div className="text-[11px] text-slate-500 mt-0.5">{s.desc}</div>
                      )}
                    </div>
                    {s.ok ? (
                      <span className="text-[11px] font-bold px-2 py-1 rounded bg-secure-light text-secure-dark border border-secure/20 inline-flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        {s.status}
                      </span>
                    ) : (
                      <span className="text-[11px] font-bold px-2 py-1 rounded bg-slate-100 text-slate-600 border border-slate-200 inline-flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {s.status}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}


          {/* ===================== 権限管理 ===================== */}
          {tab === "roles" && <RolesTab />}
        </div>
      </div>
    </div>
  );
}

// 小さなインライン人間アラートアイコン
function UserAlertIcon() {
  return (
    <span className="inline-flex items-center justify-center w-3 h-3 rounded-full bg-human-light">
      <AlertCircle className="w-2.5 h-2.5 text-human" />
    </span>
  );
}

// ===================================================================
// 権限管理タブ：ユーザー追加・複数権限から選択
// ===================================================================
function RolesTab() {
  const [users, setUsers] = useState(USERS);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    name: "",
    employeeId: "",
    email: "",
    department: "法人営業部",
    office: "東京本社",
    roleId: "general",
    mfaEnabled: true,
  });

  const resetForm = () =>
    setForm({
      name: "",
      employeeId: "",
      email: "",
      department: "法人営業部",
      office: "東京本社",
      roleId: "general",
      mfaEnabled: true,
    });

  const handleAdd = () => {
    if (!form.name.trim()) return;
    const role = ROLES.find((r) => r.id === form.roleId);
    const newUser = {
      id: form.employeeId || `U-${String(Math.floor(Math.random() * 9000) + 1000)}`,
      name: form.name,
      department: form.department,
      office: form.office,
      roleId: form.roleId,
      role: role?.name || "一般ユーザー",
      mfaEnabled: form.mfaEnabled,
      activeCases: 0,
      proposalsThisMonth: 0,
      online: false,
      lastActivity: "未ログイン",
    };
    setUsers((prev) => [...prev, newUser]);
    resetForm();
    setShowAddForm(false);
  };

  const handleRoleChange = (userId, newRoleId) => {
    const role = ROLES.find((r) => r.id === newRoleId);
    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId ? { ...u, roleId: newRoleId, role: role?.name } : u
      )
    );
    setEditingId(null);
  };

  const handleDelete = (userId) => {
    if (window.confirm("このユーザーを削除しますか？この操作は監査ログに記録されます。")) {
      setUsers((prev) => prev.filter((u) => u.id !== userId));
    }
  };

  // ロール別の人数を集計
  const roleCounts = ROLES.map((r) => ({
    ...r,
    count: users.filter((u) => u.roleId === r.id).length,
  }));

  return (
    <div>
      {/* <div className="bg-human-light/40 border border-human/20 rounded p-3 mb-4 flex items-center gap-2 text-[11px] text-human-dark">
        <Shield className="w-4 h-4" />
        権限変更・ユーザー追加は管理者操作です。すべての変更は操作ログに記録されます。
      </div> */}

      {/* ロール別カウント */}
      <h3 className="text-[13px] font-bold text-slate-800 mb-2">
        権限ロール（{ROLES.length} 種類）
      </h3>
      <div className="grid grid-cols-5 gap-2 mb-5">
        {roleCounts.map((r) => (
          <div key={r.id} className="p-3 border border-slate-200 rounded-md">
            <div className="flex items-center justify-between mb-1">
              <span
                className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${roleBadgeClass(
                  r.id
                )}`}
              >
                {r.name}
              </span>
            </div>
            <div className="text-[18px] font-bold text-slate-900">
              {r.count}
              <span className="text-[10px] font-normal text-slate-500">名</span>
            </div>
            <div className="text-[9px] text-slate-500 mt-1 leading-tight">
              {r.description}
            </div>
          </div>
        ))}
      </div>

      {/* ヘッダ＋追加ボタン */}
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-[13px] font-bold text-slate-800">
          登録ユーザー一覧（{users.length}名）
        </h3>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-3 py-1.5 text-[12px] font-bold text-white rounded bg-brand hover:bg-brand-dark inline-flex items-center gap-1"
        >
          <UserPlus className="w-3.5 h-3.5" />
          ユーザーを追加
        </button>
      </div>

      {/* 追加フォーム */}
      {showAddForm && (
        <div className="bg-sky-50/50 border border-sky-200 rounded-md p-4 mb-3">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-[13px] font-bold text-sky-900">
              新規ユーザーの追加
            </h4>
            <button
              onClick={() => {
                setShowAddForm(false);
                resetForm();
              }}
              className="text-slate-400 hover:text-slate-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-[12px]">
            <div>
              <label className="text-[10px] text-slate-500 mb-1 block">
                氏名 <span className="text-rose-500">*</span>
              </label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="例：山田 太郎"
                className="w-full px-3 py-2 border border-slate-300 rounded bg-white"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-500 mb-1 block">
                社員ID
                <span className="text-[9px] text-slate-400 ml-1">
                  （未入力時は自動採番）
                </span>
              </label>
              <input
                value={form.employeeId}
                onChange={(e) =>
                  setForm({ ...form, employeeId: e.target.value })
                }
                placeholder="例：U-0050"
                className="w-full px-3 py-2 border border-slate-300 rounded bg-white font-mono"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-500 mb-1 block">
                メールアドレス
              </label>
              <input
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="例：yamada.taro@example.com"
                className="w-full px-3 py-2 border border-slate-300 rounded bg-white"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-500 mb-1 block">所属</label>
              <select
                value={form.department}
                onChange={(e) =>
                  setForm({ ...form, department: e.target.value })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded bg-white"
              >
                <option>法人営業部</option>
                <option>情報システム部</option>
                <option>内部監査室</option>
                <option>マーケティング部</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] text-slate-500 mb-1 block">勤務地</label>
              <select
                value={form.office}
                onChange={(e) => setForm({ ...form, office: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded bg-white"
              >
                <option>東京本社</option>
                <option>大阪支社</option>
                <option>名古屋支社</option>
                <option>福岡支社</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] text-slate-500 mb-1 block">
                権限 <span className="text-rose-500">*</span>
              </label>
              <select
                value={form.roleId}
                onChange={(e) => setForm({ ...form, roleId: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded bg-white"
              >
                {ROLES.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
              <div className="text-[10px] text-slate-500 mt-1">
                {ROLES.find((r) => r.id === form.roleId)?.description}
              </div>
            </div>
            <div className="col-span-2">
              <label className="flex items-center gap-2 text-[12px] py-2">
                <input
                  type="checkbox"
                  checked={form.mfaEnabled}
                  onChange={(e) =>
                    setForm({ ...form, mfaEnabled: e.target.checked })
                  }
                  className="rounded text-secure"
                />
                <Fingerprint className="w-3.5 h-3.5 text-secure" />
                <span>多要素認証（MFA）を必須にする（推奨）</span>
              </label>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-sky-200">
            <button
              onClick={() => {
                setShowAddForm(false);
                resetForm();
              }}
              className="px-3 py-1.5 text-[12px] border border-slate-300 rounded text-slate-700 hover:bg-slate-50"
            >
              キャンセル
            </button>
            <button
              onClick={handleAdd}
              disabled={!form.name.trim()}
              className="px-4 py-1.5 text-[12px] font-bold text-white rounded bg-brand hover:bg-brand-dark disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ユーザーを追加
            </button>
          </div>
        </div>
      )}

      {/* ユーザー一覧テーブル */}
      <table className="w-full text-[12px]">
        <thead className="bg-slate-50">
          <tr className="text-left text-slate-600 border-b border-slate-200">
            <th className="px-3 py-2 font-medium">氏名</th>
            <th className="px-3 py-2 font-medium">社員ID</th>
            <th className="px-3 py-2 font-medium">所属</th>
            <th className="px-3 py-2 font-medium">勤務地</th>
            <th className="px-3 py-2 font-medium">権限</th>
            <th className="px-3 py-2 font-medium">
              <span className="inline-flex items-center gap-0.5">
                <Fingerprint className="w-3 h-3 text-secure" />
                MFA
              </span>
            </th>
            <th className="px-3 py-2 font-medium">状態</th>
            <th className="px-3 py-2 font-medium w-8"></th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id} className="border-b border-slate-100 hover:bg-slate-50">
              <td className="px-3 py-2.5 font-medium text-slate-800">{u.name}</td>
              <td className="px-3 py-2.5 font-mono text-[10px] text-slate-500">
                {u.id}
              </td>
              <td className="px-3 py-2.5 text-slate-700">{u.department}</td>
              <td className="px-3 py-2.5 text-slate-700">{u.office}</td>
              <td className="px-3 py-2.5">
                {editingId === u.id ? (
                  <select
                    value={u.roleId}
                    onChange={(e) => handleRoleChange(u.id, e.target.value)}
                    onBlur={() => setEditingId(null)}
                    autoFocus
                    className="text-[11px] border border-slate-300 rounded px-1.5 py-0.5 bg-white"
                  >
                    {ROLES.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <button
                    onClick={() => setEditingId(u.id)}
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded hover:ring-1 hover:ring-slate-300 ${roleBadgeClass(
                      u.roleId
                    )}`}
                    title="クリックして変更"
                  >
                    {u.role}
                  </button>
                )}
              </td>
              <td className="px-3 py-2.5">
                {u.mfaEnabled && (
                  <CheckCircle2 className="w-3.5 h-3.5 text-secure" />
                )}
              </td>
              <td className="px-3 py-2.5">
                <span className="inline-flex items-center gap-1 text-[10px]">
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      u.online ? "bg-emerald-500" : "bg-slate-300"
                    }`}
                  />
                  {u.online ? "オンライン" : u.lastActivity}
                </span>
              </td>
              <td className="px-3 py-2.5">
                <button
                  onClick={() => handleDelete(u.id)}
                  className="w-6 h-6 inline-flex items-center justify-center rounded hover:bg-rose-50 text-slate-400 hover:text-rose-600"
                  title="ユーザー削除（監査ログ記録）"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-2 text-[10px] text-slate-500">
        ※ 権限バッジをクリックすると、その場で権限を変更できます。
      </div>
    </div>
  );
}
