import React from "react";
import { MessageSquare, Send, User, Bot, Loader2, Sparkles, BookOpen, Plus, Calendar, ChevronRight, Save, Trash2, History, BookMarked } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { chatWithBibleAI, generateStudyPlan, generateStory } from "../lib/ai";
import { db, auth, handleFirestoreError, OperationType } from "../firebase";
import { collection, addDoc, query, where, orderBy, onSnapshot, deleteDoc, doc, serverTimestamp } from "firebase/firestore";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface StudyPlan {
  id: string;
  title: string;
  description: string;
  topic: string;
  duration: number;
  days: {
    day: number;
    scripture: string;
    keyVerse: string;
    reflection: string;
    application: string;
  }[];
  createdAt: any;
}

export default function AIAssistant() {
  const [activeTab, setActiveTab] = React.useState<"chat" | "plans" | "stories">("chat");
  const [messages, setMessages] = React.useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Hello! I am your Bible AI Assistant for PCEA Elijah Kagiri Memorial Church. How can I help you today? You can ask me about scripture, theological concepts, or for spiritual encouragement.",
    },
  ]);
  const [input, setInput] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  // Study Plan state
  const [topic, setTopic] = React.useState("");
  const [duration, setDuration] = React.useState(7);
  const [generatedPlan, setGeneratedPlan] = React.useState<any>(null);
  const [savedPlans, setSavedPlans] = React.useState<StudyPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = React.useState<StudyPlan | null>(null);

  // Story Generator state
  const [storyTopic, setStoryTopic] = React.useState("");
  const [generatedStory, setGeneratedStory] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  React.useEffect(() => {
    if (!db || !auth?.currentUser) return;

    const q = query(
      collection(db, "studyPlans"),
      where("userId", "==", auth.currentUser.uid),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const plans = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as StudyPlan[];
      setSavedPlans(plans);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, "studyPlans");
    });

    return () => unsubscribe();
  }, []);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await chatWithBibleAI(input, messages);
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response || "I'm sorry, I couldn't process that. Could you please rephrase?",
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      console.error("Failed to chat with AI", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGeneratePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim() || isLoading) return;
    setIsLoading(true);

    try {
      const plan = await generateStudyPlan(topic, duration);
      setGeneratedPlan(plan);
    } catch (err) {
      console.error("Failed to generate plan", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateStory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storyTopic.trim() || isLoading) return;
    setIsLoading(true);
    try {
      const story = await generateStory(storyTopic);
      setGeneratedStory(story);
    } catch (err) {
      console.error("Failed to generate story", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSavePlan = async () => {
    if (!db || !generatedPlan || !auth?.currentUser) return;

    try {
      await addDoc(collection(db, "studyPlans"), {
        ...generatedPlan,
        topic,
        duration,
        userId: auth.currentUser.uid,
        createdAt: serverTimestamp(),
      });
      setGeneratedPlan(null);
      setTopic("");
      alert("Study plan saved successfully!");
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, "studyPlans");
    }
  };

  const handleDeletePlan = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!db || !window.confirm("Are you sure you want to delete this study plan?")) return;

    try {
      await deleteDoc(doc(db, "studyPlans", id));
      if (selectedPlan?.id === id) setSelectedPlan(null);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, "studyPlans");
    }
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-12rem)] flex flex-col bg-card dark:bg-card border border-border dark:border-border rounded-3xl overflow-hidden shadow-xl">
      {/* Header */}
      <div className="p-6 border-b border-border dark:border-border bg-[#1E40AF] dark:bg-blue-600 text-white flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <Bot size={24} />
          </div>
          <div>
            <h3 className="font-bold text-lg">Bible AI Assistant</h3>
            <p className="text-white/60 text-xs font-medium uppercase tracking-widest flex items-center space-x-1">
              <Sparkles size={10} />
              <span>Powered by Gemini AI</span>
            </p>
          </div>
        </div>
        <div className="flex items-center bg-white/10 rounded-full p-1">
          <button
            onClick={() => setActiveTab("chat")}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${activeTab === "chat" ? "bg-white text-[#1E40AF]" : "text-white hover:bg-white/10"}`}
          >
            <div className="flex items-center space-x-1">
              <MessageSquare size={14} />
              <span>Chat</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab("plans")}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${activeTab === "plans" ? "bg-white text-[#1E40AF]" : "text-white hover:bg-white/10"}`}
          >
            <div className="flex items-center space-x-1">
              <BookOpen size={14} />
              <span>Study Plans</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab("stories")}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${activeTab === "stories" ? "bg-white text-[#1E40AF]" : "text-white hover:bg-white/10"}`}
          >
            <div className="flex items-center space-x-1">
              <BookMarked size={14} />
              <span>Stories</span>
            </div>
          </button>
        </div>
      </div>

      {activeTab === "chat" ? (
        <>
          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 bg-background dark:bg-background">
            <AnimatePresence initial={false}>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div className={`flex max-w-[80%] space-x-3 ${msg.role === "user" ? "flex-row-reverse space-x-reverse" : "flex-row"}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === "user" ? "bg-[#1E40AF] dark:bg-blue-600 text-white" : "bg-muted dark:bg-muted text-[#1E40AF] dark:text-blue-400"}`}>
                      {msg.role === "user" ? <User size={16} /> : <Bot size={16} />}
                    </div>
                    <div className={`p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${msg.role === "user" ? "bg-[#1E40AF] dark:bg-blue-600 text-white rounded-tr-none" : "bg-card dark:bg-card border border-border dark:border-border text-foreground dark:text-foreground rounded-tl-none"}`}>
                      {msg.content}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {isLoading && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                <div className="flex max-w-[80%] space-x-3">
                  <div className="w-8 h-8 rounded-full bg-muted dark:bg-muted text-[#1E40AF] dark:text-blue-400 flex items-center justify-center">
                    <Bot size={16} />
                  </div>
                  <div className="p-4 bg-card dark:bg-card border border-border dark:border-border rounded-2xl rounded-tl-none flex items-center space-x-2">
                    <Loader2 className="animate-spin text-[#1E40AF] dark:text-blue-400" size={16} />
                    <span className="text-xs font-medium text-muted-foreground dark:text-muted-foreground">AI is thinking...</span>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Input */}
          <div className="p-6 border-t border-border dark:border-border bg-card dark:bg-card">
            <form onSubmit={handleSend} className="flex space-x-4">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask a biblical question or for spiritual guidance..."
                className="flex-1 px-6 py-4 bg-muted dark:bg-muted text-foreground dark:text-foreground border-none rounded-full focus:ring-2 focus:ring-[#1E40AF] dark:focus:ring-blue-400 outline-none text-sm"
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="w-14 h-14 bg-[#1E40AF] dark:bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-[#1E3A8A] dark:hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                <Send size={24} />
              </button>
            </form>
          </div>
        </>
      ) : activeTab === "stories" ? (
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-background dark:bg-background">
          <div className="bg-card border border-border p-8 rounded-3xl space-y-6 shadow-sm">
            <h4 className="text-xl font-bold flex items-center space-x-2">
              <Sparkles className="text-[#1E40AF]" size={24} />
              <span>Bible Story Generator</span>
            </h4>
            <form onSubmit={handleGenerateStory} className="space-y-4">
              <input
                value={storyTopic}
                onChange={(e) => setStoryTopic(e.target.value)}
                placeholder="e.g., The story of Job, The Parable of the Prodigal Son..."
                className="w-full px-6 py-4 bg-muted border border-border rounded-2xl focus:ring-2 focus:ring-[#1E40AF] outline-none"
              />
              <button
                type="submit"
                disabled={isLoading || !storyTopic.trim()}
                className="w-full py-4 bg-[#1E40AF] text-white rounded-full font-bold hover:bg-[#1E3A8A]"
              >
                {isLoading ? "Generating..." : "Generate Story"}
              </button>
            </form>
            {generatedStory && (
              <div className="p-6 bg-muted rounded-2xl border border-border space-y-4">
                <p className="text-sm leading-relaxed text-foreground whitespace-pre-wrap">{generatedStory}</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-hidden flex flex-col bg-background dark:bg-background">
          <div className="flex-1 overflow-y-auto p-6 space-y-8">
            {/* Generator Form */}
            {!selectedPlan && !generatedPlan && (
              <div className="space-y-6">
                <div className="bg-card dark:bg-card border border-border dark:border-border p-8 rounded-3xl space-y-6 shadow-sm">
                  <div className="space-y-2">
                    <h4 className="text-xl font-bold flex items-center space-x-2">
                      <Plus className="text-[#1E40AF] dark:text-blue-400" size={24} />
                      <span>Create New Study Plan</span>
                    </h4>
                    <p className="text-sm text-muted-foreground">Tell the AI what you'd like to study, and it will create a personalized plan for you.</p>
                  </div>
                  <form onSubmit={handleGeneratePlan} className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-2">Topic or Theme</label>
                      <input
                        required
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        placeholder="e.g., Finding Peace, Faith in Hard Times, The Parables of Jesus"
                        className="w-full px-6 py-4 bg-muted dark:bg-muted border border-border dark:border-border rounded-2xl focus:ring-2 focus:ring-[#1E40AF] dark:focus:ring-blue-400 outline-none font-medium"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-2">Duration (Days)</label>
                      <select
                        value={duration}
                        onChange={(e) => setDuration(Number(e.target.value))}
                        className="w-full px-6 py-4 bg-muted dark:bg-muted border border-border dark:border-border rounded-2xl focus:ring-2 focus:ring-[#1E40AF] dark:focus:ring-blue-400 outline-none font-medium"
                      >
                        {[3, 5, 7, 14, 21, 30].map(d => (
                          <option key={d} value={d}>{d} Days</option>
                        ))}
                      </select>
                    </div>
                    <button
                      type="submit"
                      disabled={isLoading || !topic.trim()}
                      className="w-full py-4 bg-[#1E40AF] dark:bg-blue-600 text-white rounded-full font-bold text-lg hover:bg-[#1E3A8A] dark:hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
                    >
                      {isLoading ? <Loader2 className="animate-spin" size={24} /> : <Sparkles size={24} />}
                      <span>{isLoading ? "Generating Plan..." : "Generate AI Study Plan"}</span>
                    </button>
                  </form>
                </div>

                {/* Saved Plans List */}
                {savedPlans.length > 0 && (
                  <div className="space-y-4">
                    <h4 className="text-lg font-bold flex items-center space-x-2 ml-2">
                      <History className="text-muted-foreground" size={20} />
                      <span>Your Saved Plans</span>
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {savedPlans.map((plan) => (
                        <div
                          key={plan.id}
                          onClick={() => setSelectedPlan(plan)}
                          className="p-6 bg-card dark:bg-card border border-border dark:border-border rounded-2xl hover:shadow-md transition-all cursor-pointer group relative"
                        >
                          <div className="space-y-2">
                            <div className="flex justify-between items-start">
                              <h5 className="font-bold text-lg group-hover:text-[#1E40AF] dark:group-hover:text-blue-400 transition-colors">{plan.title}</h5>
                              <button
                                onClick={(e) => handleDeletePlan(plan.id, e)}
                                className="p-2 text-muted-foreground hover:text-red-500 transition-colors"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                            <div className="flex items-center space-x-3 text-xs font-bold text-muted-foreground">
                              <span className="flex items-center space-x-1">
                                <Calendar size={12} />
                                <span>{plan.duration} Days</span>
                              </span>
                              <span>•</span>
                              <span>{new Date(plan.createdAt?.toDate()).toLocaleDateString()}</span>
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-2">{plan.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Generated Plan Preview */}
            {generatedPlan && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <button onClick={() => setGeneratedPlan(null)} className="text-sm font-bold text-muted-foreground hover:text-foreground flex items-center space-x-1">
                    <ChevronRight className="rotate-180" size={16} />
                    <span>Back to Generator</span>
                  </button>
                  {auth.currentUser && (
                    <button
                      onClick={handleSavePlan}
                      className="px-6 py-2 bg-green-600 text-white rounded-full font-bold text-sm flex items-center space-x-2 hover:bg-green-700 transition-colors"
                    >
                      <Save size={16} />
                      <span>Save to My Plans</span>
                    </button>
                  )}
                  {generatedPlan && !auth?.currentUser && (
                    <button
                      onClick={() => alert("Please sign in to save plans")}
                      className="px-6 py-2 bg-gray-400 text-white rounded-full font-bold text-sm flex items-center space-x-2 cursor-not-allowed"
                    >
                      <Save size={16} />
                      <span>Sign in to Save</span>
                    </button>
                  )}
                </div>
                <div className="bg-card dark:bg-card border border-border dark:border-border p-8 rounded-3xl space-y-8 shadow-sm">
                  <div className="space-y-2">
                    <h3 className="text-3xl font-bold text-[#1E40AF] dark:text-blue-400">{generatedPlan.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{generatedPlan.description}</p>
                  </div>
                  <div className="space-y-6">
                    {generatedPlan.days.map((day: any) => (
                      <div key={day.day} className="p-6 bg-muted dark:bg-muted rounded-2xl space-y-4 border border-border dark:border-border">
                        <div className="flex items-center justify-between">
                          <span className="px-3 py-1 bg-[#1E40AF] text-white text-xs font-bold rounded-full">Day {day.day}</span>
                          <span className="text-sm font-bold text-[#1E40AF] dark:text-blue-400">{day.scripture}</span>
                        </div>
                        <div className="space-y-4">
                          <blockquote className="italic text-foreground dark:text-foreground border-l-4 border-[#1E40AF] pl-4 py-1">
                            "{day.keyVerse}"
                          </blockquote>
                          <div className="space-y-2">
                            <h6 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Reflection</h6>
                            <p className="text-sm leading-relaxed">{day.reflection}</p>
                          </div>
                          <div className="space-y-2">
                            <h6 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Application</h6>
                            <p className="text-sm leading-relaxed">{day.application}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Selected Saved Plan */}
            {selectedPlan && (
              <div className="space-y-6">
                <button onClick={() => setSelectedPlan(null)} className="text-sm font-bold text-muted-foreground hover:text-foreground flex items-center space-x-1">
                  <ChevronRight className="rotate-180" size={16} />
                  <span>Back to My Plans</span>
                </button>
                <div className="bg-card dark:bg-card border border-border dark:border-border p-8 rounded-3xl space-y-8 shadow-sm">
                  <div className="space-y-2">
                    <h3 className="text-3xl font-bold text-[#1E40AF] dark:text-blue-400">{selectedPlan.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{selectedPlan.description}</p>
                  </div>
                  <div className="space-y-6">
                    {selectedPlan.days.map((day) => (
                      <div key={day.day} className="p-6 bg-muted dark:bg-muted rounded-2xl space-y-4 border border-border dark:border-border">
                        <div className="flex items-center justify-between">
                          <span className="px-3 py-1 bg-[#1E40AF] text-white text-xs font-bold rounded-full">Day {day.day}</span>
                          <span className="text-sm font-bold text-[#1E40AF] dark:text-blue-400">{day.scripture}</span>
                        </div>
                        <div className="space-y-4">
                          <blockquote className="italic text-foreground dark:text-foreground border-l-4 border-[#1E40AF] pl-4 py-1">
                            "{day.keyVerse}"
                          </blockquote>
                          <div className="space-y-2">
                            <h6 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Reflection</h6>
                            <p className="text-sm leading-relaxed">{day.reflection}</p>
                          </div>
                          <div className="space-y-2">
                            <h6 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Application</h6>
                            <p className="text-sm leading-relaxed">{day.application}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
