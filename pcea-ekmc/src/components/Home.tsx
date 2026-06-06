import React from "react";
import { Link } from "react-router-dom";
import { generateGroupRecommendation } from "../lib/ai";
import { BookOpen, MessageSquare, Heart, Star, Clock, Users, ArrowRight, Video, School, Home as HomeIcon, UserPlus, Calendar, Activity, ShieldCheck, Music, Mic2, Camera, GraduationCap, HeartHandshake, Sparkles, Loader2, Wand2, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { db, collection, onSnapshot, query, orderBy, limit, handleFirestoreError, OperationType } from "../firebase";

const features = [
  {
    title: "Live Stream",
    description: "Watch our services live from the Main Church or Youth Sanctuary.",
    icon: Video,
    path: "/live",
    color: "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400",
  },
  {
    title: "Spiritual Guide",
    description: "Get biblical guidance and compassionate support from our AI companion.",
    icon: MessageSquare,
    path: "/spiritual-guide",
    color: "bg-primary/10 text-primary",
  },
  {
    title: "AI Sermon Insights",
    description: "Summaries, devotionals, and discussion questions from our latest sermons.",
    icon: BookOpen,
    path: "/sermons",
    color: "bg-primary/10 text-primary",
  },
  {
    title: "Prayer Wall",
    description: "Share your requests and pray for others in our community.",
    icon: Heart,
    path: "/prayer-wall",
    color: "bg-primary/10 text-primary",
  },
];

const schedule = [
  { name: "Morning Glory", time: "6:00 AM - 7:00 AM", type: "Main Church" },
  { name: "1st Service", time: "8:00 AM - 10:00 AM", type: "Main Church" },
  { name: "Youth Service", time: "9:00 AM - 11:00 AM", type: "Youth Sanctuary" },
  { name: "2nd Service", time: "11:00 AM - 1:00 PM", type: "Main Church" },
];

const groups = [
  { name: "PCMF", description: "Presbyterian Church Men's Fellowship - Men standing firm in faith and service." },
  { name: "Woman's Guild", description: "A fellowship of women dedicated to service, spiritual growth, and family values." },
  { name: "Youth", description: "Vibrant community for young people to grow in faith and leadership." },
  { name: "Brigades", description: "Empowering our children and youth through discipline, faith, and skill-building." },
  { name: "Church School", description: "Nurturing the spiritual foundation of our children through the Word." },
  { name: "Choir & Praise Team", description: "Leading the congregation in worship through music and spiritual songs." },
  { name: "JPRC", description: "Justice, Peace and Reconciliation Committee - Promoting justice and harmony in our community." },
];

export default function Home() {
  const [activities, setActivities] = React.useState<any[]>([]);
  const [leadership, setLeadership] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [userInterests, setUserInterests] = React.useState("");
  const [isRecommending, setIsRecommending] = React.useState(false);
  const [recommendations, setRecommendations] = React.useState<any[]>([]);
  const [showRecs, setShowRecs] = React.useState(false);

  React.useEffect(() => {
    if (!db) {
      setLoading(false);
      return;
    }
    const qActivities = query(collection(db, "activities"), orderBy("date", "desc"), limit(3));
    const unsubActivities = onSnapshot(qActivities, (snapshot) => {
      setActivities(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, "activities");
    });

    const qLeadership = query(collection(db, "leadership"), orderBy("createdAt", "asc"));
    const unsubLeadership = onSnapshot(qLeadership, (snapshot) => {
      setLeadership(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, "leadership");
      setLoading(false);
    });

    return () => {
      unsubActivities();
      unsubLeadership();
    };
  }, []);

  const handleGetRecommendations = async () => {
    if (!userInterests.trim()) return;
    setIsRecommending(true);
    try {
      const recs = await generateGroupRecommendation(userInterests, groups);
      setRecommendations(recs.recommendations);
      setShowRecs(true);
    } catch (err) {
      console.error("Recommendation failed", err);
    } finally {
      setIsRecommending(false);
    }
  };

  const getIcon = (name: string) => {
    const icons: Record<string, any> = {
      Activity, Star, Heart, Music, Users, ShieldCheck, Mic2, HeartHandshake, GraduationCap
    };
    return icons[name] || Activity;
  };

  return (
    <div className="space-y-32">
      {/* Premium Editorial Hero */}
      <section className="relative h-[90vh] flex items-center justify-center overflow-hidden rounded-[3rem] bg-zinc-950 text-white group shadow-2xl">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1438032005730-c779502df39b?auto=format&fit=crop&q=80" 
            alt="Church Interior" 
            className="w-full h-full object-cover opacity-40 scale-105 group-hover:scale-100 transition-transform duration-[10s]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-transparent" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center space-y-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
          >
            <div className="w-64 h-64 bg-white rounded-full p-4 shadow-2xl border border-white/20 mx-auto mb-10 overflow-hidden">
              <img 
                src="/PCEA-Logo-1.png" 
                alt="PCEA Logo" 
                className="w-full h-full object-contain"
              />
            </div>
          </motion.div>

          <div className="space-y-6">
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="display-font text-white/60"
            >
              Presbyterian Church of East Africa
            </motion.p>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="font-serif text-6xl md:text-8xl font-bold tracking-tighter leading-[0.9] text-white"
            >
              Elijah Kagiri <br/> <span className="text-white/60 italic font-medium">Memorial Church</span>
            </motion.h1>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-center justify-center space-x-4 text-sm font-medium text-white/80 italic font-serif"
            >
              <span className="h-px w-8 bg-accent/40" />
              <span>Isaiah 60:1 — "Arise, shine, for your light has come"</span>
              <span className="h-px w-8 bg-accent/40" />
            </motion.div>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap items-center justify-center gap-4"
          >
            <Link to="/live" className="px-10 py-5 bg-white text-zinc-950 rounded-full font-bold hover:scale-105 transition-all text-sm uppercase tracking-widest flex items-center space-x-2">
              <Video size={18} />
              <span>Join Live Worship</span>
            </Link>
            <Link to="/become-member" className="px-10 py-5 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-full font-bold hover:bg-white/20 transition-all text-sm uppercase tracking-widest">
              Register as Member
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Weekly Bulletin & Notice Board - This is for the "Real Deal" feel */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-8">
          <div className="space-y-2 pb-6 sacred-border">
            <h2 className="text-4xl font-serif font-bold">This Week at Elijah Kagiri</h2>
            <p className="text-muted-foreground font-medium uppercase tracking-[0.2em] text-[10px]">Weekly Announcements & Divine Service Schedule</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="institutional-card group hover:border-primary/30 transition-all">
                <div className="flex justify-between items-start mb-6">
                  <div className="p-3 bg-primary/5 text-primary rounded-xl">
                    <Calendar size={24} />
                  </div>
                  <span className="display-font text-primary">Sundays</span>
                </div>
                <h4 className="text-xl font-serif font-bold mb-4">Divine Worship Services</h4>
                <div className="space-y-4">
                  {schedule.map((s, i) => (
                    <div key={i} className="flex justify-between items-center text-sm border-b border-border/50 pb-2">
                      <span className="font-semibold text-zinc-700">{s.name}</span>
                      <span className="text-muted-foreground">{s.time}</span>
                    </div>
                  ))}
                </div>
             </div>

             <div className="institutional-card bg-primary text-white">
                <div className="flex justify-between items-start mb-6">
                  <div className="p-3 bg-white/10 rounded-xl">
                    <Mic2 size={24} />
                  </div>
                  <span className="display-font text-white/60">Announcement</span>
                </div>
                <h4 className="text-xl font-serif font-bold mb-4">Annual Church Harvest</h4>
                <p className="text-white/80 text-sm leading-relaxed mb-6">
                  Join us for our main thanksgiving service this coming Lord's Day. Come prepared to celebrate the goodness of the Lord in our lives.
                </p>
                <div className="flex items-center space-x-3 p-4 bg-white/5 rounded-2xl border border-white/10">
                   <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-bold font-serif italic text-lg">E</div>
                   <div>
                     <p className="text-xs font-bold uppercase tracking-widest text-white/60">Session Clerk</p>
                     <p className="text-sm font-bold">Elder Solomon Karanja</p>
                   </div>
                </div>
             </div>
          </div>
        </div>

        <div className="space-y-8 bg-zinc-50 dark:bg-zinc-900/40 p-10 rounded-[2rem] border border-border">
          <div className="sacred-border pb-4">
            <h3 className="text-2xl font-serif font-bold">Church Theme 2026</h3>
            <p className="display-font">Spiritual Resilience</p>
          </div>
          <div className="space-y-6">
            <div className="p-6 bg-white dark:bg-card border border-border rounded-2xl shadow-sm italic font-serif text-lg leading-relaxed text-zinc-700 dark:text-zinc-300">
              "But they that wait upon the LORD shall renew their strength; they shall mount up with wings as eagles; they shall run, and not be weary; and they shall walk, and not faint."
            </div>
            <p className="text-right font-bold text-xs uppercase tracking-[0.2em] text-accent">Isaiah 40:31</p>
            
            <div className="flex items-center space-x-4 py-6 border-t border-border">
              <Link to="/give" className="flex-1 px-6 py-4 bg-accent text-white rounded-xl font-bold flex items-center justify-center space-x-3 hover:shadow-lg transition-all">
                <Heart size={18} />
                <span>Tithes & Offerings</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Vision, Mission & Theme Section */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="p-10 bg-white dark:bg-card border border-border rounded-[2.5rem] space-y-6 shadow-sm hover:shadow-md transition-all text-center"
        >
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto text-primary">
            <Star size={32} />
          </div>
          <h3 className="text-2xl font-serif font-bold text-primary uppercase tracking-wider">Our Vision</h3>
          <p className="text-muted-foreground font-medium leading-relaxed">
            To Empower, Equip, Build & Transform God’s people for effective service through Preaching, Teaching & Witnessing in words & deeds.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="p-10 bg-primary text-white rounded-[2.5rem] space-y-6 shadow-xl hover:shadow-2xl transition-all text-center relative overflow-hidden"
        >
          <div className="relative z-10">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Heart size={32} />
            </div>
            <h3 className="text-2xl font-serif font-bold uppercase tracking-wider">Our Mission</h3>
            <p className="text-white/90 font-medium leading-relaxed">
              To be a Great and Dynamic Godly Model Church for holistic Service in Pursuance of the Great Commission.
            </p>
          </div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="p-10 bg-white dark:bg-card border border-border rounded-[2.5rem] space-y-6 shadow-sm hover:shadow-md transition-all text-center"
        >
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto text-primary">
            <BookOpen size={32} />
          </div>
          <h3 className="text-2xl font-serif font-bold text-primary uppercase tracking-wider">Our Theme</h3>
          <div className="space-y-2">
            <p className="text-3xl font-serif font-bold text-primary">ISAIAH 60:1</p>
            <p className="text-muted-foreground font-medium italic">
              "Arise, shine, for your light has come, and the glory of the Lord rises upon you."
            </p>
          </div>
        </motion.div>
      </section>

      {/* Recent Activities Section */}
      <section className="space-y-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3">
            <h2 className="font-serif text-5xl font-bold flex items-center space-x-4 text-primary">
              <Activity size={48} />
              <span>Recent Activities</span>
            </h2>
            <p className="text-muted-foreground text-xl font-medium">What's been happening in our community.</p>
          </div>
          <Link to="/gallery" className="text-primary font-bold hover:underline flex items-center space-x-2 text-lg">
            <span>View Media Gallery</span>
            <ArrowRight size={20} />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {activities.length > 0 ? activities.map((activity, idx) => {
            const Icon = getIcon(activity.iconName);
            return (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="p-8 bg-white dark:bg-card border border-border rounded-[2.5rem] space-y-6 hover:shadow-xl transition-all group relative overflow-hidden"
              >
                <div className="flex items-center justify-between relative z-10">
                  <div className="p-4 bg-muted rounded-2xl text-primary group-hover:scale-110 transition-transform">
                    <Icon size={24} />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest px-3 py-1 bg-primary/10 text-primary rounded-full">
                    {activity.category}
                  </span>
                </div>
                <div className="space-y-3 relative z-10">
                  <h3 className="text-2xl font-serif font-bold">{activity.title}</h3>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center space-x-2">
                    <Calendar size={12} />
                    <span>{new Date(activity.date).toLocaleDateString()}</span>
                  </p>
                  <p className="text-muted-foreground font-medium leading-relaxed">
                    {activity.description}
                  </p>
                </div>
              </motion.div>
            );
          }) : (
            <div className="col-span-3 text-center py-20 bg-muted/30 rounded-[3rem] border border-dashed border-border">
              <p className="text-muted-foreground text-xl font-medium italic">No recent activities posted yet.</p>
            </div>
          )}
        </div>
      </section>

      {/* Spiritual Companion Features */}
      <section className="space-y-12">
        <div className="text-center space-y-4">
          <h2 className="font-serif text-5xl font-bold text-primary">Spiritual Companion</h2>
          <p className="text-muted-foreground text-xl max-w-2xl mx-auto font-medium">
            Leveraging technology to deepen our connection with God and each other.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, idx) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Link
                to={feature.path}
                className="block h-full p-10 bg-white dark:bg-card border border-border rounded-[2.5rem] hover:shadow-2xl hover:-translate-y-2 transition-all group shadow-sm relative overflow-hidden"
              >
                <div className={`w-16 h-16 ${feature.color} rounded-2xl flex items-center justify-center mb-8 group-hover:rotate-6 transition-transform shadow-sm relative z-10`}>
                  <feature.icon size={32} />
                </div>
                <h3 className="text-2xl font-serif font-bold mb-4 relative z-10">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed font-medium relative z-10">{feature.description}</p>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Church Institutions Section */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-primary dark:bg-card border border-border dark:border-border rounded-[2rem] p-12 text-primary-foreground space-y-6 relative overflow-hidden group shadow-lg">
          <div className="relative z-10 space-y-4">
            <div className="w-16 h-16 bg-primary-foreground/20 dark:bg-accent/20 rounded-2xl flex items-center justify-center">
              <HomeIcon size={32} className="text-primary-foreground dark:text-accent" />
            </div>
            <h3 className="text-3xl font-serif font-bold text-primary-foreground dark:text-accent">Ladies Hostels</h3>
            <p className="text-primary-foreground/90 dark:text-muted-foreground leading-relaxed font-medium">
              Safe, secure, and spiritually nourishing accommodation for young ladies. Join our community of faith.
            </p>
            <Link
              to="/institutions"
              className="inline-block px-8 py-3 bg-primary-foreground dark:bg-accent text-primary dark:text-accent-foreground rounded-full font-bold hover:bg-primary-foreground/90 dark:hover:bg-accent/90 transition-colors shadow-md"
            >
              Learn More
            </Link>
          </div>
          <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-primary-foreground/10 rounded-full group-hover:scale-110 transition-transform duration-500" />
        </div>

        <div className="bg-primary/90 dark:bg-card border border-border dark:border-border rounded-[2rem] p-12 text-primary-foreground space-y-6 relative overflow-hidden group shadow-lg">
          <div className="relative z-10 space-y-4">
            <div className="w-16 h-16 bg-primary-foreground/20 dark:bg-accent/20 rounded-2xl flex items-center justify-center">
              <School size={32} className="text-primary-foreground dark:text-accent" />
            </div>
            <h3 className="text-3xl font-serif font-bold text-primary-foreground dark:text-accent">Elijah Kagiri Academy & Junior Secondary</h3>
            <p className="text-primary-foreground/90 dark:text-muted-foreground leading-relaxed font-medium">
              Providing holistic education grounded in Christian values. PP1 to Grade 9 (Junior Secondary) admission now open in Thika.
            </p>
            <Link
              to="/institutions"
              className="inline-block px-8 py-3 bg-primary-foreground dark:bg-accent text-primary dark:text-accent-foreground rounded-full font-bold hover:bg-primary-foreground/90 dark:hover:bg-accent/90 transition-colors shadow-md"
            >
              Enrol Today
            </Link>
          </div>
          <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-primary-foreground/10 rounded-full group-hover:scale-110 transition-transform duration-500" />
        </div>
      </section>

      {/* Church Groups */}
      <section className="space-y-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <h2 className="font-serif text-5xl font-bold flex items-center space-x-4 text-primary">
              <Users size={48} />
              <span>Church Groups</span>
            </h2>
            <p className="text-muted-foreground text-xl font-medium">Find your place in our vibrant community.</p>
          </div>
          
          <div className="flex bg-primary/5 p-2 rounded-2xl border border-primary/10 items-center space-x-4">
            <div className="flex items-center space-x-2 px-4 text-primary">
              <Sparkles size={18} />
              <span className="text-xs font-bold uppercase tracking-widest">AI Matchmaker</span>
            </div>
            <div className="flex gap-2">
              <input
                value={userInterests}
                onChange={(e) => setUserInterests(e.target.value)}
                placeholder="What are you passionate about?"
                className="px-4 py-2 bg-white dark:bg-muted rounded-xl border border-border text-sm outline-none focus:ring-2 focus:ring-primary min-w-[200px]"
              />
              <button
                onClick={handleGetRecommendations}
                disabled={isRecommending || !userInterests.trim()}
                className="p-2 bg-primary text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50"
              >
                {isRecommending ? <Loader2 className="animate-spin" size={20} /> : <Wand2 size={20} />}
              </button>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {showRecs && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-primary text-white rounded-[2.5rem] p-8 relative overflow-hidden"
            >
              <button 
                onClick={() => setShowRecs(false)}
                className="absolute top-6 right-6 p-2 hover:bg-white/10 rounded-full"
              >
                <X size={24} />
              </button>
              <div className="space-y-6 relative z-10">
                <div className="flex items-center space-x-2 text-white/70">
                  <Sparkles size={20} />
                  <span className="text-sm font-bold uppercase tracking-widest">Personalized Recommendations</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {recommendations.map((rec, idx) => (
                    <div key={idx} className="p-6 bg-white/10 rounded-3xl space-y-3 border border-white/10">
                      <h4 className="text-2xl font-serif font-bold">{rec.groupName}</h4>
                      <p className="text-white/80 leading-relaxed font-medium italic">"{rec.reason}"</p>
                      <Link
                        to={`/register-group/${rec.groupName}`}
                        className="inline-flex items-center space-x-2 text-sm font-bold hover:underline"
                      >
                        <span>Join this group</span>
                        <ArrowRight size={16} />
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {groups.map((group, idx) => (
            <motion.div
              key={group.name}
              initial={{ opacity: 0, x: idx % 2 === 0 ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="p-8 bg-muted dark:bg-card rounded-3xl border border-border dark:border-border space-y-4 shadow-sm relative overflow-hidden group"
            >
              <h3 className="text-2xl font-serif font-bold text-primary dark:text-accent relative z-10">{group.name}</h3>
              <p className="text-foreground dark:text-foreground leading-relaxed font-medium relative z-10">{group.description}</p>
              <Link
                to={`/register-group/${group.name}`}
                className="inline-block px-6 py-3 bg-primary dark:bg-accent text-primary-foreground dark:text-accent-foreground rounded-full text-sm font-bold hover:bg-primary/90 dark:hover:bg-accent/90 transition-colors shadow-md relative z-10"
              >
                Join {group.name}
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Membership Section */}
      <section className="bg-card dark:bg-card border border-border dark:border-border rounded-[2.5rem] p-12 text-center space-y-8 shadow-sm">
        <div className="max-w-2xl mx-auto space-y-4">
          <div className="w-16 h-16 bg-primary/10 dark:bg-accent/20 text-primary dark:text-accent rounded-2xl flex items-center justify-center mx-auto mb-4">
            <UserPlus size={32} />
          </div>
          <h2 className="font-serif text-4xl font-bold text-primary dark:text-accent">Join Our Church Family</h2>
          <p className="text-muted-foreground dark:text-muted-foreground text-lg leading-relaxed font-medium">
            Are you looking for a spiritual home? Become a registered member and join us in our mission to spread love and faith.
          </p>
          <div className="pt-4">
            <Link
              to="/become-member"
              className="px-10 py-4 bg-primary dark:bg-accent text-primary-foreground dark:text-accent-foreground rounded-full font-bold text-lg hover:bg-primary/90 dark:hover:bg-accent/90 transition-all shadow-lg hover:shadow-xl inline-flex items-center space-x-2"
            >
              <span>Register as a Member</span>
              <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </section>

      {/* Quote Section */}
      <section className="bg-primary dark:bg-card border border-border dark:border-border text-primary-foreground rounded-3xl p-16 text-center relative overflow-hidden shadow-xl">
        <div className="max-w-2xl mx-auto space-y-6 relative z-10">
          <p className="font-serif text-3xl italic text-primary-foreground dark:text-accent">
            "Your word is a lamp for my feet, a light on my path."
          </p>
          <p className="font-bold text-sm uppercase tracking-widest text-primary-foreground/90 dark:text-muted-foreground">Psalm 119:105</p>
        </div>
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute top-10 left-10 w-32 h-32 border-4 border-primary-foreground dark:border-accent/30 rounded-full" />
          <div className="absolute bottom-10 right-10 w-48 h-48 border-4 border-primary-foreground dark:border-accent/30 rounded-full" />
        </div>
      </section>
    </div>
  );
}
