import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Users, User, Mail, Phone, CheckCircle, ArrowLeft, Loader2, MapPin } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function GroupRegistration() {
  const { groupName } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = React.useState({
    name: "",
    email: "",
    phone: "",
    estate: "",
  });
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isSuccess, setIsSuccess] = React.useState(false);
  const [error, setError] = React.useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/registrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, groupName }),
      });

      if (res.ok) {
        setIsSuccess(true);
        setTimeout(() => navigate("/"), 3000);
      } else {
        const data = await res.json();
        setError(data.error || "Failed to register. Please try again.");
      }
    } catch (err) {
      setError("A network error occurred. Please try again.");
      console.error("Failed to register", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="mb-8 flex items-center space-x-2 text-[#1E40AF] dark:text-blue-400 hover:underline font-medium"
      >
        <ArrowLeft size={20} />
        <span>Back to Home</span>
      </button>

      <div className="bg-card dark:bg-card border border-border dark:border-border rounded-3xl overflow-hidden shadow-xl">
        <div className="p-8 bg-[#1E40AF] dark:bg-blue-600 text-white text-center space-y-2">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users size={32} />
          </div>
          <h2 className="text-3xl font-serif font-bold">Group Registration</h2>
          <p className="text-white/80">Joining the <span className="font-bold text-white">{groupName}</span></p>
        </div>

        <div className="p-8">
          <AnimatePresence mode="wait">
            {!isSuccess ? (
              <motion.form
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onSubmit={handleSubmit}
                className="space-y-6"
              >
                <div className="space-y-2">
                  <label className="text-sm font-bold text-[#1E40AF] dark:text-blue-400 uppercase tracking-wider flex items-center space-x-2">
                    <User size={16} />
                    <span>Full Name</span>
                  </label>
                  <input
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-6 py-4 bg-muted dark:bg-muted text-foreground dark:text-foreground border-none rounded-2xl focus:ring-2 focus:ring-[#1E40AF] dark:focus:ring-blue-400 outline-none"
                    placeholder="Enter your full name"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-[#1E40AF] dark:text-blue-400 uppercase tracking-wider flex items-center space-x-2">
                    <Mail size={16} />
                    <span>Email Address</span>
                  </label>
                  <input
                    required
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-6 py-4 bg-muted dark:bg-muted text-foreground dark:text-foreground border-none rounded-2xl focus:ring-2 focus:ring-[#1E40AF] dark:focus:ring-blue-400 outline-none"
                    placeholder="yourname@example.com"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-[#1E40AF] dark:text-blue-400 uppercase tracking-wider flex items-center space-x-2">
                    <Phone size={16} />
                    <span>Phone Number</span>
                  </label>
                  <input
                    required
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-6 py-4 bg-muted dark:bg-muted text-foreground dark:text-foreground border-none rounded-2xl focus:ring-2 focus:ring-[#1E40AF] dark:focus:ring-blue-400 outline-none"
                    placeholder="+254 7XX XXX XXX"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-[#1E40AF] dark:text-blue-400 uppercase tracking-wider flex items-center space-x-2">
                    <MapPin size={16} />
                    <span>Current Estate</span>
                  </label>
                  <input
                    required
                    value={formData.estate}
                    onChange={(e) => setFormData({ ...formData, estate: e.target.value })}
                    className="w-full px-6 py-4 bg-muted dark:bg-muted text-foreground dark:text-foreground border-none rounded-2xl focus:ring-2 focus:ring-[#1E40AF] dark:focus:ring-blue-400 outline-none"
                    placeholder="e.g. Kahawa Sukari, Githurai 44"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-5 bg-[#1E40AF] dark:bg-blue-600 text-white rounded-full font-bold text-xl hover:bg-[#1E3A8A] dark:hover:bg-blue-700 transition-all shadow-lg flex items-center justify-center space-x-3 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="animate-spin" size={24} />
                      <span>Registering...</span>
                    </>
                  ) : (
                    <span>Confirm Registration</span>
                  )}
                </button>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-2xl text-sm font-bold text-center"
                  >
                    {error}
                  </motion.div>
                )}
              </motion.form>
            ) : (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-12 space-y-6"
              >
                <div className="w-20 h-20 bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle size={48} />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-foreground dark:text-foreground">Registration Successful!</h3>
                  <p className="text-muted-foreground dark:text-muted-foreground">
                    Thank you for joining the {groupName}. We will contact you soon with more information.
                  </p>
                </div>
                <p className="text-xs text-muted-foreground dark:text-muted-foreground animate-pulse">Redirecting to home page...</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
