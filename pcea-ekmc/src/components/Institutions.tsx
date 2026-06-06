import React from "react";
import { Link } from "react-router-dom";
import { School, Home, CheckCircle, Info, Phone, Mail, MapPin, GraduationCap, Sparkles, Loader2, Wand2, BookOpen, Heart, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { generateChildrenStory } from "../lib/ai";

const institutions = [
  {
    id: "hostels",
    name: "PCEA Elijah Kagiri Ladies Hostels",
    category: "Accommodation",
    description: "A safe, secure, and spiritually nourishing environment for young ladies and students. Our hostels offer more than just a place to stay; we provide a community of faith located within the serene church compound in Thika.",
    target: "Ladies Only",
    features: [
      "24/7 Security & CCTV Surveillance",
      "Spiritual Mentorship & Weekly Fellowships",
      "High-speed Internet (Wi-Fi)",
      "Clean & Spacious Rooms",
      "Study Areas & Common Rooms",
      "Located within the Main Church Compound",
    ],
    contact: {
      phone: "0721 916097",
      email: "thikaparish@ymail.com",
      location: "552, Thika, Kenya",
    },
    image: "https://images.unsplash.com/photo-1555854817-5b2260d37cbb?auto=format&fit=crop&q=80&w=800",
    color: "bg-pink-50 text-pink-600",
  },
  {
    id: "school",
    name: "PCEA Elijah Kagiri Academy & Junior Secondary",
    category: "Education",
    description: "Providing holistic education grounded in Christian values. We follow the CBC curriculum with an emphasis on character development and academic excellence, from PP1 to Junior Secondary School in Thika.",
    target: "PP1 - Grade 9 (Junior Secondary)",
    features: [
      "CBC & Junior Secondary Curriculum",
      "Qualified & Dedicated Teachers",
      "Modern Computer Lab & Library",
      "Spacious Playgrounds & Sports Facilities",
      "Nutritious School Meals",
      "Located within the Main Church Compound",
    ],
    contact: {
      phone: "0721 916097",
      email: "thikaparish@ymail.com",
      location: "552, Thika, Kenya",
    },
    image: "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&q=80&w=800",
    color: "bg-blue-50 text-blue-600",
  },
];

export default function Institutions() {
  const [childTopic, setChildTopic] = React.useState("");
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [story, setStory] = React.useState<any>(null);

  const handleGenerateStory = async () => {
    if (!childTopic.trim()) return;
    setIsGenerating(true);
    try {
      const generated = await generateChildrenStory(childTopic);
      setStory(generated);
    } catch (err) {
      console.error("Story generation failed", err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-24">
      <div className="text-center space-y-6">
        <h2 className="font-serif text-5xl font-bold text-primary">Our Institutions</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto font-medium text-lg">
          PCEA Elijah Kagiri Memorial Church is committed to serving the community through quality education and safe accommodation.
        </p>
      </div>

      <div className="space-y-32">
        {institutions.map((inst, idx) => (
          <motion.section
            key={inst.id}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: idx * 0.2 }}
            className={`flex flex-col ${idx % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"} gap-16 items-center`}
          >
            {/* Image Side */}
            <div className="w-full lg:w-1/2 relative">
              <div className="aspect-[4/3] rounded-[3rem] overflow-hidden shadow-2xl border-8 border-white dark:border-card">
                <img
                  src={inst.image}
                  alt={inst.name}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className={`absolute -bottom-8 ${idx % 2 === 0 ? "-right-8" : "-left-8"} p-8 bg-white dark:bg-card rounded-[2rem] shadow-2xl border border-border hidden md:block`}>
                <div className="flex items-center space-x-4">
                  <div className={`w-14 h-14 ${inst.color} rounded-2xl flex items-center justify-center`}>
                    {inst.id === "hostels" ? <Home size={28} /> : <GraduationCap size={28} />}
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{inst.category}</p>
                    <p className="font-bold text-lg">{inst.target}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Content Side */}
            <div className="w-full lg:w-1/2 space-y-10">
              <div className="space-y-6">
                <h3 className="font-serif text-4xl font-bold text-primary">{inst.name}</h3>
                <p className="text-foreground leading-relaxed text-xl font-medium font-serif italic">
                  {inst.description}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {inst.features.map((feature, fIdx) => (
                   <div key={fIdx} className="flex items-start space-x-3">
                    <CheckCircle className="text-primary mt-1 flex-shrink-0" size={20} />
                    <span className="text-sm font-bold text-muted-foreground">{feature}</span>
                  </div>
                ))}
              </div>

              <div className="p-10 bg-muted rounded-[2.5rem] border border-border space-y-8 shadow-inner">
                <h4 className="text-xl font-bold flex items-center space-x-3 text-primary">
                  <Info size={24} />
                  <span>Contact & Admission</span>
                </h4>
                <div className="space-y-5">
                  <div className="flex items-center space-x-4 text-lg">
                    <Phone className="text-primary" size={20} />
                    <span className="font-bold">{inst.contact.phone}</span>
                  </div>
                  <div className="flex items-center space-x-4 text-lg">
                    <Mail className="text-primary" size={20} />
                    <span className="font-bold">{inst.contact.email}</span>
                  </div>
                  <div className="flex items-center space-x-4 text-lg">
                    <MapPin className="text-primary" size={20} />
                    <span className="font-bold">{inst.contact.location}</span>
                  </div>
                </div>
                <button className="w-full py-5 bg-primary text-white rounded-full font-bold text-lg hover:shadow-xl transition-all">
                  Enquire Now
                </button>
              </div>
            </div>
          </motion.section>
        ))}
      </div>

      {/* Children's Ministry AI Section */}
      <section className="bg-muted dark:bg-card border border-border rounded-[3rem] p-12 md:p-20 space-y-12 shadow-inner">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Heart size={32} />
          </div>
          <h2 className="font-serif text-4xl font-bold text-primary">Children's Ministry Interactive</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto font-medium text-lg">
            Empowering parents and teachers with AI-powered Bible stories for our little ones.
          </p>
        </div>

        <div className="max-w-3xl mx-auto bg-white dark:bg-muted p-8 rounded-[2.5rem] border border-border shadow-sm space-y-8">
          <div className="space-y-4">
            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center space-x-2">
              <Sparkles size={16} className="text-primary" />
              <span>AI Story Generator</span>
            </label>
            <div className="flex gap-4">
              <input
                value={childTopic}
                onChange={(e) => setChildTopic(e.target.value)}
                placeholder="What should the story be about? (e.g., Kindness, David and Goliath)"
                className="flex-1 px-6 py-4 bg-muted dark:bg-card rounded-2xl border border-border outline-none focus:ring-2 focus:ring-primary font-medium"
              />
              <button
                onClick={handleGenerateStory}
                disabled={isGenerating || !childTopic.trim()}
                className="px-8 py-4 bg-primary text-white rounded-2xl font-bold flex items-center space-x-2 hover:shadow-lg transition-all disabled:opacity-50"
              >
                {isGenerating ? <Loader2 className="animate-spin" size={24} /> : <Wand2 size={24} />}
                <span>Create</span>
              </button>
            </div>
          </div>

          <AnimatePresence>
            {story && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="p-8 bg-primary/5 rounded-[2rem] border border-primary/10 space-y-6 relative"
              >
                <button 
                  onClick={() => setStory(null)}
                  className="absolute top-6 right-6 p-2 hover:bg-primary/10 rounded-full text-primary"
                >
                  <X size={24} />
                </button>
                <div className="space-y-2">
                  <h3 className="text-3xl font-serif font-bold text-primary">{story.title}</h3>
                  <p className="text-xs font-bold uppercase tracking-widest text-primary/60">A Special Bible Story</p>
                </div>
                <div className="prose dark:prose-invert max-w-none">
                  <p className="text-lg leading-relaxed text-foreground font-medium font-serif italic">
                    {story.story}
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-primary/10">
                  <div className="space-y-3">
                    <h4 className="font-bold text-primary flex items-center space-x-2">
                      <BookOpen size={18} />
                      <span>Memory Verse</span>
                    </h4>
                    <p className="text-sm font-bold italic bg-white dark:bg-card p-4 rounded-xl border border-border">
                      {story.memoryVerse}
                    </p>
                  </div>
                  <div className="space-y-3">
                    <h4 className="font-bold text-primary flex items-center space-x-2">
                      <CheckCircle size={18} />
                      <span>Moral Lesson</span>
                    </h4>
                    <p className="text-sm font-medium text-muted-foreground">
                      {story.moral}
                    </p>
                  </div>
                </div>
                <div className="space-y-4 pt-6">
                  <h4 className="font-bold text-primary">Fun Questions to Ask:</h4>
                  <div className="grid grid-cols-1 gap-3">
                    {story.questions.map((q: string, i: number) => (
                      <div key={i} className="flex items-center space-x-3 p-4 bg-white dark:bg-card rounded-xl border border-border text-sm font-bold">
                        <span className="text-primary">{i + 1}.</span>
                        <span>{q}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-primary text-white rounded-[3rem] p-16 md:p-24 text-center space-y-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute top-10 left-10 w-40 h-40 border-4 border-white rounded-full" />
          <div className="absolute bottom-10 right-10 w-60 h-60 border-4 border-white rounded-full" />
        </div>
        <div className="relative z-10 space-y-6">
          <h3 className="font-serif text-5xl font-bold">Invest in the Future</h3>
          <p className="text-white/80 max-w-2xl mx-auto font-medium text-xl leading-relaxed">
            Our institutions are part of our mission to build a better society through faith and education. Visit us today to learn more about our facilities and admission process.
          </p>
          <div className="pt-8">
            <Link
              to="/contact"
              className="px-12 py-5 bg-white text-primary rounded-full font-bold text-xl hover:shadow-2xl hover:-translate-y-1 transition-all inline-block"
            >
              Book a Visit
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
