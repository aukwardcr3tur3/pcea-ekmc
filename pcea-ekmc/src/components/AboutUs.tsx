import React from "react";
import { motion } from "motion/react";
import { Church, History, Users, Calendar, ShieldCheck, Globe, Heart, BookOpen, Star, ArrowRight } from "lucide-react";

const calendarEvents = [
  { name: "Christian Education Sunday", date: "8th March 2026" },
  { name: "Thanks Giving Sunday", date: "5th April 2026" },
  { name: "Youth Sunday", date: "26th April 2026" },
  { name: "Woman's Guild Sunday", date: "7th June 2026" },
  { name: "JPRC Sunday", date: "19th July 2026" },
  { name: "Brigade Sunday", date: "9th August 2026" },
  { name: "Nendeni Sunday", date: "13th September 2026" },
  { name: "Health Sunday", date: "11th October 2026" },
  { name: "PCMF Sunday", date: "8th November 2026" },
  { name: "Church School Sunday", date: "6th December 2026" },
];

const governance = [
  {
    title: "General Assembly",
    subtitle: "High Court of the Church",
    items: [
      "Officials of General Assembly",
      "Co-opted Business Committee Members",
      "Past Moderators",
      "2/3 of ministers of presbytery court paired",
      "1/3 of retired ministers paired",
      "Departmental heads"
    ]
  },
  {
    title: "General Administration Committee",
    items: [
      "General Assembly Officials",
      "One Minister, One Elder from each presbytery",
      "Past Moderators",
      "Co-opted Business Committee Members",
      "Departmental Heads"
    ]
  },
  {
    title: "Business Committee",
    items: [
      "General Assembly Officials",
      "Clergy and Laity in parity from each presbytery",
      "Past Moderators",
      "Co-opted Business Committee Members"
    ]
  },
  {
    title: "Presbytery",
    items: [
      "Parochial Ministers Paired",
      "Institutional Ministers Paired",
      "1/3 Retired Ministers Paired"
    ]
  },
  {
    title: "Parish / Congregation",
    items: [
      "PCMF",
      "Woman's Guild",
      "Youth",
      "Boys & Girls Brigade",
      "Church School",
      "Christian Education",
      "Evangelism (Mission)",
      "Health",
      "JPRC"
    ]
  }
];

