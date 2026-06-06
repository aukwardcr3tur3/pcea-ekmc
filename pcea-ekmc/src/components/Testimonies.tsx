import React from "react";
import { Star, Plus, X, User, Calendar, Quote, Send, LogIn, ShieldCheck, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { db, auth, handleFirestoreError, OperationType } from "../firebase";
import { collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp } from "firebase/firestore";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

interface Testimony {
  id: string;
  name: string;
  content: string;
  createdAt: any;
  status: "pending" | "approved" | "rejected";
  uid: string;
  isAnonymous?: boolean;
}

export default function Testimonies() {
  const [testimonies, setTestimonies] = React.useState<Testimony[]>([]);
  const [isAdding, setIsAdding] = React.useState(false);
  const [name, setName] = React.useState("");
  const [content, setContent] = React.useState("");
  const [isAnonymous, setIsAnonymous] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [isModerating, setIsModerating] = React.useState(false);
  const [user, setUser] = React.useState(auth?.currentUser || null);

  React.useEffect(() => {
    const unsubscribeAuth = auth?.onAuthStateChanged((user) => {
      setUser(user);
    });

    if (!db) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, "testimonies"),
      where("status", "==", "approved"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Testimony[];
      setTestimonies(data);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, "testimonies");
      setLoading(false);
    });

    return () => {
      unsubscribeAuth?.();
      unsubscribe?.();
    };
  }, []);

  const handleLogin = async () => {
    if (!auth) return;
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  const handleAddTestimony = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db || !user || isModerating) return;

    setIsModerating(true);

    try {
      // AI Moderation Pre-screening
      const prompt = `Analyze this church testimony for appropriateness. 
      It should be encouraging, respectful, and relevant to faith. 
      Reject if it contains: hate speech, explicit language, spam, or is clearly mocking faith.
      Return ONLY a JSON object: {"isAppropriate": boolean, "reason": string}.
      Testimony: "${content}"`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });

      const responseText = response.text;
      const moderation = JSON.parse(responseText.replace(/```json|```/g, ""));

      if (!moderation.isAppropriate) {
        alert(`We couldn't submit your testimony: ${moderation.reason}`);
        setIsModerating(false);
        return;
      }

      await addDoc(collection(db, "testimonies"), {
        name: isAnonymous ? "Anonymous" : (name || user.displayName || "Member"),
        content,
        uid: user.uid,
        status: "pending",
        isAnonymous,
        createdAt: serverTimestamp()
      });
      
      setIsAdding(false);
      setName("");
      setContent("");
      setIsAnonymous(false);
      alert("Your testimony has been submitted for review. Our AI has pre-screened it for appropriateness. Thank you!");
    } catch (err) {
      console.error("Moderation/Submission error:", err);
      // Fallback: submit anyway but keep status as pending
      try {
        await addDoc(collection(db, "testimonies"), {
          name: isAnonymous ? "Anonymous" : (name || user.displayName || "Member"),
          content,
          uid: user.uid,
          status: "pending",
          isAnonymous,
          createdAt: serverTimestamp()
        });
        setIsAdding(false);
        setName("");
        setContent("");
        setIsAnonymous(false);
        alert("Your testimony has been submitted for review. Thank you!");
      } catch (innerErr) {
        handleFirestoreError(innerErr, OperationType.CREATE, "testimonies");
      }
    } finally {
      setIsModerating(false);
    }
  };

  return (
    <div className="space-y-12">
      <div className="text-center space-y-6">
        <h2 className="font-serif text-5xl font-bold text-primary">Praise Reports</h2>
        <p className="text-muted-foreground max-w-xl mx-auto italic text-lg">
          "They triumphed over him by the blood of the Lamb and by the word of their testimony." — Revelation 12:11
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : testimonies.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-card rounded-[3rem] border border-dashed border-border">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
            <Quote size={32} />
          </div>
          <p className="text-muted-foreground font-medium">No testimonies shared yet. Be the first to share what God has done!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonies.map((testimony) => (
            <motion.div
              key={testimony.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-card p-8 rounded-[2.5rem] border border-border shadow-sm hover:shadow-xl transition-all relative overflow-hidden group"
            >
              <div className="absolute top-0 left-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                <Quote size={64} className="fill-primary" />
              </div>
              <div className="space-y-6 relative z-10">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-muted rounded-2xl flex items-center justify-center text-primary">
                    <User size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg">
                      {testimony.isAnonymous ? "Anonymous" : testimony.name}
                    </h4>
                    <div className="flex items-center space-x-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                      <Calendar size={12} />
                      <span>{testimony.createdAt?.toDate ? testimony.createdAt.toDate().toLocaleDateString() : 'Just now'}</span>
                    </div>
                  </div>
                </div>
                <p className="text-foreground leading-relaxed italic font-serif text-xl">"{testimony.content}"</p>
                <div className="pt-6 border-t border-border flex justify-between items-center">
                  <div className="flex items-center space-x-2 text-primary text-sm font-bold">
                    <Star size={16} fill="currentColor" />
                    <span>Glory to God</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Share Section */}
      <div className="bg-primary text-white rounded-[3rem] p-12 md:p-20 text-center space-y-10 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute top-10 right-10 w-40 h-40 border-4 border-white rounded-full" />
          <div className="absolute bottom-10 left-10 w-60 h-60 border-4 border-white rounded-full" />
        </div>
        <div className="max-w-2xl mx-auto space-y-6 relative z-10">
          <h3 className="font-serif text-5xl font-bold">What's Your Story?</h3>
          <p className="text-white/80 text-xl font-medium leading-relaxed">
            Your testimony can encourage others and give glory to God. Share what He has done in your life.
          </p>
          <div className="pt-8">
            {user ? (
              <button
                onClick={() => setIsAdding(true)}
                className="px-12 py-6 bg-white text-primary rounded-full font-bold text-xl hover:shadow-2xl hover:-translate-y-1 transition-all flex items-center space-x-3 mx-auto"
              >
                <Plus size={32} />
                <span>Share Testimony</span>
              </button>
            ) : (
              <button
                onClick={handleLogin}
                className="px-12 py-6 bg-white text-primary rounded-full font-bold text-xl hover:shadow-2xl hover:-translate-y-1 transition-all flex items-center space-x-3 mx-auto"
              >
                <LogIn size={28} />
                <span>Sign in to Share</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Add Testimony Modal */}
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
                  <h3 className="text-2xl font-bold">Share Your Testimony</h3>
                  <p className="text-white/70 text-sm">Let your story inspire others</p>
                </div>
                <button onClick={() => setIsAdding(false)} className="p-3 hover:bg-white/10 rounded-full transition-colors">
                  <X size={24} />
                </button>
              </div>
              <form onSubmit={handleAddTestimony} className="p-8 space-y-6">
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
                  <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Your Testimony</label>
                  <textarea
                    required
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={6}
                    className="w-full px-6 py-4 bg-muted rounded-2xl border-none focus:ring-2 focus:ring-primary outline-none resize-none"
                    placeholder="Share what God has done in your life..."
                  />
                </div>
                <div className="flex items-center space-x-3 p-4 bg-muted/50 rounded-2xl">
                  <input
                    type="checkbox"
                    id="isAnonymousTestimony"
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                    className="w-6 h-6 accent-primary rounded border-border"
                  />
                  <label htmlFor="isAnonymousTestimony" className="text-sm font-bold text-muted-foreground">
                    Post anonymously to the wall
                  </label>
                </div>
                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={isModerating}
                    className="w-full py-5 bg-primary text-white rounded-full font-bold text-lg hover:bg-primary/90 transition-all shadow-lg flex items-center justify-center space-x-3 disabled:opacity-50"
                  >
                    {isModerating ? (
                      <>
                        <Sparkles className="animate-pulse" size={20} />
                        <span>AI Pre-screening...</span>
                      </>
                    ) : (
                      <>
                        <Send size={20} />
                        <span>Submit for Review</span>
                      </>
                    )}
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
