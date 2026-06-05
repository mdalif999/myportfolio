import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Github, Linkedin, Mail, Twitter, ArrowUpRight, X, Lock } from "lucide-react";
import AIAssistant from "./components/AIAssistant";
import AdminPanel from "./components/AdminPanel";
import { db } from "./lib/firebase";
import { collection, query, orderBy } from "firebase/firestore";
import { useCollection } from "react-firebase-hooks/firestore";

export default function App() {
  const [selectedProject, setSelectedProject] = React.useState<null | any>(null);
  const [isAdminOpen, setIsAdminOpen] = React.useState(false);

  // Fetch projects from Firestore
  const [projectsSnapshot, projectsLoading] = useCollection(
    query(collection(db, 'projects'), orderBy('order', 'asc'))
  );

  // Fetch settings from Firestore
  const [settingsSnapshot] = useCollection(collection(db, 'settings'));
  const settings = settingsSnapshot?.docs.find(d => d.id === 'global')?.data() || {};

  const projects = projectsSnapshot?.docs.map(doc => ({ id: doc.id, ...doc.data() })) || [];

  return (
    <div className="min-h-screen selection:bg-accent selection:text-white relative">
      <div className="noise" />
      <Navbar />
      <main>
        <Hero settings={settings} />
        <PersonalNote settings={settings} />
        <Projects onSelect={setSelectedProject} projects={projects} loading={projectsLoading} />
        <Skills />
        <About settings={settings} />
      </main>
      <Footer onAdminOpen={() => setIsAdminOpen(true)} settings={settings} />
      <AIAssistant />

      <AnimatePresence>
        {isAdminOpen && <AdminPanel onClose={() => setIsAdminOpen(false)} />}
      </AnimatePresence>

      <AnimatePresence>
        {selectedProject && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedProject(null)}
              className="absolute inset-0 bg-primary/95 backdrop-blur-md"
            />
            <motion.div
              layoutId={`project-${selectedProject.id || selectedProject.title}`}
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.9 }}
              className="relative w-full max-w-4xl bg-secondary rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row h-[80vh] md:h-auto"
            >
              <div className="w-full md:w-1/2 h-64 md:h-auto overflow-hidden">
                <img 
                  src={selectedProject.image} 
                  alt={selectedProject.title}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="flex-1 p-8 md:p-12 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-accent mb-2 block">
                        {selectedProject.category}
                      </span>
                      <h3 className="font-display text-4xl md:text-5xl font-bold uppercase tracking-tighter">
                        {selectedProject.title}
                      </h3>
                    </div>
                    <button 
                      onClick={() => setSelectedProject(null)}
                      className="p-3 hover:bg-primary/5 rounded-full transition-colors"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                  <p className="text-primary/70 mb-8 leading-relaxed">
                    {selectedProject.description} This project represents a breakthrough in {selectedProject.category.toLowerCase()}, leveraging frontier technologies to solve complex user problems.
                  </p>
                  <div className="flex gap-4">
                    {selectedProject.liveUrl && (
                      <a 
                        href={selectedProject.liveUrl} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="flex-1 py-4 bg-primary text-secondary font-bold uppercase text-[10px] tracking-widest hover:bg-accent transition-colors flex items-center justify-center gap-2"
                      >
                        Live Preview <ArrowUpRight className="w-4 h-4" />
                      </a>
                    )}
                    {selectedProject.githubUrl && (
                      <a 
                        href={selectedProject.githubUrl} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="flex-1 py-4 border border-primary/20 font-bold uppercase text-[10px] tracking-widest hover:bg-primary hover:text-secondary transition-all flex items-center justify-center gap-2"
                      >
                        Source Code <Github className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>
                <div className="mt-8 pt-8 border-t border-primary/5 flex justify-between items-center text-[10px] uppercase font-bold tracking-widest opacity-40">
                  <span>Client: confidential</span>
                  <span>Year: 2026</span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Navbar() {
  return (
    <nav className="fixed top-0 left-0 w-full z-50 mix-blend-difference px-4 md:px-20 py-6 md:py-8 flex justify-between items-center text-white">
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="font-display font-bold text-lg md:text-xl tracking-tighter"
      >
        LUMINA.
      </motion.div>
      <div className="flex gap-4 md:gap-8 text-[9px] md:text-sm font-medium tracking-widest uppercase">
        {['Projects', 'About', 'Contact'].map((item, i) => (
          <motion.a
            key={item}
            href={`#${item.toLowerCase()}`}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * i }}
            className="hover:text-accent transition-colors whitespace-nowrap"
          >
            {item}
          </motion.a>
        ))}
      </div>
    </nav>
  );
}

