import React from "react";
import { GoogleGenAI } from "@google/genai";
import { motion, AnimatePresence } from "motion/react";
import { Send, Sparkles, BookOpen, Heart, Shield, MessageSquare, Trash2 } from "lucide-react";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

interface Message {
  role: "user" | "model";
  text: string;
}

export default function SpiritualGuide() {
  const [messages, setMessages] = React.useState<Message[]>([
    {
      role: "model",
      text: "Greetings, beloved. I am your Spiritual Guide. How can I support your walk with Christ today? Whether you seek a verse for encouragement, guidance on a difficult situation, or simply want to reflect on God's word, I am here for you."
    }
  ]);
  const [input, setInput] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [language, setLanguage] = React.useState<"en" | "sw" | "gk">("en");
  const [isBibleStudyMode, setIsBibleStudyMode] = React.useState(false);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  const languages = {
    en: { name: "English", welcome: "Greetings, beloved. I am your Spiritual Guide. How can I support your walk with Christ today?" },
    sw: { name: "Kiswahili", welcome: "Salamu, mpendwa. Mimi ni Mwongozo wako wa Kiroho. Nawezaje kusaidia safari yako na Kristo leo?" },
    gk: { name: "Gikuyu", welcome: "Ngeithi, mwendwa. Ni niu mutongoria waku wa ki-roho. Ingi guthaitira atia utungata-ini waku wa Kristo umuthi?" }
  };

  React.useEffect(() => {
    setMessages([
      {
        role: "model",
        text: languages[language].welcome
      }
    ]);
  }, [language]);

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", text: userMessage }]);
    setLoading(true);

    try {
      const systemInstruction = `You are a compassionate, wise, and biblically-grounded Spiritual Guide for members of PCEA Elijah Kagiri church. 
      Current Language: ${languages[language].name}. Please respond in this language.
      Mode: ${isBibleStudyMode ? "Bible Study Mode (Focus on deep theological explanation, cross-referencing scriptures, and historical context)" : "General Encouragement Mode"}.
      Your goal is to provide encouragement, share relevant Bible verses (preferring NIV or KJV), and offer guidance that aligns with Christian values. 
      Be warm, empathetic, and always point back to God's love and the teachings of Jesus Christ. 
      If someone is in a crisis, encourage them to reach out to the church elders or professional help. 
      Keep responses concise but meaningful. Avoid being overly preachy; instead, be a companion on their spiritual journey.`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: messages.map(m => ({
          role: m.role === "model" ? "model" : "user",
          parts: [{ text: m.text }]
        })),
        config: {
          systemInstruction,
          temperature: 0.7,
        }
      });

      const modelText = response.text || "I am sorry, I am having trouble connecting to the Spirit right now. Please try again in a moment.";
      setMessages(prev => [...prev, { role: "model", text: modelText }]);
    } catch (error) {
      console.error("AI Error:", error);
      // More descriptive error for debugging
      const errorMessage = error instanceof Error ? error.message : String(error);
      setMessages(prev => [...prev, { role: "model", text: `I apologize, but I encountered an error (${errorMessage}). Let us pray and try again later.` }]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        role: "model",
        text: "Greetings, beloved. I am your Spiritual Guide. How can I support your walk with Christ today?"
      }
    ]);
  };

  return (
    <div className="max-w-4xl mx-auto h-[80vh] flex flex-col bg-card border border-border rounded-[2.5rem] shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-border bg-primary text-white flex flex-col space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/10 rounded-full">
              <Sparkles size={24} />
            </div>
            <div>
              <h2 className="text-xl font-serif font-bold">Spiritual Guide</h2>
              <p className="text-white/70 text-xs font-medium">AI-Powered Encouragement & Wisdom</p>
            </div>
          </div>
          <button 
            onClick={clearChat}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
            title="Clear Conversation"
          >
            <Trash2 size={20} />
          </button>
        </div>
        
        <div className="flex flex-wrap items-center gap-4 pt-2">
          <div className="flex bg-white/10 rounded-xl p-1">
            {(["en", "sw", "gk"] as const).map((lang) => (
              <button
                key={lang}
                onClick={() => setLanguage(lang)}
                className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
                  language === lang ? "bg-white text-primary" : "text-white/60 hover:text-white"
                }`}
              >
                {lang}
              </button>
            ))}
          </div>
          <button
            onClick={() => setIsBibleStudyMode(!isBibleStudyMode)}
            className={`flex items-center space-x-2 px-4 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all border ${
              isBibleStudyMode 
                ? "bg-white text-primary border-white" 
                : "bg-transparent text-white border-white/20 hover:border-white/40"
            }`}
          >
            <BookOpen size={14} />
            <span>Bible Study Mode</span>
          </button>
        </div>
      </div>

      {/* Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#FDFCFB] dark:bg-[#1A1A17]/50"
      >
        <AnimatePresence initial={false}>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div className={`max-w-[80%] p-5 rounded-[2rem] shadow-sm ${
                msg.role === "user" 
                  ? "bg-primary text-white rounded-tr-none" 
                  : "bg-white dark:bg-card border border-border rounded-tl-none"
              }`}>
                <p className="text-sm leading-relaxed whitespace-pre-wrap font-medium">
                  {msg.text}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="bg-white dark:bg-card border border-border p-5 rounded-[2rem] rounded-tl-none flex items-center space-x-2">
              <div className="w-2 h-2 bg-primary/40 rounded-full animate-bounce" />
              <div className="w-2 h-2 bg-primary/40 rounded-full animate-bounce [animation-delay:0.2s]" />
              <div className="w-2 h-2 bg-primary/40 rounded-full animate-bounce [animation-delay:0.4s]" />
            </div>
          </motion.div>
        )}
      </div>

      {/* Input */}
      <div className="p-6 border-t border-border bg-white dark:bg-card">
        <form onSubmit={handleSend} className="relative">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask for a verse, encouragement, or guidance..."
            className="w-full pl-6 pr-16 py-5 bg-muted rounded-full border-none focus:ring-2 focus:ring-primary outline-none font-medium"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="absolute right-2 top-2 p-3 bg-primary text-white rounded-full hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
          >
            <Send size={20} />
          </button>
        </form>
        <div className="mt-4 flex justify-center space-x-6">
          <button 
            onClick={() => setInput("Give me a verse for strength")}
            className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors flex items-center space-x-1"
          >
            <Shield size={12} /> <span>Strength</span>
          </button>
          <button 
            onClick={() => setInput("I need encouragement today")}
            className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors flex items-center space-x-1"
          >
            <Heart size={12} /> <span>Encouragement</span>
          </button>
          <button 
            onClick={() => setInput("Help me understand the Parables")}
            className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors flex items-center space-x-1"
          >
            <BookOpen size={12} /> <span>Wisdom</span>
          </button>
        </div>
      </div>
    </div>
  );
}
