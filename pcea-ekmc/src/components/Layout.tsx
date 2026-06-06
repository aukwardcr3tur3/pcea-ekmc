import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Church, BookOpen, MessageSquare, Heart, Star, Video, HandHeart, Menu, X, School, PhoneCall, UserPlus, Sun, Moon, ShieldCheck, Settings, User, Sparkles, Send, Users, Info, Bell } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { useAuth } from "../hooks/useAuth";
import PWAInstallPrompt from "./PWAInstallPrompt";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const navItems = [
  { name: "Home", path: "/", icon: Church },
  { name: "About", path: "/about", icon: Info },
  { name: "Live Stream", path: "/live", icon: Video },
  { name: "Sermons", path: "/sermons", icon: BookOpen },
  { name: "Spiritual Guide", path: "/spiritual-guide", icon: Sparkles },
  { name: "Prayer Wall", path: "/prayer-wall", icon: Heart },
  { name: "Testimonies", path: "/testimonies", icon: Star },
  { name: "Institutions", path: "/institutions", icon: School },
  { name: "Contact", path: "/contact", icon: PhoneCall },
  { name: "Membership", path: "/become-member", icon: UserPlus },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, profile, isAdmin, isStaff, isOnboarded, isSocialManager } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [isDarkMode, setIsDarkMode] = React.useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("theme") === "dark" || 
        (!localStorage.getItem("theme") && window.matchMedia("(prefers-color-scheme: dark)").matches);
    }
    return false;
  });
  const [isAnimating, setIsAnimating] = React.useState(false);
  const [showNotifications, setShowNotifications] = React.useState(false);
  const location = useLocation();

  const showFullNav = !user || isOnboarded;

  React.useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsAnimating(true);
    setIsDarkMode(!isDarkMode);
    // Longer duration for a more dramatic effect
    setTimeout(() => setIsAnimating(false), 800);
  };

  const notifications = [
    { id: 1, title: "Sunday Sermon Insight", message: "AI has generated a 7-day devotional for 'Walking in Divine Light' (Isaiah 60:1).", time: "5m ago", type: "ai" },
    { id: 2, title: "Prayer Circle Match", message: "A member from Majengo North shared a prayer that matches your request.", time: "45m ago", type: "prayer" },
    { id: 3, title: "JPRC Meeting", message: "Justice, Peace & Reconciliation Committee meeting scheduled for this Saturday at 2 PM.", time: "2h ago", type: "jprc" },
    { id: 4, title: "Youth Live Stream", message: "Recording from the last Youth Sanctuary service is now available in the library.", time: "5h ago", type: "live" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground font-sans transition-colors duration-700 relative overflow-x-hidden">
      {/* Theme Transition Sweep - Full Screen Reveal */}
      <AnimatePresence>
        {isAnimating && (
          <motion.div
            initial={{ clipPath: "circle(0% at 90% 5%)" }}
            animate={{ clipPath: "circle(150% at 90% 5%)" }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
            className={cn(
              "fixed inset-0 pointer-events-none z-[100]",
              isDarkMode ? "bg-accent/30" : "bg-primary/20"
            )}
          />
        )}
      </AnimatePresence>
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-background/90 backdrop-blur-md border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            {/* Logo/Branding */}
            <Link to="/" className="flex items-center space-x-4 group shrink-0">
            <div className="w-20 h-20 bg-white rounded-full p-1 shadow-lg border border-border group-hover:scale-105 transition-transform overflow-hidden">
                <img 
                  src="/PCEA-Logo-1.png" 
                  alt="PCEA Logo" 
                  className="w-full h-full object-contain"
                />
              </div>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex space-x-2 items-center">
              {showFullNav && navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "px-4 py-2 rounded-full text-sm font-bold transition-all duration-200 flex items-center justify-center",
                    location.pathname === item.path
                      ? "bg-primary dark:bg-accent text-primary-foreground dark:text-accent-foreground shadow-md"
                      : "text-muted-foreground dark:text-muted-foreground hover:bg-muted dark:hover:bg-card hover:text-foreground dark:hover:text-foreground"
                  )}
                >
                  {item.name}
                </Link>
              ))}

              {showFullNav && isStaff && (
                <Link
                  to="/staff"
                  className={cn(
                    "px-4 py-2 rounded-full text-sm font-bold transition-all duration-200 flex items-center space-x-1",
                    location.pathname === "/staff"
                      ? "bg-primary dark:bg-accent text-primary-foreground dark:text-accent-foreground shadow-md"
                      : "text-muted-foreground dark:text-muted-foreground hover:bg-muted dark:hover:bg-card hover:text-foreground dark:hover:text-foreground"
                  )}
                >
                  <Settings size={16} />
                  <span>Staff</span>
                </Link>
              )}

              {showFullNav && isAdmin && (
                <Link
                  to="/admin"
                  className={cn(
                    "px-4 py-2 rounded-full text-sm font-bold transition-all duration-200 flex items-center space-x-1",
                    location.pathname === "/admin"
                      ? "bg-primary dark:bg-accent text-primary-foreground dark:text-accent-foreground shadow-md"
                      : "text-muted-foreground dark:text-muted-foreground hover:bg-muted dark:hover:bg-card hover:text-foreground dark:hover:text-foreground"
                  )}
                >
                  <ShieldCheck size={16} />
                  <span>Admin</span>
                </Link>
              )}

              {showFullNav && isSocialManager && (
                <Link
                  to="/social-dashboard"
                  className={cn(
                    "px-4 py-2 rounded-full text-sm font-bold transition-all duration-200 flex items-center space-x-1",
                    location.pathname === "/social-dashboard"
                      ? "bg-primary dark:bg-accent text-primary-foreground dark:text-accent-foreground shadow-md"
                      : "text-muted-foreground dark:text-muted-foreground hover:bg-muted dark:hover:bg-card hover:text-foreground dark:hover:text-foreground"
                  )}
                >
                  <Send size={16} />
                  <span>Social</span>
                </Link>
              )}

              <Link
                to="/profile"
                className={cn(
                  "p-3 rounded-full transition-all duration-200",
                  location.pathname === "/profile"
                    ? "bg-primary dark:bg-accent text-primary-foreground dark:text-accent-foreground shadow-md"
                    : "text-muted-foreground dark:text-muted-foreground hover:bg-muted dark:hover:bg-card hover:text-foreground dark:hover:text-foreground"
                )}
                title="Profile"
              >
                <User size={20} />
              </Link>

              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className={cn(
                    "p-3 rounded-full transition-all duration-200 relative",
                    showNotifications
                      ? "bg-primary dark:bg-accent text-primary-foreground dark:text-accent-foreground shadow-md"
                      : "text-muted-foreground dark:text-muted-foreground hover:bg-muted dark:hover:bg-card hover:text-foreground dark:hover:text-foreground"
                  )}
                >
                  <Bell size={20} />
                  <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-background" />
                </button>

                <AnimatePresence>
                  {showNotifications && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-4 w-80 bg-card border border-border rounded-3xl shadow-2xl overflow-hidden z-[60]"
                    >
                      <div className="p-6 border-b border-border bg-primary text-white flex justify-between items-center">
                        <h4 className="font-bold">Smart Notifications</h4>
                        <Sparkles size={16} className="text-white/60" />
                      </div>
                      <div className="max-h-96 overflow-y-auto">
                        {notifications.map((n) => (
                          <div key={n.id} className="p-4 border-b border-border hover:bg-muted transition-colors cursor-pointer group">
                            <div className="flex justify-between items-start mb-1">
                              <h5 className="text-sm font-bold group-hover:text-primary transition-colors">{n.title}</h5>
                              <span className="text-[10px] text-muted-foreground font-bold">{n.time}</span>
                            </div>
                            <p className="text-xs text-muted-foreground leading-relaxed">{n.message}</p>
                          </div>
                        ))}
                      </div>
                      <div className="p-4 bg-muted text-center">
                        <button className="text-[10px] font-bold uppercase tracking-widest text-primary hover:underline">
                          View All Notifications
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <motion.button
                onClick={toggleDarkMode}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="ml-4 p-3 text-primary dark:text-accent hover:bg-muted dark:hover:bg-card rounded-full transition-all duration-300 relative group shadow-sm border border-border"
                aria-label="Toggle Dark Mode"
              >
                {/* Glow Ring */}
                <AnimatePresence>
                  {isAnimating && (
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0.6 }}
                      animate={{ scale: 3, opacity: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.6 }}
                      className={cn(
                        "absolute inset-0 rounded-full pointer-events-none",
                        isDarkMode ? "bg-accent" : "bg-primary"
                      )}
                    />
                  )}
                </AnimatePresence>
                
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={isDarkMode ? "sun" : "moon"}
                    initial={{ y: -10, opacity: 0, rotate: -45 }}
                    animate={{ y: 0, opacity: 1, rotate: 0 }}
                    exit={{ y: 10, opacity: 0, rotate: 45 }}
                    transition={{ duration: 0.2, ease: "easeInOut" }}
                  >
                    {isDarkMode ? <Sun size={24} className="text-accent" /> : <Moon size={24} />}
                  </motion.div>
                </AnimatePresence>
              </motion.button>
            </div>

            {/* Mobile Menu Toggle */}
            <div className="flex items-center space-x-3 md:hidden">
              <motion.button
                onClick={toggleDarkMode}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-3 text-primary dark:text-accent hover:bg-muted dark:hover:bg-card rounded-full transition-all duration-300 relative border border-border"
                aria-label="Toggle Dark Mode"
              >
                {/* Glow Ring */}
                <AnimatePresence>
                  {isAnimating && (
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0.6 }}
                      animate={{ scale: 3, opacity: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.6 }}
                      className={cn(
                        "absolute inset-0 rounded-full pointer-events-none",
                        isDarkMode ? "bg-accent" : "bg-primary"
                      )}
                    />
                  )}
                </AnimatePresence>

                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={isDarkMode ? "sun" : "moon"}
                    initial={{ y: -10, opacity: 0, rotate: -45 }}
                    animate={{ y: 0, opacity: 1, rotate: 0 }}
                    exit={{ y: 10, opacity: 0, rotate: 45 }}
                    transition={{ duration: 0.2, ease: "easeInOut" }}
                  >
                    {isDarkMode ? <Sun size={24} className="text-accent" /> : <Moon size={24} />}
                  </motion.div>
                </AnimatePresence>
              </motion.button>
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 text-primary dark:text-accent hover:bg-muted dark:hover:bg-card rounded-full transition-colors"
              >
                {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Nav */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-background border-b border-border overflow-hidden shadow-lg"
            >
              <div className="px-4 py-6 space-y-3">
                {showFullNav && navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMenuOpen(false)}
                    className={cn(
                      "flex items-center space-x-4 px-6 py-4 rounded-2xl text-lg font-bold transition-all",
                      location.pathname === item.path
                        ? "bg-primary dark:bg-accent text-primary-foreground dark:text-accent-foreground shadow-md"
                        : "text-muted-foreground dark:text-muted-foreground hover:bg-muted dark:hover:bg-card hover:text-foreground dark:hover:text-foreground"
                    )}
                  >
                    <item.icon size={24} />
                    <span>{item.name}</span>
                  </Link>
                ))}

                {showFullNav && isStaff && (
                  <Link
                    to="/staff"
                    onClick={() => setIsMenuOpen(false)}
                    className={cn(
                      "flex items-center space-x-4 px-6 py-4 rounded-2xl text-lg font-bold transition-all",
                      location.pathname === "/staff"
                        ? "bg-primary dark:bg-accent text-primary-foreground dark:text-accent-foreground shadow-md"
                        : "text-muted-foreground dark:text-muted-foreground hover:bg-muted dark:hover:bg-card hover:text-foreground dark:hover:text-foreground"
                    )}
                  >
                    <Settings size={24} />
                    <span>Staff Dashboard</span>
                  </Link>
                )}

                {showFullNav && isAdmin && (
                  <Link
                    to="/admin"
                    onClick={() => setIsMenuOpen(false)}
                    className={cn(
                      "flex items-center space-x-4 px-6 py-4 rounded-2xl text-lg font-bold transition-all",
                      location.pathname === "/admin"
                        ? "bg-primary dark:bg-accent text-primary-foreground dark:text-accent-foreground shadow-md"
                        : "text-muted-foreground dark:text-muted-foreground hover:bg-muted dark:hover:bg-card hover:text-foreground dark:hover:text-foreground"
                    )}
                  >
                    <ShieldCheck size={24} />
                    <span>Admin Dashboard</span>
                  </Link>
                )}

                {showFullNav && isSocialManager && (
                  <Link
                    to="/social-dashboard"
                    onClick={() => setIsMenuOpen(false)}
                    className={cn(
                      "flex items-center space-x-4 px-6 py-4 rounded-2xl text-lg font-bold transition-all",
                      location.pathname === "/social-dashboard"
                        ? "bg-primary dark:bg-accent text-primary-foreground dark:text-accent-foreground shadow-md"
                        : "text-muted-foreground dark:text-muted-foreground hover:bg-muted dark:hover:bg-card hover:text-foreground dark:hover:text-foreground"
                    )}
                  >
                    <Send size={24} />
                    <span>Social Dashboard</span>
                  </Link>
                )}

                <Link
                  to="/profile"
                  onClick={() => setIsMenuOpen(false)}
                  className={cn(
                    "flex items-center space-x-4 px-6 py-4 rounded-2xl text-lg font-bold transition-all",
                    location.pathname === "/profile"
                      ? "bg-primary dark:bg-accent text-primary-foreground dark:text-accent-foreground shadow-md"
                      : "text-muted-foreground dark:text-muted-foreground hover:bg-muted dark:hover:bg-card hover:text-foreground dark:hover:text-foreground"
                  )}
                >
                  <User size={24} />
                  <span>{isOnboarded ? "My Profile" : "Sign In/Sign Up"}</span>
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          key={`${location.pathname}-${isDarkMode}`}
          initial={{ opacity: 0.8, scale: 0.99 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          {children}
        </motion.div>
      </main>

      <PWAInstallPrompt />

      {/* Footer */}
      <footer className="bg-muted dark:bg-card border-t border-border py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <img 
            src="/PCEA-Logo-1.png" 
            alt="PCEA Logo" 
            className="w-40 h-40 mx-auto mb-8 bg-white rounded-full p-2 shadow-2xl border border-border object-contain"
          />
          <h3 className="font-serif text-3xl font-bold mb-4 text-foreground dark:text-foreground">PCEA Elijah Kagiri Memorial Church</h3>
          <div className="flex justify-center space-x-6 mb-8">
            <a 
              href="https://www.facebook.com/people/PCEA-Elijah-Kagiri-Memorial-Church/61552543484890/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-12 h-12 bg-[#1877F2] hover:bg-[#166fe5] text-white rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-110"
              title="Facebook Page"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
            </a>
            <a 
              href="https://www.facebook.com/p/PCEA-Elijah-Kagiri-Youth-Fellowship-100081678207286/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-12 h-12 bg-[#1877F2] hover:bg-[#166fe5] text-white rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-110"
              title="Youth Fellowship Facebook"
            >
              <UserPlus size={24} />
            </a>
            <a 
              href="https://www.youtube.com/@pceaelijahkagirimemorialch795" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-12 h-12 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-110"
              title="Main Church YouTube"
            >
              <Video size={24} />
            </a>
            <a 
              href="https://www.youtube.com/results?search_query=pcea+elijah+kagiri+memorial+church+youth" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-12 h-12 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-110"
              title="Youth Church YouTube"
            >
              <Users size={24} />
            </a>
          </div>
          <div className="flex flex-wrap justify-center gap-8 mb-10 text-sm font-bold uppercase tracking-widest">
            <Link to="/about" className="text-muted-foreground hover:text-primary transition-colors">Our History</Link>
            <Link to="/sermons" className="text-muted-foreground hover:text-primary transition-colors">Sermon Archive</Link>
            <Link to="/" className="text-muted-foreground hover:text-primary transition-colors">Weekly Bulletin</Link>
            <Link to="/contact" className="text-muted-foreground hover:text-primary transition-colors">Privacy Policy</Link>
          </div>
          <p className="text-primary dark:text-accent max-w-lg mx-auto mb-10 text-lg font-bold leading-relaxed italic font-serif">
            "Arise and Shine, for your light has come, and the glory of the LORD rises upon you." — Isaiah 60:1
          </p>
          <div className="text-xs text-muted-foreground dark:text-muted-foreground font-bold border-t border-border pt-10">
            &copy; {new Date().getFullYear()} Presbyterian Church of East Africa (PCEA) — Elijah Kagiri Memorial Church. <br/>
            An Official Institutional Platform of the PCEA.
          </div>
        </div>
      </footer>
    </div>
  );
}
