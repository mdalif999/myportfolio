import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { MessageSquare, X, Send, Sparkles } from "lucide-react";
import { db } from "../lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export default function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'ai', text: string }[]>([
    { role: 'ai', text: "Hi! I'm Alif's AI assistant. How can I help you explore his work today?" }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = input;
    setInput("");
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsTyping(true);

    try {
      // Log to Firestore
      await addDoc(collection(db, 'messages'), {
        message: userMsg,
        createdAt: serverTimestamp(),
        source: 'ai_assistant'
      });

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg }),
      });
      const data = await response.json();
      setMessages(prev => [...prev, { role: 'ai', text: data.text || "I'm sorry, I hit a snag. Try again?" }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'ai', text: "Failed to connect. Is the server running?" }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-8 right-8 w-16 h-16 bg-accent text-white rounded-full flex items-center justify-center shadow-2xl z-50 overflow-hidden group"
      >
        <div className="absolute inset-0 bg-white/20 translate-y-16 group-hover:translate-y-0 transition-transform" />
        <MessageSquare className="relative w-6 h-6" />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.8 }}
            className="fixed bottom-28 right-8 w-[calc(100vw-4rem)] md:w-96 bg-secondary text-primary rounded-sm shadow-[20px_20px_0px_rgba(212,93,64,0.1)] z-50 flex flex-col border border-primary/10 overflow-hidden paper-shadow"
          >
            <div className="p-6 border-b border-primary/5 flex justify-between items-center bg-accent/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-secondary" />
                </div>
                <div>
                  <h3 className="font-display font-bold uppercase tracking-tighter">Human.ai</h3>
                  <p className="text-[10px] uppercase tracking-widest opacity-40">Trained on my brain</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-primary/5 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6 max-h-96 min-h-[300px] scrollbar-hide">
              {messages.map((m, i) => (
                <div 
                  key={i} 
                  className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] p-4 text-sm ${
                    m.role === 'user' 
                      ? 'bg-primary text-secondary rounded-sm rotate-1' 
                      : 'bg-white border border-primary/5 paper-shadow font-hand text-lg -rotate-1'
                  }`}>
                    {m.text}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white border border-primary/5 p-4 rounded-sm">
                    <div className="flex gap-1">
                      <div className="w-1.5 h-1.5 bg-primary/20 rounded-full animate-bounce" />
                      <div className="w-1.5 h-1.5 bg-primary/20 rounded-full animate-bounce [animation-delay:0.2s]" />
                      <div className="w-1.5 h-1.5 bg-primary/20 rounded-full animate-bounce [animation-delay:0.4s]" />
                    </div>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            <div className="p-6 border-t border-primary/5">
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask me something human..."
                  className="flex-1 bg-white border border-primary/5 rounded-sm px-4 py-3 text-sm focus:ring-1 focus:ring-accent outline-none"
                />
                <button 
                  onClick={handleSend}
                  className="p-3 bg-primary text-secondary rounded-sm hover:bg-accent transition-colors"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
              <div className="mt-4 text-[8px] uppercase tracking-widest opacity-30 text-center">
                Built by Alif with love & LLMs
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
