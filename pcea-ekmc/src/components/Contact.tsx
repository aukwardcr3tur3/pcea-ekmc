import React from "react";
import { Mail, Phone, MapPin, Send, MessageSquare, Clock } from "lucide-react";
import { motion } from "motion/react";

export default function Contact() {
  const [formData, setFormData] = React.useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isSuccess, setIsSuccess] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    setIsSuccess(true);
    setFormData({ name: "", email: "", subject: "", message: "" });
    setTimeout(() => setIsSuccess(false), 5000);
  };

  return (
    <div className="space-y-24">
      <div className="text-center space-y-6">
        <h2 className="font-serif text-5xl font-bold text-primary">Contact Us</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto font-medium text-lg">
          Have a question, a prayer request, or want to book a visit to our institutions? We'd love to hear from you.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
        {/* Contact Info */}
        <div className="space-y-10">
          <div className="bg-white dark:bg-card p-10 rounded-[3rem] border border-border shadow-2xl space-y-8">
            <h3 className="font-serif text-3xl font-bold text-primary">Get in Touch</h3>
            
            <div className="space-y-8">
              <div className="flex items-start space-x-5">
                <div className="w-12 h-12 bg-muted rounded-2xl flex items-center justify-center text-primary flex-shrink-0 shadow-inner">
                  <Phone size={24} />
                </div>
                <div>
                  <p className="font-bold text-lg">Phone</p>
                  <p className="text-muted-foreground font-medium">0721 916097</p>
                </div>
              </div>

              <div className="flex items-start space-x-5">
                <div className="w-12 h-12 bg-muted rounded-2xl flex items-center justify-center text-primary flex-shrink-0 shadow-inner">
                  <Mail size={24} />
                </div>
                <div>
                  <p className="font-bold text-lg">Email</p>
                  <p className="text-muted-foreground font-medium">thikaparish@ymail.com</p>
                </div>
              </div>

              <div className="flex items-start space-x-5">
                <div className="w-12 h-12 bg-muted rounded-2xl flex items-center justify-center text-primary flex-shrink-0 shadow-inner">
                  <MapPin size={24} />
                </div>
                <div>
                  <p className="font-bold text-lg">Location</p>
                  <p className="text-muted-foreground font-medium">552, Thika, Kenya</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-primary p-10 rounded-[3rem] text-white space-y-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <h3 className="font-serif text-3xl font-bold relative z-10">Office Hours</h3>
            <div className="space-y-5 relative z-10">
              <div className="flex justify-between items-center text-lg">
                <span className="text-white/80 font-medium">Mon - Fri</span>
                <span className="font-bold">8:00 AM - 5:00 PM</span>
              </div>
              <div className="flex justify-between items-center text-lg">
                <span className="text-white/80 font-medium">Saturday</span>
                <span className="font-bold">9:00 AM - 1:00 PM</span>
              </div>
              <div className="flex justify-between items-center text-lg">
                <span className="text-white/80 font-medium">Sunday</span>
                <span className="font-bold">Services Only</span>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-card p-10 md:p-16 rounded-[3rem] border border-border shadow-2xl">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-xs font-bold text-primary uppercase tracking-[0.2em]">Your Name</label>
                  <input
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-8 py-5 bg-muted rounded-[2rem] border-none focus:ring-2 focus:ring-primary outline-none transition-all font-medium"
                    placeholder="John Doe"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-xs font-bold text-primary uppercase tracking-[0.2em]">Email Address</label>
                  <input
                    required
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-8 py-5 bg-muted rounded-[2rem] border-none focus:ring-2 focus:ring-primary outline-none transition-all font-medium"
                    placeholder="john@example.com"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-bold text-primary uppercase tracking-[0.2em]">Subject</label>
                <input
                  required
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-8 py-5 bg-muted rounded-[2rem] border-none focus:ring-2 focus:ring-primary outline-none transition-all font-medium"
                  placeholder="How can we help?"
                />
              </div>

              <div className="space-y-3">
                <label className="text-xs font-bold text-primary uppercase tracking-[0.2em]">Message</label>
                <textarea
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  rows={6}
                  className="w-full px-8 py-5 bg-muted rounded-[2rem] border-none focus:ring-2 focus:ring-primary outline-none transition-all font-medium resize-none"
                  placeholder="Write your message here..."
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-6 bg-primary text-white rounded-full font-bold text-xl hover:shadow-2xl hover:-translate-y-1 transition-all flex items-center justify-center space-x-4 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <Clock className="animate-spin" />
                ) : (
                  <>
                    <Send size={28} />
                    <span>Send Message</span>
                  </>
                )}
              </button>

              {isSuccess && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-6 bg-green-50 text-green-700 rounded-[2rem] text-center font-bold border border-green-100"
                >
                  Message sent successfully! We'll get back to you soon.
                </motion.div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
