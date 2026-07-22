import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2, Bot, User } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5252';

const STORE_PRODUCTS = [
  { name: 'Samsung Galaxy A55', price: 38500, stock: 8, category: 'Electronics', description: '128GB storage, bright AMOLED display, dual SIM support, and all-day battery.' },
  { name: 'Leather Crossbody Bag', price: 4200, stock: 14, category: 'Fashion', description: 'Compact everyday bag with adjustable strap and secure zip pockets.' },
  { name: 'Ceramic Dinner Set', price: 6800, stock: 5, category: 'Home', description: 'Durable 16-piece dinner set for family meals and small gatherings.' },
  { name: 'Running Shoes', price: 7900, stock: 10, category: 'Sports', description: 'Lightweight road running shoes with breathable mesh upper.' },
  { name: 'Atomic Habits', price: 1250, stock: 20, category: 'Books', description: 'Practical guide for building better habits and improving daily systems.' },
  { name: 'Bluetooth Speaker', price: 3600, stock: 3, category: 'Electronics', description: 'Portable speaker with clear sound, USB-C charging, and splash resistance.' },
];

const STORE_PROFILE = { name: 'GULIT', about: 'Online store for electronics, fashion, home essentials, sports gear, and books.', orderFlow: 'Sign in, browse, add to cart, checkout with COD or Chapa.', delivery: 'Delivered to your address with optional map pinning.' };

function formatPrice(v) { return `ETB ${Number(v || 0).toLocaleString('en-US')}`; }

function findProduct(q) {
  const n = String(q || '').toLowerCase();
  return STORE_PRODUCTS.find((p) => { const h = `${p.name} ${p.category} ${p.description}`.toLowerCase(); return h.includes(n) || n.includes(p.name.toLowerCase()) || n.includes(p.category.toLowerCase()); });
}

function buildLocalReply(msg) {
  const t = String(msg || '').toLowerCase();
  if (!t.trim()) return `Hi! I'm ${STORE_PROFILE.name}'s assistant. Ask me about products, prices, orders, payments, or delivery.`;
  if (t.includes('hello') || t.includes('hi') || t.includes('hey')) return `Hello! I can help you browse products, check prices, and learn about delivery.`;
  if (t.includes('about') || t.includes('who')) return `${STORE_PROFILE.name} is an online store focused on quality products across electronics, fashion, home, sports, and books.`;
  if (t.includes('product') || t.includes('categor')) return `We offer Electronics, Fashion, Home, Sports, and Books. Popular items: Samsung Galaxy A55, Running Shoes, Atomic Habits.`;
  if (t.includes('price') || t.includes('cost') || t.includes('how much')) { const p = findProduct(t); return p ? `${p.name} is ${formatPrice(p.price)}. ${p.stock} in stock.` : `Prices vary. Samsung Galaxy A55: ${formatPrice(38500)}, Bluetooth Speaker: ${formatPrice(3600)}.`; }
  if (t.includes('order') || t.includes('checkout')) return `Sign in, add items to cart, and proceed to checkout. Pay with COD or Chapa.`;
  if (t.includes('payment') || t.includes('chapa')) return `Pay during checkout using cash on delivery or Chapa.`;
  if (t.includes('delivery') || t.includes('ship')) return `Delivered to your address. Pin your delivery spot on the map during checkout.`;
  const p = findProduct(t); return p ? `${p.name} is ${formatPrice(p.price)} in ${p.category}. ${p.description}` : `I can help with products, prices, orders, payments, and delivery. Ask me anything!`;
}

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([{ role: 'bot', text: "Hi! I'm GULIT's assistant. Ask me anything!" }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, loading]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim(); setInput('');
    setMessages((p) => [...p, { role: 'user', text: userMsg }]); setLoading(true);
    try {
<<<<<<< HEAD
      const res = await fetch(`${API_BASE}/api/chat`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: userMsg }) });
      let data = {}; try { data = await res.json(); } catch { data = {}; }
      setMessages((p) => [...p, { role: 'bot', text: data.reply || data.message || buildLocalReply(userMsg) }]);
    } catch { setMessages((p) => [...p, { role: 'bot', text: buildLocalReply(userMsg) }]); } finally { setLoading(false); }
=======
      const res = await fetch(`${API_BASE}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg, history: [...messages, { role: 'user', text: userMsg }] }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessages(prev => [...prev, { role: 'bot', text: data.message || 'Something went wrong. Please try again.' }]);
      } else {
        setMessages(prev => [...prev, { role: 'bot', text: data.reply }]);
      }
    } catch {
      setMessages(prev => [...prev, { role: 'bot', text: 'Connection error. Please try again later.' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
>>>>>>> e0d365b9b0b0e4f76c7a1d4a0be1a2390b517306
  };

  return (
    <>
      <button onClick={() => setIsOpen(!isOpen)} className="fixed bottom-6 right-6 z-50 bg-dark hover:bg-dark-muted text-white rounded-full w-12 h-12 flex items-center justify-center shadow-xl transition-all hover:scale-105 active:scale-95" aria-label="Toggle chat">
        {isOpen ? <X size={20} /> : <MessageCircle size={20} />}
      </button>
      {isOpen && (
        <div className="fixed bottom-20 right-6 z-50 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-border-light flex flex-col overflow-hidden">
          <div className="bg-dark text-white px-4 py-3 flex items-center gap-2"><Bot size={18} /><span className="font-semibold text-sm">GULIT Assistant</span></div>
          <div className="flex-1 p-3 space-y-3 overflow-y-auto max-h-80 min-h-56 bg-surface">
            {messages.map((m, i) => (
              <div key={i} className={`flex gap-2 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {m.role === 'bot' && <div className="w-6 h-6 rounded-full bg-gold-light flex items-center justify-center shrink-0 mt-0.5"><Bot size={12} className="text-gold" /></div>}
                <div className={`max-w-[80%] px-3 py-2 rounded-2xl text-xs leading-relaxed ${m.role === 'user' ? 'bg-dark text-white rounded-br-md' : 'bg-white border border-border-light text-text-primary rounded-bl-md'}`}>{m.text}</div>
                {m.role === 'user' && <div className="w-6 h-6 rounded-full bg-dark flex items-center justify-center shrink-0 mt-0.5"><User size={12} className="text-white" /></div>}
              </div>
            ))}
            {loading && <div className="flex gap-2"><div className="w-6 h-6 rounded-full bg-gold-light flex items-center justify-center shrink-0"><Bot size={12} className="text-gold" /></div><div className="bg-white border border-border-light rounded-2xl rounded-bl-md px-3 py-2"><Loader2 size={14} className="animate-spin text-gold" /></div></div>}
            <div ref={chatEndRef} />
          </div>
          <div className="border-t border-border-light p-3 bg-white flex gap-2">
            <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }} placeholder="Type a message..." className="flex-1 border border-border-light rounded-full px-4 py-2 text-xs outline-none focus:ring-2 focus:ring-gold transition" disabled={loading} />
            <button onClick={handleSend} disabled={loading || !input.trim()} className="w-8 h-8 rounded-full bg-dark hover:bg-dark-muted disabled:bg-gray-200 text-white flex items-center justify-center transition"><Send size={14} /></button>
          </div>
        </div>
      )}
    </>
  );
}
