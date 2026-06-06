import React from "react";
import { db, auth, collection, addDoc, serverTimestamp, handleFirestoreError, OperationType } from "../firebase";
import { useAuth } from "../hooks/useAuth";
import { generateSocialContent } from "../lib/ai";
import { Send, Facebook, Youtube, Globe, Layout, History, AlertCircle, CheckCircle2, Loader2, ShieldAlert, Sparkles, Wand2, Church, Users } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface Post {
  id: string;
  content: string;
  platforms: string[];
  status: "draft" | "published";
  authorName: string;
  createdAt: any;
  publishedAt?: any;
}

export default function SocialDashboard() {
  const { user, profile, isSocialManager, isAdmin } = useAuth();
  const [content, setContent] = React.useState("");
  const [aiTopic, setAiTopic] = React.useState("");
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [selectedPlatforms, setSelectedPlatforms] = React.useState<string[]>(["web"]);
  const [isPublishing, setIsPublishing] = React.useState(false);
  const [publishStatus, setPublishStatus] = React.useState<{success?: string, error?: string}>({});
  
  // Live Stream Management State
  const [streams, setStreams] = React.useState<any>({});
  const [isUpdatingStream, setIsUpdatingStream] = React.useState<string | null>(null);

  React.useEffect(() => {
    fetchLiveStreams();
  }, []);

  const fetchLiveStreams = async () => {
    try {
      const res = await fetch("/api/live-streams");
      const data = await res.json();
      setStreams(data);
    } catch (err) {
      console.error("Failed to fetch streams", err);
    }
  };

  const handleUpdateStream = async (id: string, status: string, videoId: string) => {
    setIsUpdatingStream(id);
    try {
      const res = await fetch(`/api/live-streams/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, videoId })
      });
      if (res.ok) {
        const updated = await res.json();
        setStreams({ ...streams, [id]: updated });
        setPublishStatus({ success: `${streams[id].name} updated successfully!` });
      }
    } catch (err) {
      console.error("Update failed", err);
      setPublishStatus({ error: "Failed to update stream." });
    } finally {
      setIsUpdatingStream(null);
    }
  };

  // Security check: Only social managers or admins can access
  if (!isSocialManager && !isAdmin) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center space-y-6">
        <div className="w-20 h-20 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto">
          <ShieldAlert size={40} />
        </div>
        <h1 className="text-3xl font-bold text-primary">Access Denied</h1>
        <p className="text-muted-foreground">You do not have permission to access the Social Media Management Dashboard.</p>
      </div>
    );
  }

  const togglePlatform = (platform: string) => {
    setSelectedPlatforms(prev => 
      prev.includes(platform) 
        ? prev.filter(p => p !== platform) 
        : [...prev, platform]
    );
  };

  const handleAiGenerate = async () => {
    if (!aiTopic.trim()) return;
    setIsGenerating(true);
    try {
      const platform = selectedPlatforms[0] || "Facebook";
      const generated = await generateSocialContent(aiTopic, platform);
      setContent(generated);
      setAiTopic("");
    } catch (err) {
      console.error("AI Generation failed", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || selectedPlatforms.length === 0 || !user) return;

    setIsPublishing(true);
    setPublishStatus({});

    try {
      // 1. Save to internal database
      const postData = {
        content,
        platforms: selectedPlatforms,
        status: "published",
        authorUid: user.uid,
        authorName: profile?.displayName || user.displayName || "Unknown",
        createdAt: serverTimestamp(),
        publishedAt: serverTimestamp(),
      };

      await addDoc(collection(db, "social_posts"), postData);

      // 2. Simulate Social Media Distribution
      // In a real app, this would call a server-side function that uses Facebook/YouTube APIs
      await new Promise(resolve => setTimeout(resolve, 1500));

      setPublishStatus({ success: "Post published successfully to selected platforms!" });
      setContent("");
      setSelectedPlatforms(["web"]);
    } catch (err) {
      console.error("Publishing failed", err);
      setPublishStatus({ error: "Failed to publish post. Please try again." });
      handleFirestoreError(err, OperationType.CREATE, "social_posts");
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-12">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-4xl font-serif font-bold text-primary">Social Media Dashboard</h1>
          <p className="text-muted-foreground font-medium">Manage and distribute content across all church platforms.</p>
        </div>
        <div className="flex items-center space-x-2 px-4 py-2 bg-primary/5 text-primary rounded-full border border-primary/10">
          <Layout size={18} />
          <span className="text-sm font-bold uppercase tracking-wider">Manager View</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Composer Side */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-primary/5 border border-primary/10 rounded-[2.5rem] p-8 space-y-6">
            <div className="flex items-center space-x-2 text-primary">
              <Sparkles size={20} />
              <h3 className="font-bold uppercase tracking-widest text-xs">AI Content Assistant</h3>
            </div>
            <div className="flex gap-4">
              <input
                value={aiTopic}
                onChange={(e) => setAiTopic(e.target.value)}
                placeholder="What is the post about? (e.g., Sunday Youth Service)"
                className="flex-1 px-5 py-3 bg-white dark:bg-muted rounded-2xl border border-border outline-none focus:ring-2 focus:ring-primary font-medium"
              />
              <button
                onClick={handleAiGenerate}
                disabled={isGenerating || !aiTopic.trim()}
                className="px-6 py-3 bg-primary text-white rounded-2xl font-bold flex items-center space-x-2 hover:shadow-lg transition-all disabled:opacity-50"
              >
                {isGenerating ? <Loader2 className="animate-spin" size={20} /> : <Wand2 size={20} />}
                <span>Draft</span>
              </button>
            </div>
          </div>

          <form onSubmit={handlePublish} className="bg-card border border-border rounded-[2.5rem] p-8 space-y-8 shadow-sm">
            <div className="space-y-4">
              <label className="text-sm font-bold uppercase tracking-widest text-muted-foreground flex items-center justify-between">
                <span className="flex items-center space-x-2">
                  <Send size={16} />
                  <span>Create New Post</span>
                </span>
                <span className="text-xs text-muted-foreground/60 p-2 bg-muted rounded-xl">Markdown Supported</span>
              </label>
              <div className="bg-white dark:bg-muted rounded-3xl border border-border p-2">
                <div className="flex space-x-2 p-2 border-b border-border">
                  {[
                    { label: '**Bold**', tag: '**' },
                    { label: '*Italic*', tag: '*' },
                    { label: '# Heading', tag: '# ' },
                    { label: '- List', tag: '- ' }
                  ].map(item => (
                    <button 
                      key={item.label} 
                      type="button" 
                      onClick={() => setContent(prev => prev + item.tag)}
                      className="px-3 py-1 bg-muted rounded-lg text-xs font-bold hover:bg-primary/10"
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="What would you like to share with the congregation today? (Markdown allowed)"
                  className="w-full h-48 p-6 bg-transparent border-none focus:ring-0 outline-none resize-none text-lg leading-relaxed"
                  required
                />
              </div>
            </div>

            <div className="space-y-6">
              <label className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Distribution Channels</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <button
                  type="button"
                  onClick={() => togglePlatform("facebook")}
                  className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${
                    selectedPlatforms.includes("facebook") 
                      ? "border-[#1877F2] bg-[#1877F2]/5 text-[#1877F2]" 
                      : "border-border hover:border-muted-foreground/30"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Facebook size={20} />
                    <span className="font-bold">Facebook</span>
                  </div>
                  {selectedPlatforms.includes("facebook") && <CheckCircle2 size={16} />}
                </button>

                <button
                  type="button"
                  onClick={() => togglePlatform("youtube")}
                  className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${
                    selectedPlatforms.includes("youtube") 
                      ? "border-[#FF0000] bg-[#FF0000]/5 text-[#FF0000]" 
                      : "border-border hover:border-muted-foreground/30"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Youtube size={20} />
                    <span className="font-bold">YouTube</span>
                  </div>
                  {selectedPlatforms.includes("youtube") && <CheckCircle2 size={16} />}
                </button>

                <button
                  type="button"
                  onClick={() => togglePlatform("web")}
                  className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${
                    selectedPlatforms.includes("web") 
                      ? "border-primary bg-primary/5 text-primary" 
                      : "border-border hover:border-muted-foreground/30"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Globe size={20} />
                    <span className="font-bold">Web App</span>
                  </div>
                  {selectedPlatforms.includes("web") && <CheckCircle2 size={16} />}
                </button>
              </div>
            </div>

            <AnimatePresence>
              {publishStatus.success && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="p-4 bg-green-50 border border-green-100 text-green-600 rounded-2xl flex items-center space-x-3"
                >
                  <CheckCircle2 size={20} />
                  <span className="font-bold text-sm">{publishStatus.success}</span>
                </motion.div>
              )}
              {publishStatus.error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl flex items-center space-x-3"
                >
                  <AlertCircle size={20} />
                  <span className="font-bold text-sm">{publishStatus.error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={isPublishing || !content.trim() || selectedPlatforms.length === 0}
              className="w-full py-5 bg-primary text-white rounded-full font-bold text-xl hover:bg-primary/90 transition-all shadow-lg flex items-center justify-center space-x-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPublishing ? (
                <>
                  <Loader2 className="animate-spin" size={24} />
                  <span>Distributing Post...</span>
                </>
              ) : (
                <>
                  <Send size={24} />
                  <span>Publish to All Platforms</span>
                </>
              )}
            </button>
          </form>

          {/* Live Stream Control Center */}
          <div className="bg-card border border-border rounded-[2.5rem] p-8 space-y-8 shadow-sm relative overflow-hidden">
             <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center space-x-3">
                   <div className="w-12 h-12 bg-red-600 rounded-2xl flex items-center justify-center text-white shadow-lg animate-pulse">
                      <Youtube size={24} />
                   </div>
                   <div className="space-y-0.5">
                      <h3 className="text-2xl font-bold">Live Stream Control</h3>
                      <p className="text-sm text-muted-foreground font-medium italic">Accuracy & Buffering Optimization Tool</p>
                   </div>
                </div>
                <div className="text-right">
                   <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-red-600 bg-red-50 px-3 py-1 rounded-full">Real-Time Control</p>
                </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                {Object.entries(streams).map(([id, stream]: [string, any]) => (
                   <div key={id} className="p-6 bg-muted/50 rounded-3xl border border-border space-y-6">
                      <div className="flex items-center justify-between">
                         <h4 className="font-bold flex items-center space-x-2">
                           {stream.type === "Main Church" ? <Church size={18} className="text-primary" /> : <Users size={18} className="text-primary" />}
                           <span>{stream.name}</span>
                         </h4>
                         <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-tight ${stream.status === "Live" ? "bg-red-600 text-white" : "bg-zinc-300 text-zinc-600"}`}>
                            {stream.status}
                         </span>
                      </div>
                      
                      <div className="space-y-4">
                         <div className="space-y-1">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Live Video ID / URL</label>
                            <input 
                               defaultValue={stream.videoId || ""}
                               placeholder="e.g., dQw4w9WgXcQ"
                               onBlur={(e) => handleUpdateStream(id, stream.status, e.target.value)}
                               className="w-full px-4 py-2 bg-white dark:bg-muted rounded-xl border border-border outline-none focus:ring-2 focus:ring-primary font-mono text-xs"
                            />
                            <p className="text-[9px] text-muted-foreground ml-1 font-medium italic">Paste the YouTube video ID for 100% accuracy.</p>
                         </div>

                         <div className="flex items-center justify-between bg-white dark:bg-card p-3 rounded-2xl border border-border">
                            <span className="text-xs font-bold">Streaming Status</span>
                            <div className="flex bg-muted p-1 rounded-xl">
                               {(["Live", "Offline"] as const).map((status) => (
                                  <button
                                     key={status}
                                     onClick={() => handleUpdateStream(id, status, stream.videoId || "")}
                                     disabled={isUpdatingStream === id}
                                     className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-all ${
                                        stream.status === status 
                                           ? (status === "Live" ? "bg-red-600 text-white shadow-md" : "bg-zinc-600 text-white shadow-md")
                                           : "text-muted-foreground hover:text-foreground"
                                     }`}
                                  >
                                     {status}
                                  </button>
                               ))}
                            </div>
                         </div>
                      </div>
                   </div>
                ))}
             </div>
             
             <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10 flex items-start space-x-3 relative z-10">
                <AlertCircle size={20} className="text-primary mt-0.5" />
                <p className="text-xs text-primary/80 leading-relaxed font-bold italic">
                   Note: Using a specific Video ID instead of the general channel link reduces "Redirect Latency" and eliminates "Video not found" buffering errors experienced by some members.
                </p>
             </div>
             
             {/* Background Decoration */}
             <div className="absolute -bottom-12 -right-12 w-64 h-64 bg-red-600/5 rounded-full blur-3xl pointer-events-none" />
          </div>
        </div>

        {/* Info Side */}
        <div className="space-y-8">
          <div className="bg-primary text-white rounded-[2.5rem] p-8 space-y-6 shadow-lg">
            <h3 className="text-xl font-bold flex items-center space-x-2">
              <ShieldAlert size={20} />
              <span>Manager Security</span>
            </h3>
            <p className="text-white/80 text-sm leading-relaxed">
              Your account is strictly scoped to social media management. You can:
            </p>
            <ul className="space-y-3 text-sm font-medium">
              <li className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 bg-white rounded-full" />
                <span>Create and distribute posts</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 bg-white rounded-full" />
                <span>Manage church social presence</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 bg-white rounded-full" />
                <span>View distribution history</span>
              </li>
            </ul>
            <div className="pt-4 border-t border-white/10">
              <p className="text-[10px] uppercase tracking-widest opacity-60">Restricted Access</p>
              <p className="text-xs font-bold mt-1">Cannot access member profiles, financial records, or system settings.</p>
            </div>
          </div>

          <div className="bg-card border border-border rounded-[2.5rem] p-8 space-y-6 shadow-sm">
            <h3 className="text-xl font-bold flex items-center space-x-2">
              <History size={20} className="text-primary" />
              <span>Recent Distribution</span>
            </h3>
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-2xl space-y-2">
                <p className="text-sm font-medium line-clamp-2">"Join us this Sunday for a special service on..."</p>
                <div className="flex items-center justify-between">
                  <div className="flex space-x-1">
                    <Facebook size={12} className="text-[#1877F2]" />
                    <Youtube size={12} className="text-[#FF0000]" />
                    <Globe size={12} className="text-primary" />
                  </div>
                  <span className="text-[10px] text-muted-foreground font-bold">2 hours ago</span>
                </div>
              </div>
              <div className="p-4 bg-muted rounded-2xl space-y-2">
                <p className="text-sm font-medium line-clamp-2">"New sermon insights are now available on the app!"</p>
                <div className="flex items-center justify-between">
                  <div className="flex space-x-1">
                    <Globe size={12} className="text-primary" />
                  </div>
                  <span className="text-[10px] text-muted-foreground font-bold">Yesterday</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
