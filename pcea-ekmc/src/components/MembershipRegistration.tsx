import React from "react";
import { UserPlus, Mail, Phone, MapPin, Briefcase, CheckCircle, AlertCircle, ArrowLeft, Users } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Link } from "react-router-dom";

export default function MembershipRegistration() {
  const [formData, setFormData] = React.useState({
    username: "",
    email: "",
    phone: "",
    residence: "",
    district: "",
    department: "None",
  });
  const [status, setStatus] = React.useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = React.useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setMessage("");

    try {
      const res = await fetch("/api/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus("success");
        setMessage(`Welcome to the family, ${data.username}! Your Member ID is ${data.id}.`);
      } else {
        setStatus("error");
        setMessage(data.error || "Failed to register. Please try again.");
      }
    } catch (err) {
      setStatus("error");
      setMessage("A network error occurred. Please check your connection.");
    }
  };

  if (status === "success") {
    return (
      <div className="max-w-2xl mx-auto py-32 px-4 text-center space-y-10">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-32 h-32 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto shadow-inner"
        >
          <CheckCircle size={64} />
        </motion.div>
        <div className="space-y-6">
          <h2 className="text-5xl font-serif font-bold text-primary">Registration Successful!</h2>
          <p className="text-2xl text-muted-foreground font-medium">{message}</p>
          <p className="text-lg text-muted-foreground italic">Please keep your Member ID safe for future reference.</p>
        </div>
        <div className="pt-10">
          <Link
            to="/"
            className="px-12 py-5 bg-primary text-white rounded-full font-bold text-xl hover:shadow-2xl hover:-translate-y-1 transition-all inline-block"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-16">
      <div className="space-y-6 text-center">
        <Link to="/" className="inline-flex items-center text-primary font-bold hover:underline mb-6 text-lg">
          <ArrowLeft size={20} className="mr-2" />
          Back to Home
        </Link>
        <h2 className="font-serif text-5xl font-bold text-primary">Become a PCEA EKMC Member</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto font-medium text-lg">
          Join our growing community of faith. As a member, you'll be part of our spiritual journey and mission to serve.
        </p>
      </div>

      <div className="bg-white dark:bg-card border border-border rounded-[3rem] overflow-hidden shadow-2xl">
        <div className="grid grid-cols-1 lg:grid-cols-5">
          <div className="lg:col-span-2 bg-primary p-16 text-white space-y-12 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
              <div className="absolute top-10 left-10 w-40 h-40 border-4 border-white rounded-full" />
            </div>
            <div className="space-y-8 relative z-10">
              <h3 className="text-3xl font-serif font-bold">Why Join Us?</h3>
              <ul className="space-y-6">
                <li className="flex items-start space-x-4">
                  <CheckCircle size={24} className="text-white/60 mt-1" />
                  <span className="text-lg font-medium">Spiritual growth and mentorship</span>
                </li>
                <li className="flex items-start space-x-4">
                  <CheckCircle size={24} className="text-white/60 mt-1" />
                  <span className="text-lg font-medium">Access to church departments and groups</span>
                </li>
                <li className="flex items-start space-x-4">
                  <CheckCircle size={24} className="text-white/60 mt-1" />
                  <span className="text-lg font-medium">Community support and fellowship</span>
                </li>
              </ul>
            </div>
            <div className="pt-12 border-t border-white/20 relative z-10">
              <p className="text-lg text-white/70 italic leading-relaxed">
                "For as in one body we have many members, and the members do not all have the same function, so we, though many, are one body in Christ." - Romans 12:4-5
              </p>
            </div>
          </div>

          <div className="lg:col-span-3 p-12 md:p-16">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-3">
                <label className="text-xs font-bold text-primary uppercase tracking-[0.2em] flex items-center space-x-2">
                  <UserPlus size={16} />
                  <span>Full Name / Username</span>
                </label>
                <input
                  required
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full px-8 py-5 bg-muted rounded-[2rem] border-none focus:ring-2 focus:ring-primary outline-none font-medium"
                  placeholder="John Doe"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-xs font-bold text-primary uppercase tracking-[0.2em] flex items-center space-x-2">
                    <Mail size={16} />
                    <span>Email Address</span>
                  </label>
                  <input
                    required
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-8 py-5 bg-muted rounded-[2rem] border-none focus:ring-2 focus:ring-primary outline-none font-medium"
                    placeholder="john@example.com"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-xs font-bold text-primary uppercase tracking-[0.2em] flex items-center space-x-2">
                    <Phone size={16} />
                    <span>Phone Number</span>
                  </label>
                  <input
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-8 py-5 bg-muted rounded-[2rem] border-none focus:ring-2 focus:ring-primary outline-none font-medium"
                    placeholder="+254 700 000 000"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-xs font-bold text-primary uppercase tracking-[0.2em] flex items-center space-x-2">
                    <MapPin size={16} />
                    <span>Residence / Estate</span>
                  </label>
                  <input
                    required
                    value={formData.residence}
                    onChange={(e) => setFormData({ ...formData, residence: e.target.value })}
                    className="w-full px-8 py-5 bg-muted rounded-[2rem] border-none focus:ring-2 focus:ring-primary outline-none font-medium"
                    placeholder="e.g. Kahawa West"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-xs font-bold text-primary uppercase tracking-[0.2em] flex items-center space-x-2">
                    <Users size={16} />
                    <span>Church District</span>
                  </label>
                  <select
                    required
                    value={formData.district}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                    className="w-full px-8 py-5 bg-muted rounded-[2rem] border-none focus:ring-2 focus:ring-primary outline-none appearance-none font-medium"
                  >
                    <option value="">Select District</option>
                    {["Biafra East", "Biafra West", "Central", "Hospital", "Jamhuri", "Kiboko", "Majengo North", "Majengo South", "Ofafa", "Pilot", "Posta", "Power", "Starehe", "Umoja", "UTI", "Ziwani"].map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-3">
                  <label className="text-xs font-bold text-primary uppercase tracking-[0.2em] flex items-center space-x-2">
                    <Briefcase size={16} />
                    <span>Preferred Department (Optional)</span>
                  </label>
                  <select
                    value={formData.department === "None" || ["Music & Worship", "Youth Ministry", "Children Ministry", "Hospitality", "Media & IT", "Evangelism", "JPRC"].includes(formData.department) ? formData.department : "Others"}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === "Others") {
                        setFormData({ ...formData, department: "" });
                      } else {
                        setFormData({ ...formData, department: val });
                      }
                    }}
                    className="w-full px-8 py-5 bg-muted rounded-[2rem] border-none focus:ring-2 focus:ring-primary outline-none appearance-none font-medium"
                  >
                    <option value="None">Select a department</option>
                    <option value="Music & Worship">Music & Worship</option>
                    <option value="Youth Ministry">Youth Ministry</option>
                    <option value="Children Ministry">Children Ministry</option>
                    <option value="Hospitality">Hospitality</option>
                    <option value="Media & IT">Media & IT</option>
                    <option value="Evangelism">Evangelism</option>
                    <option value="JPRC">JPRC (Justice & Peace)</option>
                    <option value="Others">Others</option>
                  </select>
                </div>

                <AnimatePresence>
                  {(formData.department !== "None" && !["Music & Worship", "Youth Ministry", "Children Ministry", "Hospitality", "Media & IT", "Evangelism"].includes(formData.department)) && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-3"
                    >
                      <label className="text-xs font-bold text-primary uppercase tracking-[0.2em] flex items-center space-x-2">
                        <Briefcase size={16} />
                        <span>Specify Department</span>
                      </label>
                      <input
                        required
                        value={formData.department}
                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                        className="w-full px-8 py-5 bg-muted rounded-[2rem] border-none focus:ring-2 focus:ring-primary outline-none font-medium"
                        placeholder="Enter your department"
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <AnimatePresence>
                {status === "error" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="p-6 bg-red-50 text-red-600 rounded-[2rem] flex items-center space-x-3 text-sm font-bold border border-red-100"
                  >
                    <AlertCircle size={20} />
                    <span>{message}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              <button
                type="submit"
                disabled={status === "loading"}
                className="w-full py-6 bg-primary text-white rounded-full font-bold text-xl hover:shadow-2xl hover:-translate-y-1 transition-all shadow-lg disabled:opacity-50"
              >
                {status === "loading" ? "Registering..." : "Register as Member"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
