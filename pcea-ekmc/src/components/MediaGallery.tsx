import React from "react";
import { db, collection, onSnapshot, query, orderBy, handleFirestoreError, OperationType } from "../firebase";
import { Camera, Video, Image as ImageIcon, Play, Search, Filter } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface MediaItem {
  id: string;
  title: string;
  type: "image" | "video";
  url: string;
  thumbnailUrl?: string;
  category: string;
  createdAt: any;
}

export default function MediaGallery() {
  const [media, setMedia] = React.useState<MediaItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [filter, setFilter] = React.useState<"all" | "image" | "video">("all");
  const [search, setSearch] = React.useState("");

  React.useEffect(() => {
    if (!db) {
      setLoading(false);
      return;
    }
    const q = query(collection(db, "media"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMedia(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as MediaItem[]);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, "media");
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const filteredMedia = media.filter(item => {
    const matchesFilter = filter === "all" || item.type === filter;
    const matchesSearch = item.title.toLowerCase().includes(search.toLowerCase()) || 
                         item.category.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;

  return (
    <div className="space-y-12">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-serif font-bold text-primary">Church Media Gallery</h1>
        <p className="text-muted-foreground font-medium max-w-2xl mx-auto">
          Capturing moments of worship, fellowship, and service in our community.
        </p>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-card border border-border p-4 rounded-[2rem] shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
          <input
            type="text"
            placeholder="Search media..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-6 py-3 bg-muted rounded-full border-none focus:ring-2 focus:ring-primary outline-none font-medium"
          />
        </div>
        <div className="flex bg-muted p-1 rounded-2xl">
          {(["all", "image", "video"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={`px-6 py-2 rounded-xl font-bold text-sm transition-all ${
                filter === t ? "bg-white dark:bg-zinc-800 shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        <AnimatePresence mode="popLayout">
          {filteredMedia.map((item) => (
            <motion.div
              layout
              key={item.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="group relative aspect-[4/3] rounded-[2rem] overflow-hidden bg-muted border border-border shadow-sm hover:shadow-xl transition-all"
            >
              <img
                src={item.type === "video" ? (item.thumbnailUrl || "https://picsum.photos/seed/church-video/800/600") : item.url}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-8 text-white">
                <div className="space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 bg-white/20 backdrop-blur-md rounded-full">
                    {item.category}
                  </span>
                  <h3 className="text-xl font-bold">{item.title}</h3>
                </div>
              </div>
              <div className="absolute top-4 right-4 p-2 bg-white/20 backdrop-blur-md rounded-xl text-white">
                {item.type === "video" ? <Play size={20} /> : <ImageIcon size={20} />}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filteredMedia.length === 0 && (
        <div className="text-center py-20 space-y-4">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto text-muted-foreground">
            <Filter size={32} />
          </div>
          <h3 className="text-xl font-bold">No media found</h3>
          <p className="text-muted-foreground">Try adjusting your filters or search terms.</p>
        </div>
      )}
    </div>
  );
}
