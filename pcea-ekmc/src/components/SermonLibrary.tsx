import React from "react";
import { BookOpen, Calendar, User, Play, FileText, Plus, X, Loader2, Languages, MessageCircle, Heart, Lock, Unlock, ShieldCheck, Search, Filter, Sparkles, Share2, Copy, Check, Facebook, Download } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { generateSermonInsights, generatePersonalDevotional } from "../lib/ai";
import SecurityDashboard from "./SecurityDashboard";
import { db, auth, handleFirestoreError, OperationType } from "../firebase";
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, doc, getDoc, updateDoc } from "firebase/firestore";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Sermon {
  id: string;
  title: string;
  preacher: string;
  date: string;
  description: string;
  transcript?: string;
  insights?: {
    summaryEn: string;
    summarySw: string;
    devotional: { day: number; title: string; content: string }[];
    discussionQuestions: string[];
  };
  audioUrl?: string;
  category?: string;
}

export default function SermonLibrary() {
  const [sermons, setSermons] = React.useState<Sermon[]>([]);
  const [isAdding, setIsAdding] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [selectedSermon, setSelectedSermon] = React.useState<Sermon | null>(null);
  const [personalDevotional, setPersonalDevotional] = React.useState<any>(null);
  const [userContext, setUserContext] = React.useState("");
  const [isGeneratingDevotional, setIsGeneratingDevotional] = React.useState(false);
  const [isAdmin, setIsAdmin] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<"sermons" | "security">("sermons");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedCategory, setSelectedCategory] = React.useState("All");
  const [sharingSermon, setSharingSermon] = React.useState<Sermon | null>(null);
  const [copySuccess, setCopySuccess] = React.useState(false);

  // Form state
  const [title, setTitle] = React.useState("");
  const [preacher, setPreacher] = React.useState("");
  const [date, setDate] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [transcript, setTranscript] = React.useState("");
  const [category, setCategory] = React.useState("Sunday Service");

  const categories = ["All", "Sunday Service", "Youth Service", "Mid-week", "Special Event", "Seminar"];

  React.useEffect(() => {
    if (!db) return;
    const q = query(collection(db, "sermons"), orderBy("date", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const sermonData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Sermon[];
      setSermons(sermonData);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, "sermons");
    });

    return () => unsubscribe();
  }, []);

  React.useEffect(() => {
    const checkAdmin = async () => {
      if (!db || !auth?.currentUser) {
        setIsAdmin(false);
        return;
      }
      try {
        const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
        if (userDoc.exists() && userDoc.data().role === "admin") {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      } catch (error) {
        console.error("Error checking admin status:", error);
      }
    };

    checkAdmin();
    if (!auth) return;
    const unsubscribe = auth.onAuthStateChanged(checkAdmin);
    return () => unsubscribe();
  }, []);

  const handleAddSermon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db || !isAdmin) return;
    setIsLoading(true);

    try {
      let insights = {};

      if (transcript.trim()) {
        insights = await generateSermonInsights(transcript);
      }

      await addDoc(collection(db, "sermons"), {
        title,
        preacher,
        date,
        description,
        transcript,
        category,
        insights,
        createdAt: serverTimestamp(),
      });

      setIsAdding(false);
      setTitle("");
      setPreacher("");
      setDate("");
      setDescription("");
      setTranscript("");
      setCategory("Sunday Service");
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, "sermons");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredSermons = sermons.filter(sermon => {
    const matchesSearch = sermon.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         sermon.preacher.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || sermon.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleGenerateInsights = async (sermon: Sermon) => {
    if (!db || !isAdmin || !sermon.transcript) return;
    setIsLoading(true);
    try {
      const insights = await generateSermonInsights(sermon.transcript);
      const sermonRef = doc(db, "sermons", sermon.id);
      await updateDoc(sermonRef, { insights });
      setSelectedSermon({ ...sermon, insights });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `sermons/${sermon.id}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGeneratePersonalDevotional = async () => {
    if (!selectedSermon || !selectedSermon.insights || !userContext.trim()) return;
    setIsGeneratingDevotional(true);
    try {
      const devotional = await generatePersonalDevotional(
        selectedSermon.title,
        selectedSermon.insights.summaryEn,
        userContext
      );
      setPersonalDevotional(devotional);
    } catch (err) {
      console.error("Error generating personal devotional:", err);
    } finally {
      setIsGeneratingDevotional(false);
    }
  };

  const handleShare = async (sermon: Sermon) => {
    const shareData = {
      title: sermon.title,
      text: `Check out this sermon: ${sermon.title} by ${sermon.preacher} on ${new Date(sermon.date).toLocaleDateString()}`,
      url: window.location.href, // In a real app, this would be a specific sermon link
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log("Error sharing:", err);
        setSharingSermon(sermon);
      }
    } else {
      setSharingSermon(sermon);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    });
  };

  const handleDownload = (url: string, filename: string) => {
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-2">
          <h2 className="font-serif text-5xl font-bold text-primary">Sermon Library</h2>
          {isAdmin && (
            <div className="flex items-center space-x-6">
              <button
                onClick={() => setActiveTab("sermons")}
                className={cn(
                  "text-xs font-bold uppercase tracking-widest transition-all",
                  activeTab === "sermons" ? "text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-primary"
                )}
              >
                Manage Sermons
              </button>
              <button
                onClick={() => setActiveTab("security")}
                className={cn(
                  "text-xs font-bold uppercase tracking-widest transition-all flex items-center space-x-2",
                  activeTab === "security" ? "text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-primary"
                )}
              >
                <ShieldCheck size={14} />
                <span>Security</span>
              </button>
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-4 w-full md:w-auto">
          {isAdmin && (
            <button
              onClick={() => setIsAdding(true)}
              className="px-8 py-4 bg-primary text-white rounded-full font-bold flex items-center space-x-2 hover:shadow-xl transition-all"
            >
              <Plus size={24} />
              <span>Add Sermon</span>
            </button>
          )}
        </div>
      </div>

      {activeTab === "sermons" ? (
        <div className="space-y-10">
          {/* Search and Filter */}
          <div className="flex flex-col md:flex-row gap-6 bg-white dark:bg-card p-4 rounded-[2rem] border border-border shadow-sm">
            <div className="relative flex-1">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground" size={24} />
              <input
                type="text"
                placeholder="Search by title or preacher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-14 pr-6 py-4 bg-muted rounded-2xl border-none focus:ring-2 focus:ring-primary outline-none font-medium"
              />
            </div>
            <div className="flex items-center space-x-3 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={cn(
                    "px-6 py-3 rounded-xl text-sm font-bold whitespace-nowrap transition-all",
                    selectedCategory === cat
                      ? "bg-primary text-white shadow-md"
                      : "bg-muted text-muted-foreground hover:bg-border"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Sermon Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredSermons.length > 0 ? (
              filteredSermons.map((sermon) => (
                <motion.div
                  key={sermon.id}
                  layoutId={sermon.id}
                  onClick={() => setSelectedSermon(sermon)}
                  className="bg-white dark:bg-card border border-border rounded-[2.5rem] p-8 cursor-pointer hover:shadow-2xl transition-all group relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                    <BookOpen size={64} className="text-primary" />
                  </div>
                  <div className="space-y-6 relative z-10">
                      <div className="w-full aspect-video bg-muted rounded-3xl flex items-center justify-center text-primary group-hover:scale-[1.02] transition-transform overflow-hidden relative">
                        <BookOpen size={48} />
                        <div className="absolute top-4 right-4 flex flex-col space-y-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleShare(sermon);
                            }}
                            className="p-3 bg-white/90 dark:bg-card/90 backdrop-blur-md rounded-2xl text-primary hover:bg-primary hover:text-white transition-all shadow-lg"
                            title="Share Sermon"
                          >
                            <Share2 size={20} />
                          </button>
                          {sermon.audioUrl && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDownload(sermon.audioUrl!, `${sermon.title}.mp3`);
                              }}
                              className="p-3 bg-white/90 dark:bg-card/90 backdrop-blur-md rounded-2xl text-primary hover:bg-primary hover:text-white transition-all shadow-lg"
                              title="Download Audio"
                            >
                              <Download size={20} />
                            </button>
                          )}
                        </div>
                      </div>
                    <div className="space-y-3">
                      <div className="flex justify-between items-start">
                        <h3 className="text-2xl font-serif font-bold group-hover:text-primary transition-colors">{sermon.title}</h3>
                      </div>
                      <div className="flex items-center space-x-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <User size={12} className="text-primary" />
                          <span>{sermon.preacher}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar size={12} />
                          <span>{new Date(sermon.date).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <p className="text-muted-foreground line-clamp-2 text-sm font-medium leading-relaxed">{sermon.description}</p>
                    </div>
                    <div className="flex flex-wrap gap-2 pt-2">
                      {sermon.category && (
                        <span className="px-3 py-1 bg-muted text-muted-foreground text-[10px] font-bold uppercase tracking-wider rounded-lg">
                          {sermon.category}
                        </span>
                      )}
                      {sermon.insights && Object.keys(sermon.insights).length > 0 && (
                        <span className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider rounded-lg flex items-center space-x-1">
                          <Sparkles size={10} />
                          <span>AI Insights</span>
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full py-20 text-center space-y-6">
                <div className="bg-muted w-20 h-20 rounded-full flex items-center justify-center mx-auto text-muted-foreground">
                  <Search size={40} />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold">No sermons found</h3>
                  <p className="text-muted-foreground font-medium">Try adjusting your search or filters.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <SecurityDashboard />
      )}

      {/* Add Sermon Modal */}
      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-card dark:bg-card rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl border border-border dark:border-border"
            >
              <div className="p-6 border-b border-border dark:border-border flex justify-between items-center">
                <h3 className="text-2xl font-bold text-foreground dark:text-foreground">Add New Sermon</h3>
                <button onClick={() => setIsAdding(false)} className="p-2 hover:bg-muted dark:hover:bg-muted rounded-full transition-colors text-foreground dark:text-foreground">
                  <X size={24} />
                </button>
              </div>
              <form onSubmit={handleAddSermon} className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-primary dark:text-accent uppercase tracking-wider ml-2">Title</label>
                    <input
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full px-4 py-3 bg-muted dark:bg-muted text-foreground dark:text-foreground border border-border dark:border-border rounded-xl focus:ring-2 focus:ring-primary dark:focus:ring-accent outline-none font-medium"
                      placeholder="Sermon Title"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-primary dark:text-accent uppercase tracking-wider ml-2">Preacher</label>
                    <input
                      required
                      value={preacher}
                      onChange={(e) => setPreacher(e.target.value)}
                      className="w-full px-4 py-3 bg-muted dark:bg-muted text-foreground dark:text-foreground border border-border dark:border-border rounded-xl focus:ring-2 focus:ring-primary dark:focus:ring-accent outline-none font-medium"
                      placeholder="Preacher Name"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-primary dark:text-accent uppercase tracking-wider ml-2">Date</label>
                    <input
                      required
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full px-4 py-3 bg-muted dark:bg-muted text-foreground dark:text-foreground border border-border dark:border-border rounded-xl focus:ring-2 focus:ring-primary dark:focus:ring-accent outline-none font-medium"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-primary dark:text-accent uppercase tracking-wider ml-2">Category</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-4 py-3 bg-muted dark:bg-muted text-foreground dark:text-foreground border border-border dark:border-border rounded-xl focus:ring-2 focus:ring-primary dark:focus:ring-accent outline-none font-medium"
                    >
                      {categories.filter(c => c !== "All").map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-primary dark:text-accent uppercase tracking-wider ml-2">Description</label>
                  <textarea
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 bg-muted dark:bg-muted text-foreground dark:text-foreground border border-border dark:border-border rounded-xl focus:ring-2 focus:ring-primary dark:focus:ring-accent outline-none font-medium"
                    placeholder="Brief description of the sermon..."
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-primary dark:text-accent uppercase tracking-wider ml-2">Transcript (Optional for AI Insights)</label>
                  <textarea
                    value={transcript}
                    onChange={(e) => setTranscript(e.target.value)}
                    rows={6}
                    className="w-full px-4 py-3 bg-muted dark:bg-muted text-foreground dark:text-foreground border border-border dark:border-border rounded-xl focus:ring-2 focus:ring-primary dark:focus:ring-accent outline-none font-medium"
                    placeholder="Paste the sermon transcript here to generate AI insights..."
                  />
                </div>
                {isLoading && (
                  <div className="p-4 bg-primary/10 dark:bg-accent/10 text-primary dark:text-accent rounded-xl flex items-center space-x-3 text-sm font-bold">
                    <Loader2 className="animate-spin" size={20} />
                    <span>AI is generating insights. This may take a moment...</span>
                  </div>
                )}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-4 bg-primary dark:bg-accent text-primary-foreground dark:text-accent-foreground rounded-full font-bold text-lg hover:bg-primary/90 dark:hover:bg-accent/90 transition-colors disabled:opacity-50 shadow-lg"
                >
                  {isLoading ? "Processing..." : "Save Sermon"}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Sermon Detail Modal */}
      <AnimatePresence>
        {selectedSermon && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              layoutId={selectedSermon.id}
              className="bg-card dark:bg-card rounded-3xl w-full max-w-4xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col border border-border dark:border-border"
            >
              <div className="p-6 border-b border-border dark:border-border flex justify-between items-center sticky top-0 bg-card dark:bg-card z-10 shadow-sm">
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-2xl font-bold text-foreground dark:text-foreground">{selectedSermon.title}</h3>
                    {selectedSermon.category && (
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 bg-muted dark:bg-muted rounded-md text-muted-foreground">
                        {selectedSermon.category}
                      </span>
                    )}
                  </div>
                  <p className="text-muted-foreground dark:text-muted-foreground text-sm font-medium">{selectedSermon.preacher} • {new Date(selectedSermon.date).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center space-x-2">
                  {selectedSermon.audioUrl && (
                    <button
                      onClick={() => handleDownload(selectedSermon.audioUrl!, `${selectedSermon.title}.mp3`)}
                      className="p-2 bg-primary/10 text-primary hover:bg-primary hover:text-white rounded-full transition-all flex items-center space-x-2 px-4"
                    >
                      <Download size={20} />
                      <span className="text-xs font-bold uppercase tracking-widest">Download Audio</span>
                    </button>
                  )}
                  <button onClick={() => setSelectedSermon(null)} className="p-2 hover:bg-muted dark:hover:bg-muted rounded-full transition-colors text-foreground dark:text-foreground">
                    <X size={24} />
                  </button>
                </div>
              </div>
              <div className="p-8 overflow-y-auto space-y-12">
                {/* AI Insights */}
                {(!selectedSermon.insights || Object.keys(selectedSermon.insights).length === 0) && isAdmin && (
                  <div className="p-8 bg-muted rounded-[2rem] text-center space-y-6">
                    <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto">
                      <Sparkles size={32} />
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-xl font-bold">No AI Insights Yet</h4>
                      <p className="text-muted-foreground font-medium max-w-md mx-auto">
                        Generate summaries, devotionals, and discussion questions using our AI Spiritual Guide.
                      </p>
                    </div>
                    <button
                      onClick={() => handleGenerateInsights(selectedSermon)}
                      disabled={isLoading || !selectedSermon.transcript}
                      className="px-8 py-4 bg-primary text-white rounded-full font-bold hover:shadow-xl transition-all disabled:opacity-50 flex items-center space-x-2 mx-auto"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="animate-spin" size={20} />
                          <span>Generating...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles size={20} />
                          <span>Generate AI Insights</span>
                        </>
                      )}
                    </button>
                    {!selectedSermon.transcript && (
                      <p className="text-xs text-red-500 font-bold">Transcript required to generate insights.</p>
                    )}
                  </div>
                )}

                {selectedSermon.insights && Object.keys(selectedSermon.insights).length > 0 && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    <div className="space-y-8">
                      <div className="space-y-4">
                        <h4 className="font-serif text-2xl font-bold flex items-center space-x-2 text-primary dark:text-accent">
                          <Languages size={24} />
                          <span>English Summary</span>
                        </h4>
                        <p className="text-foreground dark:text-foreground leading-relaxed bg-background dark:bg-background p-6 rounded-2xl border border-border dark:border-border font-medium">
                          {selectedSermon.insights.summaryEn}
                        </p>
                      </div>
                      <div className="space-y-4">
                        <h4 className="font-serif text-2xl font-bold flex items-center space-x-2 text-primary dark:text-accent">
                          <Languages size={24} />
                          <span>Muhtasari wa Kiswahili</span>
                        </h4>
                        <p className="text-foreground dark:text-foreground leading-relaxed bg-background dark:bg-background p-6 rounded-2xl border border-border dark:border-border font-medium">
                          {selectedSermon.insights.summarySw}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-8">
                      <div className="space-y-4">
                        <h4 className="font-serif text-2xl font-bold flex items-center space-x-2 text-primary dark:text-accent">
                          <MessageCircle size={24} />
                          <span>Discussion Questions</span>
                        </h4>
                        <ul className="space-y-3">
                          {selectedSermon.insights.discussionQuestions.map((q, i) => (
                            <li key={i} className="flex space-x-3 p-4 bg-muted dark:bg-muted rounded-xl text-sm font-bold text-foreground dark:text-foreground border border-border dark:border-border">
                              <span className="text-primary dark:text-accent font-bold">{i + 1}.</span>
                              <span>{q}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {/* Devotional */}
                {selectedSermon.insights?.devotional && (
                  <div className="space-y-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <h4 className="font-serif text-2xl font-bold flex items-center space-x-2 text-primary dark:text-accent">
                        <Heart size={24} />
                        <span>3-Day Devotional</span>
                      </h4>
                      
                      <button
                        onClick={() => setPersonalDevotional(personalDevotional ? null : "input")}
                        className="text-xs font-bold uppercase tracking-widest text-primary hover:underline flex items-center space-x-2"
                      >
                        <Sparkles size={14} />
                        <span>{personalDevotional ? "Back to General" : "Generate Personal 7-Day Devotional"}</span>
                      </button>
                    </div>

                    <AnimatePresence mode="wait">
                      {personalDevotional === "input" ? (
                        <motion.div
                          key="input"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="p-8 bg-primary/5 rounded-[2rem] border border-primary/10 space-y-6"
                        >
                          <div className="space-y-2">
                            <h5 className="font-bold text-lg">Personalize Your Journey</h5>
                            <p className="text-sm text-muted-foreground font-medium">
                              Tell us a bit about what you're going through or what you'd like to focus on (e.g., "I'm a student facing exams" or "I'm looking for peace in my family").
                            </p>
                          </div>
                          <textarea
                            value={userContext}
                            onChange={(e) => setUserContext(e.target.value)}
                            placeholder="Share your context here..."
                            className="w-full px-5 py-4 bg-white dark:bg-muted rounded-2xl border border-border outline-none focus:ring-2 focus:ring-primary font-medium resize-none"
                            rows={3}
                          />
                          <button
                            onClick={handleGeneratePersonalDevotional}
                            disabled={isGeneratingDevotional || !userContext.trim()}
                            className="w-full py-4 bg-primary text-white rounded-full font-bold hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
                          >
                            {isGeneratingDevotional ? (
                              <>
                                <Loader2 className="animate-spin" size={20} />
                                <span>Generating Your Devotional...</span>
                              </>
                            ) : (
                              <>
                                <Sparkles size={20} />
                                <span>Generate My 7-Day Plan</span>
                              </>
                            )}
                          </button>
                        </motion.div>
                      ) : personalDevotional?.days ? (
                        <motion.div
                          key="devotional"
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="space-y-8"
                        >
                          <div className="p-6 bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/20 rounded-2xl text-green-800 dark:text-green-300 text-sm font-medium">
                            This 7-day plan is specially crafted for you based on the sermon and your personal context.
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {personalDevotional.days.map((day: any) => (
                              <div key={day.day} className="p-8 bg-white dark:bg-card border border-border rounded-[2rem] space-y-4 shadow-sm">
                                <div className="flex justify-between items-center">
                                  <span className="text-[10px] font-bold uppercase tracking-widest px-3 py-1 bg-primary/10 text-primary rounded-full">Day {day.day}</span>
                                </div>
                                <h5 className="font-bold text-xl">{day.title}</h5>
                                <p className="text-xs font-bold text-primary italic">"{day.scripture}"</p>
                                <p className="text-sm text-muted-foreground leading-relaxed font-medium">{day.reflection}</p>
                                <div className="pt-4 border-t border-border">
                                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Prayer Point</p>
                                  <p className="text-sm font-bold text-foreground italic">{day.prayer}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      ) : (
                        <motion.div
                          key="general"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="grid grid-cols-1 md:grid-cols-3 gap-6"
                        >
                          {selectedSermon.insights.devotional.map((day) => (
                            <div key={day.day} className="p-6 bg-card dark:bg-card border border-border dark:border-border rounded-2xl space-y-3 shadow-sm">
                              <span className="text-xs font-bold uppercase tracking-widest text-primary dark:text-accent">Day {day.day}</span>
                              <h5 className="font-bold text-lg text-foreground dark:text-foreground">{day.title}</h5>
                              <p className="text-sm text-muted-foreground dark:text-muted-foreground leading-relaxed font-medium">{day.content}</p>
                            </div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                {/* Transcript */}
                {selectedSermon.transcript && (
                  <div className="space-y-4">
                    <h4 className="font-serif text-2xl font-bold flex items-center space-x-2 text-primary dark:text-accent">
                      <FileText size={24} />
                      <span>Full Transcript</span>
                    </h4>
                    <div className="bg-muted dark:bg-muted p-8 rounded-3xl text-sm leading-relaxed text-foreground dark:text-foreground whitespace-pre-wrap font-medium border border-border dark:border-border">
                      {selectedSermon.transcript}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Share Modal */}
      <AnimatePresence>
        {sharingSermon && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-card rounded-[2.5rem] w-full max-w-md overflow-hidden shadow-2xl border border-border p-8 space-y-8"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-bold">Share Sermon</h3>
                <button onClick={() => setSharingSermon(null)} className="p-2 hover:bg-muted rounded-full transition-colors">
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-6">
                <div className="p-4 bg-muted rounded-2xl space-y-1">
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Sermon</p>
                  <p className="font-bold">{sharingSermon.title}</p>
                  <p className="text-sm text-muted-foreground">{sharingSermon.preacher}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => {
                      const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`;
                      window.open(url, '_blank');
                    }}
                    className="flex flex-col items-center justify-center p-6 bg-muted hover:bg-primary/10 rounded-3xl transition-all group"
                  >
                    <Facebook className="text-primary group-hover:scale-110 transition-transform mb-2" size={32} />
                    <span className="text-xs font-bold uppercase tracking-widest">Facebook</span>
                  </button>
                  <button
                    onClick={() => {
                      const text = `Check out this sermon: ${sharingSermon.title} by ${sharingSermon.preacher}`;
                      const url = `https://wa.me/?text=${encodeURIComponent(text + " " + window.location.href)}`;
                      window.open(url, '_blank');
                    }}
                    className="flex flex-col items-center justify-center p-6 bg-muted hover:bg-green-500/10 rounded-3xl transition-all group"
                  >
                    <MessageCircle className="text-green-600 group-hover:scale-110 transition-transform mb-2" size={32} />
                    <span className="text-xs font-bold uppercase tracking-widest">WhatsApp</span>
                  </button>
                </div>

                <div className="space-y-3">
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-2">Copy Link</p>
                  <div className="flex items-center space-x-2 p-2 bg-muted rounded-2xl border border-border">
                    <input
                      readOnly
                      value={window.location.href}
                      className="flex-1 bg-transparent border-none outline-none px-3 text-sm font-medium"
                    />
                    <button
                      onClick={() => copyToClipboard(window.location.href)}
                      className="p-3 bg-primary text-white rounded-xl hover:bg-primary/90 transition-all flex items-center space-x-2"
                    >
                      {copySuccess ? <Check size={18} /> : <Copy size={18} />}
                      <span className="text-xs font-bold">{copySuccess ? "Copied" : "Copy"}</span>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
