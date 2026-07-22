import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Truck, ShieldCheck, Users, Package, ShoppingBag, TrendingUp } from 'lucide-react';
import { fetchPublicStats } from '../services/api';

const FEATURES = [
  { icon: Truck, title: 'Fast Delivery', desc: 'Same-day delivery across major towns in Ethiopia.' },
  { icon: ShieldCheck, title: 'Secure Payments', desc: 'Pay with CHAPA, Telebirr, or Cash on Delivery.' },
  { icon: Users, title: 'Trusted by Thousands', desc: 'Serving happy customers since day one.' },
  { icon: Package, title: 'Quality Products', desc: 'Every item inspected before it reaches your doorstep.' },
];

export default function About() {
  const [stats, setStats] = useState(null);
  useEffect(() => { fetchPublicStats().then(setStats).catch(() => {}); }, []);

  return (
    <div className="bg-surface min-h-screen">
      {/* Hero */}
      <section className="relative w-full h-[50vh] min-h-[400px] overflow-hidden bg-dark">
        <img src="https://images.unsplash.com/photo-1556740758-90de374c12ad?auto=format&fit=crop&w=1600&q=80" alt="About Gulit" className="absolute inset-0 w-full h-full object-cover opacity-50" onError={(e) => { e.target.src = 'https://picsum.photos/seed/about-hero/1600/600'; }} />
        <div className="absolute inset-0 bg-gradient-to-t from-dark via-dark/40 to-transparent" />
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4">
          <p className="text-gold text-xs tracking-[0.3em] uppercase font-medium mb-3">Est. 2024</p>
          <h1 className="text-white text-4xl sm:text-5xl font-light tracking-tight mb-3">About <span className="font-semibold italic">Gulit</span></h1>
          <p className="text-gray-300 text-sm sm:text-base max-w-md font-light">Your premium online marketplace for everything you need.</p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Mission */}
        <section className="mb-16 text-center">
          <p className="text-gold text-xs tracking-[0.2em] uppercase font-medium mb-2">Our Mission</p>
          <h2 className="text-2xl sm:text-3xl font-light text-text-primary mb-4">Shopping, <span className="font-semibold italic">Simplified</span></h2>
          <p className="text-text-muted text-sm sm:text-base leading-relaxed max-w-2xl mx-auto font-light">
            Gulit makes online shopping accessible, affordable, and reliable for every Ethiopian. We connect local sellers with buyers nationwide through a seamless platform backed by secure payments and real-time order tracking.
          </p>
        </section>

        {/* Stats */}
        {stats && (
          <section className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-16">
            {[{ label: 'Users', value: stats.totalUsers || 0, icon: Users }, { label: 'Products', value: stats.totalProducts || 0, icon: Package }, { label: 'Orders', value: stats.totalOrders || 0, icon: ShoppingBag }, { label: 'Sales (ETB)', value: (stats.annualSales || 0).toLocaleString(), icon: TrendingUp }].map((s) => (
              <div key={s.label} className="bg-white rounded-2xl border border-border-light p-6 text-center hover:shadow-md hover:border-gold/30 transition-all duration-300">
                <s.icon className="w-6 h-6 text-gold mx-auto mb-3" />
                <p className="text-2xl font-bold text-text-primary">{s.value}</p>
                <p className="text-[10px] text-text-muted mt-1 tracking-wider uppercase font-medium">{s.label}</p>
              </div>
            ))}
          </section>
        )}

        {/* Features */}
        <section className="mb-16">
          <p className="text-gold text-xs tracking-[0.2em] uppercase font-medium mb-2 text-center">Why Us</p>
          <h2 className="text-2xl sm:text-3xl font-light text-text-primary mb-8 text-center">Why Choose <span className="font-semibold italic">Gulit</span></h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {FEATURES.map((f) => (
              <div key={f.title} className="bg-white rounded-2xl border border-border-light p-6 flex gap-4 hover:shadow-md hover:border-gold/30 transition-all duration-300">
                <div className="shrink-0 w-10 h-10 rounded-full bg-gold-light flex items-center justify-center"><f.icon className="w-5 h-5 text-gold" /></div>
                <div><h3 className="text-sm font-semibold text-text-primary mb-1">{f.title}</h3><p className="text-xs text-text-muted leading-relaxed">{f.desc}</p></div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="text-center">
          <p className="text-text-muted text-sm mb-4 font-light">Ready to start shopping?</p>
          <Link to="/" className="inline-block bg-dark text-white font-semibold text-sm px-8 py-3.5 rounded-full hover:bg-dark-muted transition tracking-wide">Browse Products</Link>
        </section>
      </div>
    </div>
  );
}