function Hero({ settings }: { settings: any }) {
  return (
    <section className="relative h-screen flex flex-col justify-center px-6 md:px-20 overflow-hidden pt-20">
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="flex items-center gap-4 mb-6">
          <span className="w-12 h-[1px] bg-primary/20" />
          <span className="text-[10px] uppercase tracking-[0.4em] font-bold opacity-50">Hello, I'm Alif</span>
        </div>

        <h1 className="font-display text-[12vw] md:text-[10vw] leading-[1.1] md:leading-[0.85] font-bold tracking-tighter uppercase mb-12">
          {settings.heroTitle1 || "I shape"} <br /> 
          <span className="font-serif italic font-normal lowercase text-accent">{settings.heroTitle2 || "problems"}</span> <br className="md:hidden" />
          <span className="block md:ml-[4vw] mt-2 md:mt-0 break-words opacity-40 italic font-serif lowercase">
            {settings.heroTitle3 || "with code."}
          </span>
        </h1>
        
        <div className="flex flex-col md:flex-row gap-16 items-start md:items-end">
          <div className="max-w-md">
            <p className="text-xl text-primary/80 font-medium leading-relaxed mb-8">
              {settings.heroSubtitle || "Engineer focused on crafting high-performance digital experiences. Currently exploring the space between AI and human intuition."}
            </p>
            <div className="flex gap-8 items-center">
              <div className="flex -space-x-4">
                {[1,2,3].map(i => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-secondary bg-primary/5 p-1">
                    <div className="w-full h-full rounded-full bg-primary/10" />
                  </div>
                ))}
              </div>
              <span className="text-xs uppercase font-bold tracking-widest opacity-40">Trusted by 12+ partners</span>
            </div>
          </div>

          <div className="hidden lg:block pb-2">
            <div className="font-hand text-xl opacity-60">Located in Sunny Asia</div>
            <div className="text-[10px] uppercase font-bold tracking-tighter">Current Time: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

function PersonalNote({ settings }: { settings: any }) {
  return (
    <section className="px-6 md:px-20 py-20 border-y border-primary/5">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
        <div className="p-8 bg-secondary border border-primary/5 paper-shadow rotate-1 text-center md:text-left">
          <h4 className="font-display font-bold uppercase text-xs mb-4 text-accent">What I'm reading</h4>
          <p className="italic font-serif opacity-70">{settings.reading || `"The Design of Everyday Things" — Don Norman`}</p>
          <div className="mt-8 font-hand text-xl opacity-40">— recommended.</div>
        </div>
        <div className="p-8 bg-secondary border border-primary/5 paper-shadow -rotate-1 text-center md:text-left">
          <h4 className="font-display font-bold uppercase text-xs mb-4 text-accent">Current focus</h4>
          <p className="font-medium">{settings.focus || "Bringing emotional intelligence to large language models."}</p>
        </div>
        <div className="p-8 bg-secondary border border-primary/5 paper-shadow rotate-2 text-center md:text-left">
          <h4 className="font-display font-bold uppercase text-xs mb-4 text-accent">Philosophy</h4>
          <p className="opacity-70 font-mono text-sm leading-tight">{settings.philosophy || "Simplicity is the ultimate sophistication in technical architecture."}</p>
        </div>
      </div>
    </section>
  );
}

const DEFAULT_PROJECTS = [
  {
    title: "Quantum Dashboard",
    category: "Web Application",
    image: "https://images.unsplash.com/photo-1551288049-bbda38a10ad5?auto=format&fit=crop&q=80&w=800",
    description: "Fintech analytics with real-time data visualization.",
    order: 1
  },
  {
    title: "EcoSphere AI",
    category: "Machine Learning",
    image: "https://images.unsplash.com/photo-1518152006812-edab29b069ac?auto=format&fit=crop&q=80&w=800",
    description: "Predictive modeling for sustainable urban development.",
    order: 2
  },
  {
    title: "Aura Creative",
    category: "E-Commerce",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=800",
    description: "Premium shopping experience for minimalist apparel.",
    order: 3
  },
  {
    title: "Nova Engine",
    category: "Developer Tools",
    image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=800",
    description: "High-performance build tool for modern frontend frameworks.",
    order: 4
  }
];

function Projects({ onSelect, projects, loading }: { onSelect: (project: any) => void, projects: any[], loading: boolean }) {
  if (loading && projects.length === 0) {
    return (
      <section id="projects" className="py-32 px-6 md:px-20 bg-primary text-secondary text-center">
        <p className="font-hand text-2xl opacity-40">Unrolling the blueprints...</p>
      </section>
    );
  }

  // Use local defaults if DB is empty
  const displayProjects = projects.length > 0 ? projects : DEFAULT_PROJECTS;

  return (
    <section id="projects" className="py-32 px-6 md:px-20 bg-primary text-secondary overflow-hidden">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-24 gap-8">
        <h2 className="font-display text-5xl sm:text-7xl md:text-9xl font-bold tracking-tighter uppercase leading-[0.8] md:leading-none">
          Selected <br /> <span className="opacity-40 italic font-serif lowercase">Works</span>
        </h2>
        <p className="max-w-xs text-xs md:text-sm opacity-60 leading-relaxed uppercase tracking-widest">
          A collection of projects that push the boundaries of design and technology.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-24">
        {displayProjects.map((project, idx) => (
          <motion.div 
            key={project.id || idx}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx % 2 * 0.2 }}
            className="group cursor-pointer"
            onClick={() => onSelect(project)}
          >
            <div className="relative aspect-[4/5] overflow-hidden bg-secondary/10 mb-6 paper-shadow">
              <motion.img 
                src={project.image} 
                alt={project.title}
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                referrerPolicy="no-referrer"
              />
              {idx === 0 && (
                <div className="absolute bottom-4 left-4 font-hand text-2xl text-accent -rotate-3 bg-secondary/80 px-2 py-1 select-none">
                  One of my favorites.
                </div>
              )}
              {idx === 2 && (
                <div className="absolute top-4 left-4 font-hand text-2xl text-accent rotate-2 bg-secondary/80 px-2 py-1 select-none">
                  Pure UI joy.
                </div>
              )}
              <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center text-white">
                  <ArrowUpRight className="w-6 h-6" />
                </div>
              </div>
            </div>
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-accent mb-2 block">
                  {project.category}
                </span>
                <h3 className="font-display text-3xl font-bold uppercase tracking-tight mb-2">
                  {project.title}
                </h3>
                <p className="text-sm opacity-60 max-w-xs">
                  {project.description}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function Skills() {
  const skills = ["React", "TypeScript", "Node.js", "Tailwind", "Python", "Cloud Computing", "AI Integration", "UX Design"];
  
  return (
    <section className="py-32 bg-secondary overflow-hidden">
      <div className="px-6 md:px-20 mb-16">
        <h2 className="text-[10px] font-bold uppercase tracking-[0.5em] opacity-40 mb-4 text-center">Toolkit</h2>
      </div>
      
      <div className="relative flex overflow-x-hidden border-y border-primary/10 py-12">
        <motion.div 
          animate={{ x: ["0%", "-50%"] }}
          transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
          className="flex whitespace-nowrap gap-16 pr-16 items-center"
        >
          {[...skills, ...skills].map((skill, i) => (
            <span key={i} className="font-display text-4xl md:text-7xl font-bold uppercase tracking-tighter opacity-20 hover:opacity-100 hover:text-accent transition-all cursor-default">
              {skill}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function About({ settings }: { settings: any }) {
  return (
    <section id="about" className="py-32 px-6 md:px-20 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
      <div className="relative">
        <div className="aspect-[4/5] bg-primary/5 overflow-hidden">
          <img 
            src={settings.portraitImage || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=800"} 
            alt="Portrait"
            className="w-full h-full object-cover grayscale"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="absolute -bottom-8 -right-8 w-48 h-48 bg-accent/10 border border-accent/20 -z-10" />
      </div>
      
      <div>
        <h2 className="font-display text-5xl md:text-7xl font-bold uppercase tracking-tighter mb-8 leading-none">
          I build <span className="font-serif italic font-normal lowercase">impactful</span> <br /> digital solutions.
        </h2>
        <div className="space-y-6 text-primary/70 text-lg leading-relaxed">
          <p>
            With years of experience in the creative tech industry, I've had the privilege of working with global brands and innovative startups.
          </p>
          <p>
            My approach blends mathematical precision with aesthetic sensibility. I believe that every line of code is an opportunity to create something beautiful and functional.
          </p>
          <div className="pt-8 flex flex-col sm:flex-row gap-6">
            <a 
              href={settings.cvUrl || "#"} 
              target="_blank" 
              rel="noopener noreferrer"
              className="px-8 py-4 bg-primary text-secondary font-bold uppercase text-[10px] tracking-[0.2em] hover:bg-accent transition-colors text-center w-full sm:w-auto"
            >
              View CV
            </a>
            <div className="flex items-center justify-center gap-6 px-6 py-4 sm:py-0 border border-primary/10">
              <a href={settings.socials?.github || "#"} target="_blank" rel="noopener noreferrer"><Github className="w-5 h-5 cursor-pointer hover:text-accent" /></a>
              <a href={settings.socials?.linkedin || "#"} target="_blank" rel="noopener noreferrer"><Linkedin className="w-5 h-5 cursor-pointer hover:text-accent" /></a>
              <a href={settings.socials?.twitter || "#"} target="_blank" rel="noopener noreferrer"><Twitter className="w-5 h-5 cursor-pointer hover:text-accent" /></a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer({ onAdminOpen, settings }: { onAdminOpen: () => void, settings: any }) {
  const socials = settings.socials || {};
  const email = socials.email || "contact@mdalif.com";
  
  return (
    <footer id="contact" className="bg-primary text-secondary pt-32 pb-12 px-6 md:px-20">
      <div className="text-center mb-32">
        <h2 className="text-[10px] font-bold uppercase tracking-[0.5em] opacity-40 mb-12 italic">Let's talk</h2>
        <a 
          href={`mailto:${email}`} 
          className="font-display text-xl sm:text-2xl md:text-5xl font-bold tracking-tighter uppercase hover:text-accent transition-colors underline decoration-2 underline-offset-8 md:underline-offset-16 break-all md:break-normal max-w-full inline-block px-4"
        >
          {email}
        </a>
      </div>
      
      <div className="flex flex-col md:flex-row justify-between items-center gap-12 border-t border-secondary/10 pt-12">
        <div className="font-display font-medium text-xl tracking-tighter">
          ALIF.
        </div>
        
        <div className="flex flex-col md:flex-row items-center gap-4 md:gap-12 text-[10px] font-bold uppercase tracking-widest opacity-40 text-center">
          <span>&copy; {new Date().getFullYear()} MD ALIF</span>
          <span className="hidden md:inline font-hand text-lg lowercase tracking-normal opacity-100 italic">
            {settings.footerTagline || "everything begins with an idea."}
          </span>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="font-hand text-xl md:text-2xl -rotate-12 opacity-30 select-none text-secondary">Signing off,</div>
          <div className="flex gap-4 md:gap-6">
            <button onClick={onAdminOpen} className="p-2 md:p-3 border border-secondary/10 rounded-full hover:bg-accent hover:border-accent transition-all text-secondary/40 hover:text-white group">
              <Lock className="w-4 h-4 group-hover:animate-pulse" />
            </button>
            <a href={socials.github || "#"} target="_blank" rel="noopener noreferrer" className="p-2 md:p-3 border border-secondary/10 rounded-full hover:bg-secondary hover:text-primary transition-all">
              <Github className="w-4 h-4" />
            </a>
            <a href={socials.linkedin || "#"} target="_blank" rel="noopener noreferrer" className="p-2 md:p-3 border border-secondary/10 rounded-full hover:bg-secondary hover:text-primary transition-all">
              <Linkedin className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