export default function AboutUs() {
  return (
    <div className="space-y-32 pb-20">
      {/* Hero Section */}
      <section className="relative h-[60vh] flex items-center justify-center overflow-hidden rounded-[3rem] bg-primary text-white p-8 text-center shadow-2xl">
        <div className="relative z-10 max-w-4xl mx-auto space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <span className="text-xs font-bold uppercase tracking-[0.3em] text-white/60">Our Identity & Heritage</span>
            <h1 className="font-serif text-5xl sm:text-7xl font-bold leading-tight">
              About PCEA
            </h1>
          </motion.div>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl sm:text-2xl text-white/80 max-w-2xl mx-auto font-medium leading-relaxed"
          >
            A community of faith, hope, and love since 1891.
          </motion.p>
        </div>
        <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[50rem] h-[50rem] bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl" />
      </section>

      {/* Sacred Values - Pillar Style */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-8">
        {[
          { icon: Heart, title: "Love", desc: "Unconditional love for God and all humanity." },
          { icon: ShieldCheck, title: "Integrity", desc: "Living with transparency and biblical honesty." },
          { icon: Users, title: "Inclusivity", desc: "A home for everyone, regardless of background." },
          { icon: BookOpen, title: "Stewardship", desc: "Faithful management of God's resources." },
        ].map((v, i) => (
          <div key={i} className="text-center space-y-4">
            <div className="w-20 h-20 mx-auto bg-primary/5 text-primary rounded-full flex items-center justify-center border border-primary/10">
              <v.icon size={32} />
            </div>
            <h4 className="font-serif text-xl font-bold">{v.title}</h4>
            <p className="text-xs text-muted-foreground font-medium">{v.desc}</p>
          </div>
        ))}
      </section>

      {/* Local Church Context */}
      <section className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
        <div className="order-2 lg:order-1 relative">
           <div className="aspect-[4/5] rounded-[3rem] bg-zinc-200 overflow-hidden shadow-2xl relative z-10">
              <img 
                src="https://images.unsplash.com/photo-1548625361-195fe0182794?auto=format&fit=crop&q=80" 
                alt="Elijah Kagiri Church" 
                className="w-full h-full object-cover"
              />
           </div>
           <div className="absolute -bottom-8 -right-8 w-48 h-48 bg-accent rounded-[2rem] -z-10" />
           <div className="absolute top-1/2 -left-12 -translate-y-1/2 w-4 bg-primary h-32 rounded-full" />
        </div>
        <div className="order-1 lg:order-2 space-y-8">
          <div className="space-y-4">
            <span className="display-font text-accent">Our Local History</span>
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-primary">
              The Legacy of <br/> Elijah Kagiri
            </h2>
            <div className="h-1 w-20 bg-primary/20 rounded-full" />
          </div>
          <div className="space-y-6 text-lg text-muted-foreground leading-relaxed font-medium">
            <p>
              Elijah Kagiri Memorial Church stands as a testament to the vision of its founders and the enduring faith of the PCEA community. Established to honor the legacy of Elder Elijah Kagiri, the church has grown from a humble gathering into a cornerstone of faith in the region.
            </p>
            <p>
              Our sanctuary serves as a beacon of hope, providing a sacred space for worship, reflection, and community transformation. We are committed to continuing the work of "Arise and Shine" in all we do.
            </p>
          </div>
        </div>
      </section>

      {/* Session & Council Leadership - CRITICAL for acceptance */}
      <section className="space-y-16">
        <div className="text-center space-y-4">
          <h2 className="font-serif text-5xl font-bold text-primary">The Kirk Session</h2>
          <p className="text-muted-foreground text-xl font-medium max-w-2xl mx-auto">
            Our church is governed by the Session, composed of the Parish Minister and ordained Elders.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { name: "Rev. Dr. Patrick Mutahi", role: "Parish Minister", bio: "Leading our spiritual vision and sacraments." },
            { name: "Elder Solomon Karanja", role: "Session Clerk", bio: "Overseeing the administration and records of the session." },
            { name: "Elder Mary Wanjiku", role: "Parish Treasurer", bio: "Managing the church's financial resources with integrity." },
            { name: "Elder Josephat Maina", role: "Admin & Logistics", bio: "Coordinating church operations and institutional growth." },
          ].map((leader, i) => (
            <div key={i} className="institutional-card group hover:scale-[1.02] transition-all text-center space-y-6">
              <div className="w-24 h-24 mx-auto bg-zinc-100 rounded-full flex items-center justify-center font-serif text-3xl font-bold text-primary border-4 border-white shadow-md">
                {leader.name.split(' ').map(n=>n[0]).join('').slice(0,2)}
              </div>
              <div className="space-y-2">
                <h4 className="text-xl font-bold font-serif">{leader.name}</h4>
                <p className="display-font text-accent">{leader.role}</p>
              </div>
              <p className="text-sm text-muted-foreground font-medium leading-relaxed">
                {leader.bio}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* History Timeline */}
      <section className="bg-muted/30 rounded-[4rem] p-12 sm:p-20 space-y-16">
        <div className="text-center space-y-4">
          <h2 className="font-serif text-5xl font-bold text-primary flex items-center justify-center space-x-4">
            <History size={40} />
            <span>Our History</span>
          </h2>
          <p className="text-muted-foreground text-xl font-medium max-w-2xl mx-auto">
            A journey of faith that began in 1891 and continues to transform lives today.
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-12">
          <div className="relative pl-12 border-l-2 border-primary/20 space-y-12">
            <div className="relative">
              <div className="absolute -left-[3.25rem] top-0 w-6 h-6 bg-primary rounded-full border-4 border-white shadow-md" />
              <div className="space-y-4">
                <h3 className="text-2xl font-serif font-bold text-primary">1891 - The Beginning</h3>
                <p className="text-muted-foreground leading-relaxed font-medium">
                  Missionaries from Scotland arrived in Kibwezi and established a mission under the name “East African Scottish Mission”. The first temporary Church was established at Kibwezi together with the first School with two pupils in 1892.
                </p>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -left-[3.25rem] top-0 w-6 h-6 bg-primary rounded-full border-4 border-white shadow-md" />
              <div className="space-y-4">
                <h3 className="text-2xl font-serif font-bold text-primary">1898 - Moving to Thogoto</h3>
                <p className="text-muted-foreground leading-relaxed font-medium">
                  Missionaries led by Thomas Watson moved the mission station from Kibwezi to Dagoretti as “Church of Scotland Mission”. In 1899, the mission moved to Thogoto in Kikuyu.
                </p>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -left-[3.25rem] top-0 w-6 h-6 bg-primary rounded-full border-4 border-white shadow-md" />
              <div className="space-y-4">
                <h3 className="text-2xl font-serif font-bold text-primary">1908 - Medical Mission</h3>
                <p className="text-muted-foreground leading-relaxed font-medium">
                  Hunter Memorial Hospital (now PCEA Kikuyu Hospital) was opened, following the arrival of Dr. John W. Arthur in 1907.
                </p>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -left-[3.25rem] top-0 w-6 h-6 bg-primary rounded-full border-4 border-white shadow-md" />
              <div className="space-y-4">
                <h3 className="text-2xl font-serif font-bold text-primary">1920 - Church Government</h3>
                <p className="text-muted-foreground leading-relaxed font-medium">
                  A form of Church government was set up and Elders were ordained. Parish Sessions were formed for Kikuyu, Tumutumu, and St. Andrew’s, Nairobi.
                </p>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -left-[3.25rem] top-0 w-6 h-6 bg-primary rounded-full border-4 border-white shadow-md" />
              <div className="space-y-4">
                <h3 className="text-2xl font-serif font-bold text-primary">1956 - The Modern PCEA</h3>
                <p className="text-muted-foreground leading-relaxed font-medium">
                  PCEA as it is today was formed upon conclusion of a merger between the Gospel Missionary Society and the Church of Scotland Mission. The first General Assembly signified the beginning of a successful journey of growth.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Governance Section */}
      <section className="max-w-6xl mx-auto space-y-16 px-8">
        <div className="text-center space-y-4">
          <h2 className="font-serif text-5xl font-bold text-primary flex items-center justify-center space-x-4">
            <ShieldCheck size={40} />
            <span>Church Governance</span>
          </h2>
          <p className="text-muted-foreground text-xl font-medium max-w-2xl mx-auto">
            Our worship and governance system is based on reformed theology.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {governance.map((level, idx) => (
            <div key={level.title} className="p-8 bg-white dark:bg-card border border-border rounded-[2.5rem] space-y-6 shadow-sm hover:shadow-md transition-all">
              <div className="space-y-2">
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary font-bold text-xl">
                  {idx + 1}
                </div>
                <h3 className="text-2xl font-serif font-bold text-primary">{level.title}</h3>
                {level.subtitle && <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{level.subtitle}</p>}
              </div>
              <ul className="space-y-3">
                {level.items.map((item) => (
                  <li key={item} className="flex items-start space-x-3 text-sm font-medium text-muted-foreground">
                    <div className="w-1.5 h-1.5 bg-primary/30 rounded-full mt-1.5 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Calendar Section */}
      <section className="bg-primary text-white rounded-[4rem] p-12 sm:p-20 space-y-16 shadow-2xl overflow-hidden relative">
        <div className="relative z-10 text-center space-y-4">
          <h2 className="font-serif text-5xl font-bold flex items-center justify-center space-x-4">
            <Calendar size={40} />
            <span>Church Calendar 2026</span>
          </h2>
          <p className="text-white/80 text-xl font-medium max-w-2xl mx-auto">
            Important dates and celebrations in our church year.
          </p>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
          {calendarEvents.map((event) => (
            <div key={event.name} className="flex items-center justify-between p-6 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl">
              <span className="font-bold text-lg">{event.name}</span>
              <span className="text-sm font-medium text-white/60">{event.date}</span>
            </div>
          ))}
        </div>

        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
      </section>

      {/* Ecumenical Membership */}
      <section className="max-w-4xl mx-auto text-center space-y-12">
        <div className="space-y-4">
          <h2 className="font-serif text-4xl font-bold text-primary">Ecumenical Membership</h2>
          <p className="text-muted-foreground text-lg leading-relaxed font-medium">
            We are an ecumenical church with membership in several global and regional councils, involved in many endeavors across the world.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-4">
          {["NCCK", "AACC", "WCC", "WCRC"].map((org) => (
            <span key={org} className="px-8 py-4 bg-muted rounded-full font-bold text-primary border border-border">
              {org}
            </span>
          ))}
        </div>
      </section>
    </div>
  );
}
