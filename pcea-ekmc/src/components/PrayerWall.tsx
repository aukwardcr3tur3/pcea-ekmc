import React from "react";
import { Heart, Plus, X, User, Calendar, MessageCircle, Send, LogIn, ShieldCheck, Sparkles, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { db, auth, collection, addDoc, onSnapshot, query, orderBy, updateDoc, doc, Timestamp, handleFirestoreError, OperationType } from "../firebase";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { generatePrayerMatch } from "../lib/ai";

interface Prayer {
  id: string;
  authorName: string;
  authorUid: string;
  content: string;
  createdAt: any;
  isAnonymous: boolean;
  prayerCount: number;
  prayedBy: string[];
  district?: string;
}

export default function PrayerWall() {
  const [prayers, setPrayers] = React.useState<Prayer[]>([]);
  const [isAdding, setIsAdding] = React.useState(false);
  const [name, setName] = React.useState("");
  const [request, setRequest] = React.useState("");
  const [isAnonymous, setIsAnonymous] = React.useState(false);
  const [district, setDistrict] = React.useState("");
  const [filterDistrict, setFilterDistrict] = React.useState("All");
  const [isLoading, setIsLoading] = React.useState(true);
  const [activePrayers, setActivePrayers] = React.useState(0);
  const [matchingPrayer, setMatchingPrayer] = React.useState<any>(null);
  const [isMatching, setIsMatching] = React.useState(false);

  React.useEffect(() => {
    // Simulate active prayers count
    const interval = setInterval(() => {
      setActivePrayers(Math.floor(Math.random() * 5) + 2);
    }, 10000);
    setActivePrayers(Math.floor(Math.random() * 5) + 2);
    return () => clearInterval(interval);
  }, []);

  React.useEffect(() => {
    if (!db) {
      setIsLoading(false);
      return;
    }
    const q = query(collection(db, "prayers"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const prayerList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Prayer[];
      setPrayers(prayerList);
      setIsLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, "prayers");
    });

    return () => unsubscribe();
  }, []);

  const handleAddPrayer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db || !auth?.currentUser) return;

    try {
      await addDoc(collection(db, "prayers"), {
        authorName: isAnonymous ? "Anonymous" : (name || auth.currentUser.displayName || "Member"),
        authorUid: auth.currentUser.uid,
        content: request,
        isAnonymous,
        district: district || "Other",
        prayerCount: 0,
        prayedBy: [],
        createdAt: Timestamp.now()
      });
      setIsAdding(false);
      setName("");
      setRequest("");
      setDistrict("");
      setIsAnonymous(false);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, "prayers");
    }
  };

  const handleIHavePrayed = async (prayerId: string, prayedBy: string[]) => {
    if (!db || !auth?.currentUser) return;

    if (prayedBy.includes(auth.currentUser.uid)) {
      return; // Already prayed
    }

    try {
      const prayerRef = doc(db, "prayers", prayerId);
      await updateDoc(prayerRef, {
        prayerCount: (prayers.find(p => p.id === prayerId)?.prayerCount || 0) + 1,
        prayedBy: [...prayedBy, auth.currentUser.uid]
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `prayers/${prayerId}`);
    }
  };

  const handleFindPrayerCircle = async (prayer: Prayer) => {
    setIsMatching(true);
    try {
      const others = prayers.filter(p => p.id !== prayer.id).map(p => ({ id: p.id, content: p.content }));
      const match = await generatePrayerMatch(prayer.content, others);
      setMatchingPrayer({ ...match, sourceId: prayer.id });
    } catch (err) {
      console.error("Matching failed", err);
    } finally {
      setIsMatching(false);
    }
  };

  const filteredPrayers = filterDistrict === "All" 
    ? prayers 
    : prayers.filter(p => p.district === filterDistrict);

  const districts = [
    "All", "Biafra East", "Biafra West", "Central", "Hospital", "Jamhuri", 
    "Kiboko", "Majengo North", "Majengo South", "Ofafa", "Pilot", 
    "Posta", "Power", "Starehe", "Umoja", "UTI", "Ziwani"
  ];

  return (
    <div className="space-y-12">
      <div className="text-center space-y-6">
        <div className="inline-flex items-center space-x-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-xs font-bold animate-pulse">
          <div className="w-2 h-2 bg-primary rounded-full" />
          <span>{activePrayers} people are praying right now</span>
        </div>
        <h2 className="font-serif text-5xl font-bold text-primary">Prayer Wall</h2>
        <p className="text-muted-foreground max-w-xl mx-auto italic text-lg">
          "For where two or three gather in my name, there am I with them." — Matthew 18:20
        </p>
      </div>

      {/* District Filter */}
      <div className="flex flex-wrap justify-center gap-3">
        {districts.map(d => (
          <button
            key={d}
            onClick={() => setFilterDistrict(d)}
            className={cn(
              "px-6 py-2 rounded-full text-sm font-bold transition-all border",
              filterDistrict === d 
                ? "bg-primary text-white border-primary shadow-md" 
                : "bg-white dark:bg-card text-muted-foreground border-border hover:border-primary/50"
            )}
          >
            {d}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPrayers.map((prayer) => (
            <motion.div
              key={prayer.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-card p-8 rounded-[2.5rem] border border-border shadow-sm hover:shadow-xl transition-all relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                <Heart size={64} className="fill-primary" />
              </div>
              <div className="space-y-6 relative z-10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-muted rounded-2xl flex items-center justify-center text-primary">
                      <User size={24} />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg">
                        {prayer.isAnonymous ? "Anonymous" : prayer.authorName}
                      </h4>
                      <div className="flex items-center space-x-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                        <Calendar size={12} />
                        <span>{prayer.createdAt?.toDate().toLocaleDateString()}</span>
                        {prayer.district && (
                          <>
                            <span className="opacity-30">•</span>
                            <span className="text-primary/70">{prayer.district}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <p className="text-foreground leading-relaxed italic font-serif text-xl">"{prayer.content}"</p>
                <div className="pt-6 border-t border-border flex flex-col space-y-4">
                  <div className="flex justify-between items-center">
                    <button 
                      onClick={() => handleIHavePrayed(prayer.id, prayer.prayedBy)}
                      disabled={!!(auth?.currentUser && prayer.prayedBy.includes(auth.currentUser.uid))}
                      className={cn(
                        "flex items-center space-x-2 px-4 py-2 rounded-full transition-all text-sm font-bold",
                        !auth?.currentUser 
                          ? "text-muted-foreground cursor-not-allowed opacity-50"
                          : auth.currentUser && prayer.prayedBy.includes(auth.currentUser.uid)
                            ? "bg-red-50 text-red-500 cursor-default"
                            : "bg-primary/5 text-primary hover:bg-primary hover:text-white"
                      )}
                    >
                      <Heart size={16} className={!!(auth?.currentUser && prayer.prayedBy.includes(auth.currentUser.uid)) ? "fill-current" : ""} />
                      <span>{auth?.currentUser && prayer.prayedBy.includes(auth.currentUser.uid) ? "Prayed" : "I'm Praying"}</span>
                    </button>
                    <div className="flex items-center space-x-2 text-xs text-muted-foreground font-bold">
                      <div className="flex -space-x-2">
                        {[...Array(Math.min(3, prayer.prayerCount))].map((_, i) => (
                          <div key={i} className="w-6 h-6 rounded-full border-2 border-white bg-muted flex items-center justify-center">
                            <User size={10} />
                          </div>
                        ))}
                      </div>
                      <span>{prayer.prayerCount} praying</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleFindPrayerCircle(prayer)}
                    className="w-full py-2 bg-primary/5 text-primary rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center justify-center space-x-2 hover:bg-primary/10 transition-colors"
                  >
                    <Sparkles size={12} />
                    <span>Find Prayer Circle</span>
                  </button>
                </div>

                {/* Matching Result Overlay */}
                <AnimatePresence>
                  {matchingPrayer?.sourceId === prayer.id && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute inset-0 z-20 bg-primary/95 text-white p-8 flex flex-col justify-center space-y-4"
                    >
                      <button 
                        onClick={() => setMatchingPrayer(null)}
                        className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full"
                      >
                        <X size={20} />
                      </button>
                      <div className="flex items-center space-x-2 text-white/70">
                        <Sparkles size={16} />
                        <span className="text-[10px] font-bold uppercase tracking-widest">AI Prayer Circle</span>
                      </div>
                      <h5 className="font-serif text-xl font-bold">Connected by Faith</h5>
                      <p className="text-sm text-white/90 leading-relaxed italic">"{matchingPrayer.connectionReason}"</p>
                      <div className="space-y-2">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-white/60">Matched Requests</p>
                        <div className="space-y-2">
                          {matchingPrayer.matchedIds.map((id: string) => {
                            const matched = prayers.find(p => p.id === id);
                            return matched ? (
                              <div key={id} className="p-3 bg-white/10 rounded-xl text-xs line-clamp-2">
                                {matched.content}
                              </div>
                            ) : null;
                          })}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Share Section */}
      <div className="bg-primary text-white rounded-[3rem] p-12 md:p-20 text-center space-y-10 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute top-10 left-10 w-40 h-40 border-4 border-white rounded-full" />
          <div className="absolute bottom-10 right-10 w-60 h-60 border-4 border-white rounded-full" />
        </div>
        <div className="max-w-2xl mx-auto space-y-6 relative z-10">
          <h3 className="font-serif text-5xl font-bold">Need Prayer?</h3>
          <p className="text-white/80 text-xl font-medium leading-relaxed">
            Our community is ready to stand with you in faith. Share your request and let us lift you up in prayer.
          </p>
          <div className="pt-8">
            {auth?.currentUser ? (
              <button
                onClick={() => setIsAdding(true)}
                className="px-12 py-6 bg-white text-primary rounded-full font-bold text-xl hover:shadow-2xl hover:-translate-y-1 transition-all flex items-center space-x-3 mx-auto"
              >
                <Plus size={32} />
                <span>Share Request</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  if (!auth) return;
                  const provider = new GoogleAuthProvider();
                  signInWithPopup(auth, provider);
                }}
                className="px-12 py-6 bg-white text-primary rounded-full font-bold text-xl hover:shadow-2xl hover:-translate-y-1 transition-all flex items-center space-x-3 mx-auto"
              >
                <LogIn size={28} />
                <span>Sign in to Request Prayer</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Add Prayer Modal */}
      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white dark:bg-card rounded-[2.5rem] w-full max-w-2xl overflow-hidden shadow-2xl"
            >
              <div className="p-8 border-b border-border bg-primary text-white flex justify-between items-center">
                <div className="space-y-1">
                  <h3 className="text-2xl font-bold">Share Your Request</h3>
                  <p className="text-white/70 text-sm">We are here to pray with you</p>
                </div>
                <button onClick={() => setIsAdding(false)} className="p-3 hover:bg-white/10 rounded-full transition-colors">
                  <X size={24} />
                </button>
              </div>
              <form onSubmit={handleAddPrayer} className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Your Name</label>
                  <input
                    required={!isAnonymous}
                    disabled={isAnonymous}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-6 py-4 bg-muted rounded-2xl border-none focus:ring-2 focus:ring-primary outline-none disabled:opacity-50"
                    placeholder={isAnonymous ? "Anonymous" : "Enter your name"}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">District</label>
                  <select
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full px-6 py-4 bg-muted rounded-2xl border-none focus:ring-2 focus:ring-primary outline-none appearance-none"
                  >
                    <option value="">Select District</option>
                    {districts.filter(d => d !== "All").map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Prayer Request</label>
                  <textarea
                    required
                    value={request}
                    onChange={(e) => setRequest(e.target.value)}
                    rows={4}
                    className="w-full px-6 py-4 bg-muted rounded-2xl border-none focus:ring-2 focus:ring-primary outline-none resize-none"
                    placeholder="How can we pray for you?"
                  />
                </div>
                <div className="md:col-span-2 flex items-center space-x-3 p-4 bg-muted/50 rounded-2xl">
                  <input
                    type="checkbox"
                    id="isAnonymous"
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                    className="w-6 h-6 accent-primary rounded border-border"
                  />
                  <label htmlFor="isAnonymous" className="text-sm font-bold text-muted-foreground">
                    Post anonymously to the wall
                  </label>
                </div>
                <div className="md:col-span-2 pt-4">
                  <button
                    type="submit"
                    className="w-full py-5 bg-primary text-white rounded-full font-bold text-lg hover:bg-primary/90 transition-all shadow-lg flex items-center justify-center space-x-2"
                  >
                    <Send size={20} />
                    <span>Submit Prayer Request</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(" ");
}
