import React from "react";
import { db, auth, collection, addDoc, onSnapshot, query, orderBy, deleteDoc, doc, setDoc, Timestamp, handleFirestoreError, OperationType } from "../firebase";
import { Plus, Trash2, Edit2, Save, X, Activity, Users, Mic2, Camera, ShieldCheck, Quote } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

import { useAuth } from "../hooks/useAuth";

export default function AdminDashboard() {
  const { isAdmin: authIsAdmin, user: authUser } = useAuth();
  const [loading, setLoading] = React.useState(true);
  const [activeTab, setActiveTab] = React.useState<"users" | "audit">("audit");

  // Users State
  const [users, setUsers] = React.useState<any[]>([]);

  // Audit Logs State
  const [auditLogs, setAuditLogs] = React.useState<any[]>([]);

  React.useEffect(() => {
    if (authUser !== undefined) {
      setLoading(false);
    }
  }, [authUser]);

  React.useEffect(() => {
    if (!authIsAdmin || !db) return;

    const unsubUsers = onSnapshot(collection(db, "users"), (snapshot) => {
      setUsers(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    const unsubAudit = onSnapshot(query(collection(db, "admin_logs"), orderBy("timestamp", "desc")), (snapshot) => {
      setAuditLogs(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    return () => {
      unsubUsers?.();
      unsubAudit?.();
    };
  }, [authIsAdmin]);

  const logAdminAction = async (action: string, target: string) => {
    if (!db || !auth?.currentUser) return;
    try {
      await addDoc(collection(db, "admin_logs"), {
        adminUid: auth.currentUser.uid,
        action,
        target,
        timestamp: Timestamp.now()
      });
    } catch (err) {
      console.error("Failed to log admin action", err);
    }
  };

  const handleUpdateUserRole = async (userId: string, role: string) => {
    if (!db) return;
    try {
      await setDoc(doc(db, "users", userId), { role }, { merge: true });
      await logAdminAction("UPDATE_USER_ROLE", `${userId} to ${role}`);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${userId}`);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;

  if (!authIsAdmin) {
    return (
      <div className="text-center py-20 space-y-4">
        <ShieldCheck size={64} className="mx-auto text-red-500" />
        <h2 className="text-3xl font-bold">Access Denied</h2>
        <p className="text-muted-foreground">You do not have administrative privileges to access this dashboard.</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-serif font-bold text-primary">Security & Admin</h1>
          <p className="text-muted-foreground font-medium">High-level security monitoring and user management.</p>
        </div>
        <div className="flex bg-muted p-1 rounded-2xl overflow-x-auto">
          {(["audit", "users"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${
                activeTab === tab ? "bg-white dark:bg-zinc-800 shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab === "audit" ? "Security Audit" : "User Management"}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-card border border-border rounded-[2.5rem] p-8 shadow-sm">
        {activeTab === "users" && (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold flex items-center space-x-2">
                <Users className="text-primary" />
                <span>User Management</span>
              </h2>
            </div>

            <div className="space-y-4">
              {users.map((user) => (
                <div key={user.id} className="p-6 bg-muted/50 rounded-2xl border border-border flex justify-between items-center">
                  <div className="space-y-1">
                    <h3 className="font-bold text-lg">{user.displayName || "Anonymous"}</h3>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-primary/10 text-primary rounded-full uppercase">
                      {user.role || "member"}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <select
                      value={user.role || "member"}
                      onChange={(e) => handleUpdateUserRole(user.id, e.target.value)}
                      className="px-3 py-1.5 bg-white border border-border rounded-lg text-xs font-bold outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="member">Member</option>
                      <option value="staff">Staff</option>
                      <option value="social_media_manager">Social Media Manager</option>
                      <option value="youth_leader">Youth Leader</option>
                      <option value="ministry_head">Ministry Head</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "audit" && (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold flex items-center space-x-2">
                <ShieldCheck className="text-primary" />
                <span>Security Audit Logs</span>
              </h2>
            </div>

            <div className="space-y-2">
              {auditLogs.map((log) => (
                <div key={log.id} className="p-4 bg-muted/30 rounded-xl border border-border flex justify-between items-center text-xs">
                  <div className="flex items-center space-x-4">
                    <span className="font-mono text-primary font-bold">{log.action}</span>
                    <span className="text-muted-foreground">Target: <span className="text-foreground font-bold">{log.target}</span></span>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{log.timestamp?.toDate()?.toLocaleString()}</p>
                    <p className="text-[10px] opacity-50">{log.adminUid}</p>
                  </div>
                </div>
              ))}
              {auditLogs.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  No audit logs found.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
