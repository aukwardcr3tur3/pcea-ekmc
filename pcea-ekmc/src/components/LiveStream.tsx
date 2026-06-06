import React, { useEffect, useState } from "react";
import { Video, Radio, Users, Church, Play, Info, Edit2, Save, X, CheckCircle2, Youtube } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface StreamSource {
  id: string;
  name: string;
  description: string;
  channelId: string; // YouTube Channel ID
  channelUrl: string; // YouTube Channel URL
  videoId?: string; // Specific current live video ID
  type: "Main Church" | "Youth Sanctuary";
  status: "Live" | "Offline" | "Scheduled";
  updatedAt?: string;
}

export default function LiveStream() {
  const [streams, setStreams] = useState<StreamSource[]>([]);
  const [activeStream, setActiveStream] = useState<StreamSource | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStreams();
  }, []);

  const fetchStreams = async () => {
    try {
      const response = await fetch("/api/live-streams");
      const data = await response.json();
      const streamList = Object.values(data) as StreamSource[];
      setStreams(streamList);
      if (!activeStream) {
        setActiveStream(streamList[0]);
      } else {
        const updatedActive = streamList.find(s => s.id === activeStream.id);
        if (updatedActive) setActiveStream(updatedActive);
      }
    } catch (error) {
      console.error("Error fetching streams:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || !activeStream) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const activeStreamUrl = activeStream.videoId 
    ? `https://www.youtube.com/embed/${activeStream.videoId}?autoplay=1&rel=0&modestbranding=1&hd=1&latencyPreference=low` 
    : `https://www.youtube.com/embed/live?channel=${activeStream.channelId}&autoplay=1&rel=0&latencyPreference=low`;

  return (
    <div className="space-y-12">
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-4">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-16 h-16 bg-red-600 rounded-3xl flex items-center justify-center text-white shadow-xl shadow-red-500/20"
          >
            <Radio size={32} className="animate-pulse" />
          </motion.div>
          <div className="text-left flex-1 md:flex-none">
            <motion.h2 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="font-serif text-3xl md:text-4xl font-bold text-primary dark:text-accent"
            >
              Live Worship Experience
            </motion.h2>
            <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
               <p className="display-font text-[10px] uppercase tracking-[0.3em] text-muted-foreground font-bold">Divine Connection • Global Reach</p>
               {activeStream.status === "Live" && (
                  <a 
                    href={activeStream.videoId ? `https://youtu.be/${activeStream.videoId}` : activeStream.channelUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] items-center space-x-1 text-red-600 font-bold uppercase tracking-widest hover:underline hidden md:flex"
                  >
                    <Youtube size={12} />
                    <span>Watch in YouTube App</span>
                  </a>
               )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Stream Player */}
        <div className="lg:col-span-2 space-y-8">
          <div className="group relative">
            <div className="aspect-video bg-black rounded-[3rem] overflow-hidden shadow-2xl border-8 border-white dark:border-zinc-800 relative z-10 transition-all group-hover:scale-[1.01]">
              <iframe
                width="100%"
                height="100%"
                src={activeStreamUrl}
                title={activeStream.name}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              ></iframe>
              
              {activeStream.status !== "Live" && (
                <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center text-center p-12 space-y-6">
                   <div className="w-20 h-20 bg-zinc-800 rounded-full flex items-center justify-center text-zinc-500">
                      <Play size={40} />
                   </div>
                   <div className="space-y-2">
                      <h3 className="text-2xl font-serif font-bold text-white">We are currently Offline</h3>
                      <p className="text-zinc-400 max-w-xs mx-auto">Our next broadcast is scheduled for Sunday. Check the schedule on the right for timings.</p>
                   </div>
                   <button 
                     onClick={() => window.location.reload()}
                     className="px-8 py-3 bg-primary text-white rounded-full font-bold text-sm uppercase tracking-widest hover:bg-primary/90 transition-all"
                   >
                     Refresh Connection
                   </button>
                </div>
              )}
            </div>
            {/* Artistic Glow */}
            <div className="absolute inset-0 bg-primary/20 blur-[100px] -z-10 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>

          <div className="bg-card dark:bg-card border border-border rounded-[2.5rem] p-10 space-y-8 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${activeStream.status === "Live" ? "bg-red-600 text-white animate-pulse" : "bg-zinc-200 dark:bg-zinc-800 text-zinc-500"}`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${activeStream.status === "Live" ? "bg-white" : "bg-zinc-400"}`} />
                    <span>{activeStream.status === "Live" ? "Broadcasting Live" : "Broadcast Ended"}</span>
                  </div>
                  <h3 className="text-3xl font-serif font-bold text-primary dark:text-accent tracking-tight">{activeStream.name}</h3>
                </div>
                <p className="text-muted-foreground leading-relaxed font-medium text-lg italic">
                  "{activeStream.description}"
                </p>
              </div>
              <div className="flex flex-col items-end space-y-4">
                 <div className="flex items-center space-x-4">
                    <div className="text-right">
                       <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Stream Health</p>
                       <p className="text-sm font-bold text-green-600 flex items-center justify-end space-x-1">
                          <CheckCircle2 size={14} />
                          <span>Stable (1080p)</span>
                       </p>
                    </div>
                    <div className="w-px h-8 bg-border" />
                    <div className="text-right">
                       <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Platform</p>
                       <p className="text-sm font-bold flex items-center justify-end space-x-1">
                          <Youtube size={14} className="text-red-500" />
                          <span>YouTube Core</span>
                       </p>
                    </div>
                 </div>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <div className="p-8 bg-blue-50/50 dark:bg-blue-900/10 rounded-[2rem] border border-blue-100 dark:border-blue-800 space-y-4">
                <h4 className="font-bold flex items-center space-x-2 text-blue-600">
                   <Info size={18} />
                   <span>How to fix buffering?</span>
                </h4>
                <ul className="space-y-2 text-sm text-blue-800/80 dark:text-blue-200/80 font-medium list-disc ml-5 leading-relaxed">
                   <li>Check your internet speed (min 5Mbps for HD).</li>
                   <li>Click the "Settings" icon in the video and set quality to "Auto".</li>
                   <li>Close other tabs or devices using your Wi-Fi.</li>
                   <li>If it freezes, click the <strong>Refresh Connection</strong> button.</li>
                </ul>
             </div>
             <div className="p-8 bg-zinc-50 dark:bg-zinc-900/50 rounded-[2rem] border border-border space-y-4">
                <h4 className="font-bold flex items-center space-x-2 text-primary">
                   <Users size={18} />
                   <span>Community Prayer</span>
                </h4>
                <p className="text-sm text-muted-foreground font-medium leading-relaxed italic">
                   "Worshipping together, even in separated places, keeps our fellowship strong and our spirits united in the Lord."
                </p>
                <button className="text-xs font-bold uppercase tracking-widest text-primary hover:underline">Submit Prayer Request →</button>
             </div>
          </div>
        </div>

        {/* Stream Selection */}
        <div className="space-y-6">
          <div className="bg-primary text-white rounded-3xl p-6 space-y-4 shadow-lg">
            <h4 className="font-bold text-lg flex items-center space-x-2">
              <Play size={20} />
              <span>Sunday Service Schedule</span>
            </h4>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center border-b border-white/20 pb-2">
                <span className="font-medium">1st Service</span>
                <span className="font-bold">8:00 AM - 10:00 AM</span>
              </div>
              <div className="flex justify-between items-center border-b border-white/20 pb-2">
                <span className="font-medium">2nd Service</span>
                <span className="font-bold">10:30 AM - 12:30 PM</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium">Youth Service</span>
                <span className="font-bold">9:00 AM - 11:00 AM</span>
              </div>
            </div>
          </div>

          <h4 className="font-bold text-lg uppercase tracking-widest text-primary dark:text-accent px-2">Select Service</h4>
          <div className="space-y-4">
            {streams.map((stream) => (
              <button
                key={stream.id}
                onClick={() => setActiveStream(stream)}
                className={`w-full text-left p-6 rounded-3xl border transition-all flex items-start space-x-4 group shadow-sm ${
                  activeStream.id === stream.id
                    ? "bg-primary dark:bg-accent border-primary dark:border-accent text-primary-foreground dark:text-accent-foreground shadow-lg"
                    : "bg-card dark:bg-card border-border dark:border-border text-foreground dark:text-foreground hover:border-primary/30 dark:hover:border-accent/30"
                }`}
              >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 transition-colors ${
                  activeStream.id === stream.id ? "bg-primary-foreground/20 dark:bg-accent-foreground/20" : "bg-muted dark:bg-muted text-primary dark:text-accent"
                }`}>
                  {stream.type === "Main Church" ? <Church size={24} /> : <Users size={24} />}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <h5 className="font-bold">{stream.name}</h5>
                    {stream.status === "Live" && (
                      <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                    )}
                  </div>
                  <p className={`text-xs line-clamp-2 font-medium ${activeStream.id === stream.id ? "text-primary-foreground/80 dark:text-accent-foreground/80" : "text-muted-foreground dark:text-muted-foreground"}`}>
                    {stream.description}
                  </p>
                </div>
              </button>
            ))}
          </div>

          <div className="p-6 bg-muted dark:bg-muted rounded-3xl border border-border dark:border-border space-y-4 shadow-sm">
            <h5 className="font-bold flex items-center space-x-2 text-primary dark:text-accent">
              <Info size={18} />
              <span>Streaming Help</span>
            </h5>
            <p className="text-sm text-primary/80 dark:text-accent/80 leading-relaxed font-medium">
              If the stream doesn't start automatically, please click the play button on the video player. For the best experience, ensure you have a stable internet connection.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
