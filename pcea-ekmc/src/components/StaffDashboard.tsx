import React from "react";
import { db, auth, collection, addDoc, onSnapshot, query, orderBy, deleteDoc, doc, updateDoc, Timestamp, handleFirestoreError, OperationType } from "../firebase";
import { Plus, Trash2, Edit2, Save, X, Activity, Users, Mic2, Camera, Quote, ShieldAlert } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function StaffDashboard() {
  const [isStaff, setIsStaff] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [activeTab, setActiveTab] = React.useState<"activities" | "leadership" | "media" | "testimonies">("activities");

  // Activities State
  const [activities, setActivities] = React.useState<any[]>([]);
  const [isAddingActivity, setIsAddingActivity] = React.useState(false);
  const [newActivity, setNewActivity] = React.useState({
    title: "",
    date: "",
    description: "",
    category: "General",
    iconName: "Activity"
  });

  // Leadership State
  const [leadership, setLeadership] = React.useState<any[]>([]);
  const [isAddingLeadership, setIsAddingLeadership] = React.useState(false);
  const [newLeadership, setNewLeadership] = React.useState({
    title: "",
    items: "",
    iconName: "Users"
  });

  // Testimonies State
  const [testimonies, setTestimonies] = React.useState<any[]>([]);

  React.useEffect(() => {
    const unsubscribe = auth?.onAuthStateChanged(async (user) => {
      if (user && db) {
        // Check if user is admin or staff
        if (user.email === "josephnyagah34@gmail.com") {
          setIsStaff(true);
        } else {
          const q = query(collection(db, "users"));
          onSnapshot(q, (snapshot) => {
            const member = snapshot.docs.find(d => d.id === user.uid);
            const role = member?.data()?.role;
            if (role === "admin" || role === "staff" || role === "youth_leader" || role === "ministry_head") {
              setIsStaff(true);
            }
          });
        }
      }
      setLoading(false);
    });

    return () => unsubscribe?.();
  }, []);

  React.useEffect(() => {
    if (!isStaff || !db) return;

    const unsubActivities = onSnapshot(query(collection(db, "activities"), orderBy("date", "desc")), (snapshot) => {
      setActivities(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    const unsubLeadership = onSnapshot(collection(db, "leadership"), (snapshot) => {
      setLeadership(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    const unsubTestimonies = onSnapshot(query(collection(db, "testimonies"), orderBy("createdAt", "desc")), (snapshot) => {
      setTestimonies(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    return () => {
      unsubActivities?.();
      unsubLeadership?.();
      unsubTestimonies?.();
    };
  }, [isStaff]);

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

  const handleAddActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db) return;
    try {
      await addDoc(collection(db, "activities"), {
        ...newActivity,
        createdAt: Timestamp.now()
      });
      await logAdminAction("CREATE_ACTIVITY", newActivity.title);
      setIsAddingActivity(false);
      setNewActivity({ title: "", date: "", description: "", category: "General", iconName: "Activity" });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, "activities");
    }
  };

  const handleDeleteActivity = async (id: string, title: string) => {
    if (!db) return;
    if (!window.confirm("Are you sure you want to delete this activity?")) return;
    try {
      await deleteDoc(doc(db, "activities", id));
      await logAdminAction("DELETE_ACTIVITY", title);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `activities/${id}`);
    }
  };

  const handleAddLeadership = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db) return;
    try {
      await addDoc(collection(db, "leadership"), {
        title: newLeadership.title,
        items: newLeadership.items.split(",").map(i => i.trim()),
        iconName: newLeadership.iconName,
        createdAt: Timestamp.now()
      });
      await logAdminAction("CREATE_LEADERSHIP", newLeadership.title);
      setIsAddingLeadership(false);
      setNewLeadership({ title: "", items: "", iconName: "Users" });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, "leadership");
    }
  };

  const handleDeleteLeadership = async (id: string, title: string) => {
    if (!db) return;
    if (!window.confirm("Are you sure you want to delete this leadership entry?")) return;
    try {
      await deleteDoc(doc(db, "leadership", id));
      await logAdminAction("DELETE_LEADERSHIP", title);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `leadership/${id}`);
    }
  };

  const handleUpdateTestimonyStatus = async (id: string, status: "approved" | "rejected") => {
    if (!db) return;
    try {
      await updateDoc(doc(db, "testimonies", id), { status });
      await logAdminAction(`TESTIMONY_${status.toUpperCase()}`, id);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `testimonies/${id}`);
    }
  };

  const handleDeleteTestimony = async (id: string) => {
    if (!db) return;
    if (!window.confirm("Are you sure you want to delete this testimony?")) return;
    try {
      await deleteDoc(doc(db, "testimonies", id));
      await logAdminAction("DELETE_TESTIMONY", id);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `testimonies/${id}`);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;

  if (!isStaff) {
    return (
      <div className="text-center py-20 space-y-4">
        <ShieldAlert size={64} className="mx-auto text-red-500" />
        <h2 className="text-3xl font-bold">Access Denied</h2>
        <p className="text-muted-foreground">You do not have staff privileges to access this dashboard.</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-serif font-bold text-primary">Staff Dashboard</h1>
          <p className="text-muted-foreground font-medium">Update church content and moderate community data.</p>
        </div>
        <div className="flex bg-muted p-1 rounded-2xl overflow-x-auto">
          {(["activities", "leadership", "media", "testimonies"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${
                activeTab === tab ? "bg-white dark:bg-zinc-800 shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-card border border-border rounded-[2.5rem] p-8 shadow-sm">
        {activeTab === "activities" && (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold flex items-center space-x-2">
                <Activity className="text-primary" />
                <span>Church Activities</span>
              </h2>
              <button
                onClick={() => setIsAddingActivity(true)}
                className="px-4 py-2 bg-primary text-white rounded-full font-bold text-sm flex items-center space-x-2 hover:bg-primary/90 transition-colors"
              >
                <Plus size={18} />
                <span>Add Activity</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {activities.map((activity) => (
                <div key={activity.id} className="p-6 bg-muted/50 rounded-2xl border border-border flex justify-between items-start">
                  <div className="space-y-2">
                    <h3 className="font-bold text-lg">{activity.title}</h3>
                    <p className="text-xs text-muted-foreground font-bold">{activity.date} • {activity.category}</p>
                    <p className="text-sm text-muted-foreground line-clamp-2">{activity.description}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteActivity(activity.id, activity.title)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "leadership" && (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold flex items-center space-x-2">
                <Users className="text-primary" />
                <span>Leadership & Departments</span>
              </h2>
              <button
                onClick={() => setIsAddingLeadership(true)}
                className="px-4 py-2 bg-primary text-white rounded-full font-bold text-sm flex items-center space-x-2 hover:bg-primary/90 transition-colors"
              >
                <Plus size={18} />
                <span>Add Category</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {leadership.map((lead) => (
                <div key={lead.id} className="p-6 bg-muted/50 rounded-2xl border border-border flex justify-between items-start">
                  <div className="space-y-2">
                    <h3 className="font-bold text-lg">{lead.title}</h3>
                    <div className="flex flex-wrap gap-2">
                      {lead.items.map((item: string) => (
                        <span key={item} className="text-[10px] font-bold bg-white px-2 py-1 rounded-full border border-border">{item}</span>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteLeadership(lead.id, lead.title)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "media" && (
          <div className="text-center py-20 space-y-4">
            <Camera size={48} className="mx-auto text-muted-foreground" />
            <h3 className="text-xl font-bold">Media Management</h3>
            <p className="text-muted-foreground">Media management features are coming soon.</p>
          </div>
        )}

        {activeTab === "testimonies" && (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold flex items-center space-x-2">
                <Quote className="text-primary" />
                <span>Testimony Moderation</span>
              </h2>
            </div>

            <div className="space-y-4">
              {testimonies.map((testimony) => (
                <div key={testimony.id} className="p-6 bg-muted/50 rounded-2xl border border-border flex flex-col md:flex-row justify-between gap-6">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-bold text-lg">{testimony.name}</h3>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        testimony.status === 'approved' ? 'bg-green-100 text-green-700' :
                        testimony.status === 'rejected' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {testimony.status}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground italic">"{testimony.content}"</p>
                    <p className="text-[10px] text-muted-foreground">{testimony.createdAt?.toDate()?.toLocaleString()}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {testimony.status !== 'approved' && (
                      <button
                        onClick={() => handleUpdateTestimonyStatus(testimony.id, 'approved')}
                        className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-bold hover:bg-green-700 transition-colors"
                      >
                        Approve
                      </button>
                    )}
                    {testimony.status !== 'rejected' && (
                      <button
                        onClick={() => handleUpdateTestimonyStatus(testimony.id, 'rejected')}
                        className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-bold hover:bg-red-700 transition-colors"
                      >
                        Reject
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteTestimony(testimony.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
              {testimonies.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  No testimonies found.
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Add Activity Modal */}
      <AnimatePresence>
        {isAddingActivity && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white dark:bg-[#1E1E1E] rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl"
            >
              <div className="p-6 border-b border-border bg-primary text-white flex justify-between items-center">
                <h3 className="text-xl font-bold">Add New Activity</h3>
                <button onClick={() => setIsAddingActivity(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleAddActivity} className="p-8 space-y-4">
                <input
                  required
                  placeholder="Activity Title"
                  value={newActivity.title}
                  onChange={e => setNewActivity({...newActivity, title: e.target.value})}
                  className="w-full px-4 py-3 bg-muted rounded-xl border-none focus:ring-2 focus:ring-primary outline-none"
                />
                <input
                  required
                  type="date"
                  value={newActivity.date}
                  onChange={e => setNewActivity({...newActivity, date: e.target.value})}
                  className="w-full px-4 py-3 bg-muted rounded-xl border-none focus:ring-2 focus:ring-primary outline-none"
                />
                <select
                  value={newActivity.category}
                  onChange={e => setNewActivity({...newActivity, category: e.target.value})}
                  className="w-full px-4 py-3 bg-muted rounded-xl border-none focus:ring-2 focus:ring-primary outline-none"
                >
                  <option>General</option>
                  <option>Youth</option>
                  <option>Mission</option>
                  <option>Worship</option>
                  <option>Fellowship</option>
                </select>
                <textarea
                  required
                  placeholder="Description"
                  value={newActivity.description}
                  onChange={e => setNewActivity({...newActivity, description: e.target.value})}
                  rows={3}
                  className="w-full px-4 py-3 bg-muted rounded-xl border-none focus:ring-2 focus:ring-primary outline-none"
                />
                <button type="submit" className="w-full py-4 bg-primary text-white rounded-full font-bold hover:bg-primary/90 transition-colors">
                  Save Activity
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Leadership Modal */}
      <AnimatePresence>
        {isAddingLeadership && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white dark:bg-[#1E1E1E] rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl"
            >
              <div className="p-6 border-b border-border bg-primary text-white flex justify-between items-center">
                <h3 className="text-xl font-bold">Add Leadership Category</h3>
                <button onClick={() => setIsAddingLeadership(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleAddLeadership} className="p-8 space-y-4">
                <input
                  required
                  placeholder="Category Title (e.g., LCC Executive)"
                  value={newLeadership.title}
                  onChange={e => setNewLeadership({...newLeadership, title: e.target.value})}
                  className="w-full px-4 py-3 bg-muted rounded-xl border-none focus:ring-2 focus:ring-primary outline-none"
                />
                <textarea
                  required
                  placeholder="Items (comma separated, e.g., Chairman, Treasurer)"
                  value={newLeadership.items}
                  onChange={e => setNewLeadership({...newLeadership, items: e.target.value})}
                  rows={3}
                  className="w-full px-4 py-3 bg-muted rounded-xl border-none focus:ring-2 focus:ring-primary outline-none"
                />
                <button type="submit" className="w-full py-4 bg-primary text-white rounded-full font-bold hover:bg-primary/90 transition-colors">
                  Save Category
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
