"use client";

import React, { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { 
  ShieldCheck, 
  Users, 
  Building2, 
  Award, 
  Clock, 
  CheckCircle2, 
  Layers, 
  FileText,
  AlertCircle,
  Edit2,
  Check,
  X
} from "lucide-react";

export default function AdminPortalPage() {
  const { lang, t, fmtNum, user, setUser } = useApp();

  const [activeTab, setActiveTab] = useState<"users" | "orgs" | "audit">("users");

  const [users, setUsers] = useState<any[]>([]);
  const [orgs, setOrgs] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [counts, setCounts] = useState<any>({
    totalUsers: 0,
    students: 0,
    organizations: 0,
    credentialsIssued: 0,
    missionsEvaluated: 0,
  });
  const [loading, setLoading] = useState(true);

  // Admin Self-Name Edit State
  const [isEditingAdminName, setIsEditingAdminName] = useState(false);
  const [adminName, setAdminName] = useState(user?.name || "");
  const [savingAdminName, setSavingAdminName] = useState(false);

  // User Row Name Edit State
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [userNewName, setUserNewName] = useState("");
  const [savingUserId, setSavingUserId] = useState<string | null>(null);

  useEffect(() => {
    if (user?.name) setAdminName(user.name);
    fetchAuditData();
    fetchUsers();
    fetchOrgs();
  }, [user?.name]);

  const fetchAuditData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/audit");
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs || []);
        if (data.counts) setCounts(data.counts);
      }
    } catch (err) {
      console.error("Fetch audit error:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/admin/users");
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
      }
    } catch (err) {
      console.error("Fetch users error:", err);
    }
  };

  const fetchOrgs = async () => {
    try {
      const res = await fetch("/api/admin/orgs");
      if (res.ok) {
        const data = await res.json();
        setOrgs(data.orgs || []);
      }
    } catch (err) {
      console.error("Fetch orgs error:", err);
    }
  };

  const handleVerifyOrg = async (orgId: string, currentStatus: boolean) => {
    try {
      await fetch("/api/admin/orgs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organizationId: orgId,
          isVerified: !currentStatus,
        }),
      });
      fetchOrgs();
    } catch (err) {
      console.error("Verify org error:", err);
    }
  };

  // Bug 6 Fix: Save admin's own name
  const handleSaveAdminName = async () => {
    if (!adminName.trim() || adminName.trim().length < 2) return;
    setSavingAdminName(true);
    try {
      const res = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: adminName.trim() }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.user) setUser(data.user);
        setIsEditingAdminName(false);
      }
    } catch (err) {
      console.error("Save admin name error:", err);
    } finally {
      setSavingAdminName(false);
    }
  };

  // Bug 6 Fix: Save student/user name by admin
  const handleSaveUserName = async (targetUserId: string) => {
    if (!userNewName.trim() || userNewName.trim().length < 2) return;
    setSavingUserId(targetUserId);
    try {
      const res = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: userNewName.trim(),
          targetUserId,
        }),
      });
      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) => (u.id === targetUserId ? { ...u, name: userNewName.trim() } : u))
        );
        setEditingUserId(null);
        setUserNewName("");
      }
    } catch (err) {
      console.error("Save user name error:", err);
    } finally {
      setSavingUserId(null);
    }
  };

  return (
    <div className="flex-1 w-full max-w-[96%] 2xl:max-w-[95%] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* -------------------------------------------------------------
          Admin Header with Editable Admin Display Name
      ------------------------------------------------------------- */}
      <div className="p-6 rounded-2xl bg-white dark:bg-brand-darkCard border border-brand-sage/70 dark:border-brand-onyx shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-amber-600 dark:text-brand-yellow uppercase mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Platform Administration & Security Governance</span>
          </div>
          <h1 className="text-2xl font-extrabold text-brand-black dark:text-brand-cream tracking-tight">
            {t("adminTitle")}
          </h1>
          <p className="text-xs text-brand-onyx dark:text-brand-sage mt-0.5">
            {t("adminSubtitle")}
          </p>
        </div>

        {/* Admin Self Profile Name Editor */}
        <div className="p-3 rounded-xl bg-brand-cream/40 dark:bg-brand-onyx/40 border border-brand-sage/60 dark:border-brand-onyx text-xs">
          <span className="text-[10px] font-bold text-brand-onyx/70 dark:text-brand-sage/70 block uppercase mb-1">
            Signed in Administrator
          </span>
          {isEditingAdminName ? (
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={adminName}
                onChange={(e) => setAdminName(e.target.value)}
                className="px-2.5 py-1 rounded-lg border border-brand-yellow text-xs font-bold bg-white dark:bg-brand-card text-brand-black dark:text-brand-cream focus:outline-hidden"
              />
              <button
                type="button"
                onClick={handleSaveAdminName}
                disabled={savingAdminName}
                className="p-1.5 rounded-lg bg-brand-yellow text-brand-black hover:bg-amber-400 font-bold"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsEditingAdminName(false);
                  setAdminName(user?.name || "");
                }}
                className="p-1.5 rounded-lg text-brand-onyx/70 hover:text-brand-black dark:text-brand-sage dark:hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-brand-black dark:text-brand-cream">
                {user?.name || "System Admin"}
              </span>
              <button
                type="button"
                onClick={() => setIsEditingAdminName(true)}
                className="p-1 rounded-md text-brand-onyx/60 hover:text-brand-black dark:text-brand-sage/60 dark:hover:text-brand-yellow"
                title="Edit administrator display name"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* -------------------------------------------------------------
          Real Platform Metrics
      ------------------------------------------------------------- */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="p-4 rounded-xl bg-white dark:bg-brand-darkCard border border-brand-sage/60 dark:border-brand-onyx">
          <span className="text-[10px] font-bold uppercase tracking-wider text-brand-onyx/60 dark:text-brand-sage/60 block">
            {t("statTotalUsers")}
          </span>
          <span className="text-2xl font-extrabold text-brand-black dark:text-brand-cream">
            {fmtNum(counts.totalUsers)}
          </span>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-brand-darkCard border border-brand-sage/60 dark:border-brand-onyx">
          <span className="text-[10px] font-bold uppercase tracking-wider text-brand-onyx/60 dark:text-brand-sage/60 block">
            {t("statActiveStudents")}
          </span>
          <span className="text-2xl font-extrabold text-brand-black dark:text-brand-cream">
            {fmtNum(counts.students)}
          </span>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-brand-darkCard border border-brand-sage/60 dark:border-brand-onyx">
          <span className="text-[10px] font-bold uppercase tracking-wider text-brand-onyx/60 dark:text-brand-sage/60 block">
            {t("statOrganizations")}
          </span>
          <span className="text-2xl font-extrabold text-brand-black dark:text-brand-cream">
            {fmtNum(counts.organizations)}
          </span>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-brand-darkCard border border-brand-sage/60 dark:border-brand-onyx">
          <span className="text-[10px] font-bold uppercase tracking-wider text-brand-onyx/60 dark:text-brand-sage/60 block">
            {t("statCredentialsIssued")}
          </span>
          <span className="text-2xl font-extrabold text-amber-600 dark:text-brand-yellow">
            {fmtNum(counts.credentialsIssued)}
          </span>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-brand-darkCard border border-brand-sage/60 dark:border-brand-onyx">
          <span className="text-[10px] font-bold uppercase tracking-wider text-brand-onyx/60 dark:text-brand-sage/60 block">
            Missions Evaluated
          </span>
          <span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
            {fmtNum(counts.missionsEvaluated)}
          </span>
        </div>
      </div>

      {/* -------------------------------------------------------------
          Admin Tabs
      ------------------------------------------------------------- */}
      <div className="flex border-b border-brand-sage/50 dark:border-brand-onyx space-x-4">
        <button
          onClick={() => setActiveTab("users")}
          className={`pb-3 px-3 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center space-x-1.5 ${
            activeTab === "users"
              ? "border-brand-yellow text-brand-black dark:text-brand-yellow"
              : "border-transparent text-brand-onyx/70 dark:text-brand-sage/70 hover:text-brand-black dark:hover:text-brand-cream"
          }`}
        >
          <Users className="w-4 h-4" />
          <span>{t("tabUsers")} ({users.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("orgs")}
          className={`pb-3 px-3 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center space-x-1.5 ${
            activeTab === "orgs"
              ? "border-brand-yellow text-brand-black dark:text-brand-yellow"
              : "border-transparent text-brand-onyx/70 dark:text-brand-sage/70 hover:text-brand-black dark:hover:text-brand-cream"
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>{t("tabOrgs")} ({orgs.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("audit")}
          className={`pb-3 px-3 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center space-x-1.5 ${
            activeTab === "audit"
              ? "border-brand-yellow text-brand-black dark:text-brand-yellow"
              : "border-transparent text-brand-onyx/70 dark:text-brand-sage/70 hover:text-brand-black dark:hover:text-brand-cream"
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>{t("tabAudit")} ({logs.length})</span>
        </button>
      </div>

      {/* -------------------------------------------------------------
          TAB 1: Users (With Edit Name Actions)
      ------------------------------------------------------------- */}
      {activeTab === "users" && (
        <div className="p-6 rounded-2xl bg-white dark:bg-brand-darkCard border border-brand-sage/70 dark:border-brand-onyx shadow-xs overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-brand-cream dark:bg-brand-onyx font-bold text-brand-black dark:text-brand-cream border-b border-brand-sage/50 dark:border-brand-onyx">
              <tr>
                <th className="p-3">Name & Email</th>
                <th className="p-3">Role</th>
                <th className="p-3">Affiliation</th>
                <th className="p-3">Verified Credentials</th>
                <th className="p-3">Joined</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-sage/40 dark:divide-brand-onyx">
              {users.map((u) => {
                const isEditingThisUser = editingUserId === u.id;

                return (
                  <tr key={u.id} className="hover:bg-brand-cream/20 dark:hover:bg-brand-onyx/40 transition-colors">
                    <td className="p-3">
                      {isEditingThisUser ? (
                        <div className="flex items-center space-x-2">
                          <input
                            type="text"
                            value={userNewName}
                            onChange={(e) => setUserNewName(e.target.value)}
                            className="px-2 py-1 rounded border border-brand-yellow text-xs font-bold bg-white dark:bg-brand-card text-brand-black dark:text-brand-cream focus:outline-hidden"
                          />
                          <button
                            type="button"
                            onClick={() => handleSaveUserName(u.id)}
                            disabled={savingUserId === u.id}
                            className="p-1 rounded bg-brand-yellow text-brand-black hover:bg-amber-400 font-bold"
                          >
                            <Check className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingUserId(null);
                              setUserNewName("");
                            }}
                            className="p-1 rounded text-brand-onyx/60 hover:text-brand-black dark:text-brand-sage dark:hover:text-white"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <div>
                          <span className="font-bold block text-brand-black dark:text-brand-cream">{u.name}</span>
                          <span className="text-[11px] text-brand-onyx/70 dark:text-brand-sage/70">{u.email}</span>
                        </div>
                      )}
                    </td>
                    <td className="p-3">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-brand-cream dark:bg-brand-onyx text-brand-black dark:text-brand-cream uppercase">
                        {u.role}
                      </span>
                    </td>
                    <td className="p-3 text-brand-onyx/80 dark:text-brand-sage/80">
                      {u.studentProfile?.university || "Industry Organization"}
                    </td>
                    <td className="p-3 font-semibold text-amber-600 dark:text-brand-yellow">
                      {u._count?.credentials || 0} credentials
                    </td>
                    <td className="p-3 text-brand-onyx/60 dark:text-brand-sage/60">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-3 text-right">
                      {!isEditingThisUser && (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingUserId(u.id);
                            setUserNewName(u.name);
                          }}
                          className="px-2 py-1 rounded-lg bg-brand-cream dark:bg-brand-onyx hover:bg-brand-sage/40 text-[11px] font-semibold text-brand-black dark:text-brand-cream border border-brand-sage/60 dark:border-brand-onyx transition-colors inline-flex items-center space-x-1"
                        >
                          <Edit2 className="w-3 h-3 text-amber-500" />
                          <span>Edit Name</span>
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* -------------------------------------------------------------
          TAB 2: Organizations
      ------------------------------------------------------------- */}
      {activeTab === "orgs" && (
        <div className="space-y-4">
          {orgs.map((org) => (
            <div
              key={org.id}
              className="p-5 rounded-2xl bg-white dark:bg-brand-darkCard border border-brand-sage/70 dark:border-brand-onyx shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div>
                <div className="flex items-center space-x-2 mb-1">
                  <h3 className="text-base font-bold text-brand-black dark:text-brand-cream">
                    {org.name}
                  </h3>
                  {org.isVerified ? (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                      ✓ Verified
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                      Pending Verification
                    </span>
                  )}
                </div>
                <p className="text-xs text-brand-onyx dark:text-brand-sage">
                  {org.industry} • {org.size} Employees • Active Jobs: {org._count?.jobs || 0}
                </p>
              </div>

              <button
                onClick={() => handleVerifyOrg(org.id, org.isVerified)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                  org.isVerified
                    ? "bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-900"
                    : "bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs"
                }`}
              >
                {org.isVerified ? "Revoke Verification" : t("btnVerifyOrg")}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* -------------------------------------------------------------
          TAB 3: Audit Logs
      ------------------------------------------------------------- */}
      {activeTab === "audit" && (
        <div className="p-6 rounded-2xl bg-white dark:bg-brand-darkCard border border-brand-sage/70 dark:border-brand-onyx shadow-xs overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-brand-cream dark:bg-brand-onyx font-bold text-brand-black dark:text-brand-cream border-b border-brand-sage/50 dark:border-brand-onyx">
              <tr>
                <th className="p-3">Timestamp</th>
                <th className="p-3">User</th>
                <th className="p-3">Security Action</th>
                <th className="p-3">Resource</th>
                <th className="p-3">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-sage/40 dark:divide-brand-onyx">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-brand-cream/20 dark:hover:bg-brand-onyx/40 transition-colors">
                  <td className="p-3 text-brand-onyx/70 dark:text-brand-sage/70 whitespace-nowrap">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                  <td className="p-3 font-semibold text-brand-black dark:text-brand-cream">
                    {log.user?.name || log.userId || "System"}
                  </td>
                  <td className="p-3">
                    <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-brand-cream dark:bg-brand-onyx text-brand-black dark:text-brand-cream">
                      {log.action}
                    </span>
                  </td>
                  <td className="p-3 text-brand-onyx/80 dark:text-brand-sage/80">
                    {log.resourceType || "—"}
                  </td>
                  <td className="p-3 text-brand-onyx/80 dark:text-brand-sage/80 max-w-xs truncate">
                    {log.details || "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
