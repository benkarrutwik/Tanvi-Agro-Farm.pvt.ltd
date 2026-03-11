import React, { useEffect, useRef, useState } from 'react';
import { Egg, Bird, ArrowRight, Menu, X, CheckCircle2, Instagram, Sprout, Quote, Star, Loader2, Phone, Mail, MapPin, ChevronRight } from 'lucide-react';
import 'animate.css';
import { generateOrganicLogo, generateNaturalLogo } from './services/logoService';

// A simple wrapper to trigger Animate.css classes on scroll
const FadeInOnScroll = ({ children, className = '', delay = '' }: { children: React.ReactNode, className?: string, delay?: string, key?: any }) => {
  const [isVisible, setIsVisible] = useState(false);
  const domRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    if (domRef.current) {
      observer.observe(domRef.current);
    }

    return () => {
      if (domRef.current) observer.unobserve(domRef.current);
    };
  }, []);

  return (
    <div
      ref={domRef}
      className={`${className} ${isVisible ? `animate__animated animate__fadeInUp animate__faster ${delay}` : 'opacity-0'}`}
    >
      {children}
    </div>
  );
};

export default function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [chickenQty, setChickenQty] = useState('0');
  const [eggsQty, setEggsQty] = useState('0');
  const [organicLogo, setOrganicLogo] = useState<string | null>(null);
  const [naturalLogo, setNaturalLogo] = useState<string | null>(null);
  const [isLogoLoading, setIsLogoLoading] = useState(true);

  const chickenPrices: Record<string, number> = { '0': 0, '1': 1100, '2': 2100, '3': 3100 };
  const eggsPrices: Record<string, number> = { '0': 0, '30': 300, '60': 600 };
  const totalAmount = chickenPrices[chickenQty] + eggsPrices[eggsQty];
  const isFreeDelivery = totalAmount >= 1300;
  const deliveryCharge = totalAmount > 0 && !isFreeDelivery ? 50 : 0;
  const amountToFreeDelivery = 1300 - totalAmount;

  // Fetch Logos
  useEffect(() => {
    const fetchLogos = async () => {
      try {
        const [organic, natural] = await Promise.all([
          generateOrganicLogo(),
          generateNaturalLogo()
        ]);
        setOrganicLogo(organic);
        setNaturalLogo(natural);
      } catch (error) {
        console.error('Failed to generate logos:', error);
      } finally {
        setIsLogoLoading(false);
      }
    };
    fetchLogos();
  }, []);

  // Handle scroll to update active nav link
  useEffect(() => {
    const handleScroll = () => {
      const sections = ['home', 'story', 'products', 'faq', 'order'];
      const scrollPosition = window.scrollY + 100;

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section);
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Simple sanitization to prevent basic XSS
  const sanitizeInput = (str: string) => {
    if (!str) return '';
    return str.replace(/[<>]/g, '').trim();
  };

  const navLinks = [
    { name: 'Home', href: '#home', id: 'home' },
    { name: 'Our Story', href: '#story', id: 'story' },
    { name: 'Products', href: '#products', id: 'products' },
    { name: 'Gallery', href: '#gallery', id: 'gallery' },
    { name: 'FAQ', href: '#faq', id: 'faq' },
    { name: 'Order', href: '#order', id: 'order' },
  ];

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    
    // Honeypot check for bots
    const website = formData.get('website') as string;
    if (website) {
      console.log('Bot detected');
      return;
    }

    // Sanitize and validate inputs
    const name = sanitizeInput(formData.get('name') as string);
    const phone = sanitizeInput(formData.get('phone') as string).replace(/\D/g, '');
    const address = sanitizeInput(formData.get('address') as string);
    const chickenQty = formData.get('chicken_qty') as string;
    const eggsQty = formData.get('eggs_qty') as string;

    if (!name || !phone || !address) {
      alert('Please fill out all required fields correctly.');
      return;
    }

    if (phone.length < 10) {
      alert('Please enter a valid 10-digit phone number.');
      return;
    }

    if (chickenQty === '0' && eggsQty === '0') {
      alert('Please select at least one product to order.');
      return;
    }

    const products = [];
    if (chickenQty !== '0') {
      const chickenOptions: Record<string, string> = {
        '1': '1 Country Chicken',
        '2': '2 Country Chickens',
        '3': '3 Country Chickens'
      };
      products.push(`${chickenOptions[chickenQty]} (₹${chickenPrices[chickenQty]})`);
    }
    if (eggsQty !== '0') {
      const eggsOptions: Record<string, string> = {
        '30': '30 Fresh Farm Eggs',
        '60': '60 Fresh Farm Eggs'
      };
      products.push(`${eggsOptions[eggsQty]} (₹${eggsPrices[eggsQty]})`);
    }

    const itemsList = products.join('\n');

    setIsSubmitting(true);

    const deliveryText = isFreeDelivery ? 'Free' : '₹50';
    const finalTotal = totalAmount + deliveryCharge;

    const message = `Hello Tanvi Agro Farm!

I'd like to order your Premium Taste products:

---
Customer: ${name}
Phone: ${phone}
Address: ${address}

---
Items:
${itemsList}

Subtotal: ₹${totalAmount}
Delivery: ${deliveryText}
---
Total: ₹${finalTotal}`;
    
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/918767326565?text=${encodedMessage}`;
    
    // Simulate a brief loading state for better UX
    setTimeout(() => {
      window.open(whatsappUrl, '_blank');
      setIsSubmitting(false);
      setIsSuccess(true);
      form.reset();
      
      // Reset success state after a few seconds
      setTimeout(() => {
        setIsSuccess(false);
      }, 3000);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-[var(--color-eggshell)] font-sans text-gray-800 selection:bg-[var(--color-forest)] selection:text-white">
      {/* Top Banner */}
      <div className="bg-[var(--color-forest)] text-white py-2 px-4 text-center text-[10px] sm:text-xs font-bold tracking-[0.2em] uppercase fixed top-0 left-0 right-0 z-[60] border-b border-[var(--color-gold)]/20 shadow-md">
        FREE HOME DELIVERY ON ORDERS ABOVE ₹1,300!
      </div>

      {/* Sticky Header */}
      <header className="fixed top-8 sm:top-10 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm transition-all duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center">
              <a href="#home" className="font-serif text-2xl md:text-3xl font-bold text-[var(--color-forest)] flex items-center gap-3">
                Tanvi Agro Farm
              </a>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className={`text-sm font-medium uppercase tracking-wider transition-colors duration-200 hover:text-[var(--color-forest)] ${
                    activeSection === link.id ? 'text-[var(--color-forest)] border-b-2 border-[var(--color-forest)]' : 'text-gray-500'
                  }`}
                >
                  {link.name}
                </a>
              ))}
            </nav>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-gray-500 hover:text-[var(--color-forest)] focus:outline-none"
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden bg-[var(--color-eggshell)] border-b border-[var(--color-forest)]/10 animate__animated animate__fadeInDown animate__faster">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    activeSection === link.id
                      ? 'text-[var(--color-forest)] bg-[var(--color-forest)]/10'
                      : 'text-gray-600 hover:text-[var(--color-forest)] hover:bg-[var(--color-forest)]/5'
                  }`}
                >
                  {link.name}
                </a>
              ))}
            </div>
          </div>
        )}
      </header>

      <main>
        {/* Home Section */}
        <section id="home" className="pt-28 pb-20 md:pt-36 md:pb-32 overflow-hidden relative">
          <div className="absolute inset-0 z-0 opacity-10 pointer-events-none">
            <svg className="absolute left-0 top-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <path d="M0,0 L100,0 L100,100 L0,100 Z" fill="url(#grid-pattern)" />
              <defs>
                <pattern id="grid-pattern" width="10" height="10" patternUnits="userSpaceOnUse">
                  <path d="M 10 0 L 0 0 0 10" fill="none" stroke="var(--color-forest)" strokeWidth="0.5" />
                </pattern>
              </defs>
            </svg>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <FadeInOnScroll>
                <div className="inline-block mb-4">
                  <span className="font-serif text-xl md:text-2xl font-bold text-[var(--color-forest)] tracking-widest uppercase">
                    Tanvi Agro Farm
                  </span>
                  <div className="h-1 w-full bg-[var(--color-gold)] mt-1 rounded-full"></div>
                </div>
                <h1 className="font-serif text-5xl md:text-7xl font-bold mb-6 leading-tight">
                  <span className="text-[var(--color-forest)]">Nature's Pace,</span> <br />
                  <span className="text-[var(--color-gold)] italic font-light">Premium Taste.</span>
                </h1>
              </FadeInOnScroll>
              <FadeInOnScroll>
                <p className="text-lg md:text-xl text-gray-600 mb-8 font-light">
                  Experience the true taste of slow-grown, ethically raised poultry. No shortcuts, just pure, wholesome nutrition from our farm to your table.
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <a href="#products" className="inline-flex items-center justify-center px-8 py-4 border border-[var(--color-gold)] text-base font-medium rounded-full text-white bg-gradient-to-r from-[var(--color-forest)] to-[var(--color-moss)] hover:shadow-lg hover:shadow-[var(--color-gold)]/20 transition-all duration-200 transform hover:-translate-y-0.5">
                    View Products
                  </a>
                  <a href="#story" className="inline-flex items-center justify-center px-8 py-4 border border-[var(--color-forest)] text-base font-medium rounded-full text-[var(--color-forest)] bg-transparent hover:bg-[var(--color-forest)]/5 transition-all duration-200">
                    Our Philosophy
                  </a>
                </div>
              </FadeInOnScroll>
            </div>

            {/* 120-Day vs 40-Day Comparison */}
            <FadeInOnScroll>
              <div className="mt-20 bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                <div className="bg-[var(--color-forest)] text-white py-6 px-8 text-center">
                  <h2 className="font-serif text-2xl md:text-3xl font-semibold">The Tanvi Difference</h2>
                  <p className="text-white/80 mt-2 font-light">Why slow-grown matters for your health</p>
                </div>
                
                <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-100">
                  {/* Commercial (40-Day) */}
                  <div className="p-8 md:p-12 bg-gray-50/50">
                    <div className="flex items-center justify-center mb-6 opacity-50">
                      <span className="text-sm font-bold tracking-widest uppercase text-gray-500">Commercial Farm</span>
                    </div>
                    <h3 className="text-4xl font-serif text-center text-gray-400 mb-8">40 Days</h3>
                    <ul className="space-y-4">
                      <li className="flex items-start text-gray-500">
                        <X className="h-5 w-5 mr-3 text-red-400 shrink-0 mt-0.5" />
                        <span>Rapid, unnatural growth cycle</span>
                      </li>
                      <li className="flex items-start text-gray-500">
                        <X className="h-5 w-5 mr-3 text-red-400 shrink-0 mt-0.5" />
                        <span>Confined spaces, high stress</span>
                      </li>
                      <li className="flex items-start text-gray-500">
                        <X className="h-5 w-5 mr-3 text-red-400 shrink-0 mt-0.5" />
                        <span>Routine antibiotics & growth promoters</span>
                      </li>
                      <li className="flex items-start text-gray-500">
                        <X className="h-5 w-5 mr-3 text-red-400 shrink-0 mt-0.5" />
                        <span>Watery texture, bland flavor</span>
                      </li>
                    </ul>
                  </div>

                  {/* Tanvi (120-Day) */}
                  <div className="p-8 md:p-12 bg-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--color-forest)]/5 rounded-bl-full -z-10"></div>
                    <div className="flex items-center justify-center mb-6">
                      <span className="text-sm font-bold tracking-widest uppercase text-[var(--color-forest)]">Tanvi Agro Farm</span>
                    </div>
                    <h3 className="text-5xl font-serif text-center text-[var(--color-forest)] mb-8 font-bold">120 Days</h3>
                    <ul className="space-y-4">
                      <li className="flex items-start text-gray-800 font-medium">
                        <CheckCircle2 className="h-5 w-5 mr-3 text-[var(--color-forest)] shrink-0 mt-0.5" />
                        <span>Natural, slow growth for optimal health</span>
                      </li>
                      <li className="flex items-start text-gray-800 font-medium">
                        <CheckCircle2 className="h-5 w-5 mr-3 text-[var(--color-forest)] shrink-0 mt-0.5" />
                        <span>Free-range foraging in open sunlight</span>
                      </li>
                      <li className="flex items-start text-gray-800 font-medium">
                        <CheckCircle2 className="h-5 w-5 mr-3 text-[var(--color-forest)] shrink-0 mt-0.5" />
                        <span>Zero antibiotics, 100% natural diet</span>
                      </li>
                      <li className="flex items-start text-gray-800 font-medium">
                        <CheckCircle2 className="h-5 w-5 mr-3 text-[var(--color-forest)] shrink-0 mt-0.5" />
                        <span>Rich, dense texture & superior flavor</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </FadeInOnScroll>
          </div>
        </section>

        {/* Our Story Section */}
        <section id="story" className="py-20 md:py-32 bg-[var(--color-forest)] text-white relative overflow-hidden">
          {/* Parallax Background Element */}
          <div className="absolute inset-0 opacity-10 bg-[url('https://picsum.photos/seed/farm/1920/1080?blur=2')] bg-cover bg-center bg-fixed mix-blend-overlay"></div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <FadeInOnScroll>
                <div className="aspect-square md:aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl relative border border-[var(--color-gold)]/30">
                  <img 
                    src="https://i.ibb.co/SDmrxpR6/IMG-0660.jpg" 
                    alt="Lush landscape of Tanvi Agro Farm - sustainable and natural farming environment" 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 border-4 border-[var(--color-gold)]/20 rounded-3xl m-4"></div>
                </div>
              </FadeInOnScroll>
              
              <FadeInOnScroll>
                <div className="space-y-6">
                  <h2 className="font-serif text-4xl md:text-5xl font-bold mb-6 text-shadow-premium">Our Philosophy</h2>
                  <p className="text-lg md:text-xl text-white/90 font-light leading-relaxed text-shadow-premium">
                    At Tanvi Agro Farm, we believe that nature knows best. We started with a simple question: <em className="font-serif text-xl">"What happened to the real taste of food?"</em>
                  </p>
                  <p className="text-white/80 leading-relaxed text-shadow-premium">
                    The answer led us away from modern commercial farming and back to traditional roots. We don't rush our animals. We don't confine them. We don't pump them with chemicals to artificially accelerate their growth.
                  </p>
                  <p className="text-white/80 leading-relaxed text-shadow-premium">
                    Instead, we give them time—120 days to be exact. We give them space to roam, forage, and bask in the sun. The result is poultry and eggs that are not just ethically raised, but nutritionally superior and incredibly flavorful. It's food the way it was meant to be.
                  </p>
                  <div className="bg-white/10 p-4 rounded-2xl border-l-4 border-[var(--color-gold)] mt-6 backdrop-blur-sm">
                    <p className="text-sm italic text-white/90 text-shadow-premium">
                      "Most chickens are ready in 40 days. Ours take 120 (Six Score). Taste the patience."
                    </p>
                  </div>
                  
                  <div className="pt-8 border-t border-white/20 mt-8">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                      <div className="flex flex-col sm:flex-row gap-8">
                        {/* Organic Logo */}
                        <div className="flex items-center gap-4">
                          <div className="h-16 w-16 rounded-full bg-emerald-600 flex items-center justify-center shadow-xl border-2 border-emerald-400/50 overflow-hidden group hover:scale-110 transition-transform duration-200">
                            {isLogoLoading ? (
                              <Loader2 className="h-8 w-8 text-white animate-spin" />
                            ) : organicLogo ? (
                              <img 
                                src={organicLogo} 
                                alt="100% Organic Practices Logo" 
                                className="w-full h-full object-cover"
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              <Sprout className="h-8 w-8 text-white animate-pulse" />
                            )}
                          </div>
                          <div>
                            <h4 className="font-serif text-lg font-semibold">100% Organic</h4>
                            <p className="text-xs text-white/70">Sustainable practices</p>
                          </div>
                        </div>

                        {/* Natural Logo */}
                        <div className="flex items-center gap-4">
                          <div className="h-16 w-16 rounded-full bg-amber-600 flex items-center justify-center shadow-xl border-2 border-amber-400/50 overflow-hidden group hover:scale-110 transition-transform duration-200">
                            {isLogoLoading ? (
                              <Loader2 className="h-8 w-8 text-white animate-spin" />
                            ) : naturalLogo ? (
                              <img 
                                src={naturalLogo} 
                                alt="Natural & Ethical Farming Logo" 
                                className="w-full h-full object-cover"
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              <Bird className="h-8 w-8 text-white animate-pulse" />
                            )}
                          </div>
                          <div>
                            <h4 className="font-serif text-lg font-semibold">Natural & Ethical</h4>
                            <p className="text-xs text-white/70">Raised with care</p>
                          </div>
                        </div>
                      </div>
                      
                      <a 
                        href="https://www.instagram.com/reel/DTdNbWqkx-m/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA==" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full text-white transition-all backdrop-blur-sm whitespace-nowrap group hover:shadow-lg hover:shadow-white/5"
                      >
                        <Instagram className="h-5 w-5 group-hover:scale-110 transition-transform" />
                        <span className="font-medium">Watch Our Farm Journey</span>
                      </a>
                    </div>
                  </div>
                </div>
              </FadeInOnScroll>
            </div>
          </div>
        </section>

        {/* Products Section */}
        <section id="products" className="py-20 md:py-32 bg-[var(--color-eggshell)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <FadeInOnScroll>
              <div className="text-center max-w-3xl mx-auto mb-16">
                <h2 className="font-serif text-4xl md:text-5xl font-bold text-gray-900 mb-4">Premium Offerings</h2>
                <p className="text-lg text-gray-600 font-light">
                  Ethically raised, slow-grown produce delivered directly from our farm to your kitchen.
                </p>
              </div>
            </FadeInOnScroll>

            <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {/* Chicken Card */}
              <FadeInOnScroll>
                <div className="bg-gray-900 rounded-3xl shadow-2xl border border-[var(--color-gold)]/40 overflow-hidden group hover:shadow-[0_20px_60px_rgba(212,175,55,0.25)] transition-all duration-200 transform hover:-translate-y-4">
                  <div className="h-64 overflow-hidden relative">
                    <img 
                      src="https://i.ibb.co/QjYNXnNK/close-up-rural-farm-growing-birds.jpg" 
                      alt="Heritage Country Chicken - 120-day slow-grown, antibiotic-free poultry from Tanvi Agro Farm" 
                      className="w-full h-full object-cover transition-transform duration-400 group-hover:scale-110 opacity-90"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-4 left-4 bg-gray-900/90 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-bold text-white flex items-center gap-2 border border-[var(--color-gold)]/50 text-shadow-premium">
                      <Bird className="h-4 w-4 text-[var(--color-gold)]" />
                      120-Day Slow Grown
                    </div>
                  </div>
                  <div className="p-8">
                    <h2 className="font-serif text-3xl font-bold text-white mb-2 text-shadow-premium">Country Chicken</h2>
                    <p className="text-gray-400 mb-6 font-light">Free-range, antibiotic-free birds raised naturally for 120 days. Exceptional flavor and firm texture.</p>
                    
                    <div className="space-y-4 mb-8">
                      <div className="flex justify-between items-center p-4 bg-gray-800/50 rounded-xl border border-[var(--color-gold)]/20">
                        <span className="font-medium text-gray-200">1 Bird <span className="text-sm text-gray-500 font-normal ml-1">(approx. 1.2 - 1.5 kg)</span></span>
                        <span className="font-serif text-2xl font-bold text-[var(--color-gold)] drop-shadow-[0_0_8px_rgba(212,175,55,0.4)]">₹1,100</span>
                      </div>
                      <div className="p-4 bg-[var(--color-forest)]/20 rounded-xl border border-[var(--color-gold)]/30 text-center">
                        <span className="text-white text-sm font-medium">₹1,100 for the first bird, only ₹1,000 for each additional bird!</span>
                      </div>
                    </div>
                    
                    <a href="#order" className="w-full flex items-center justify-center px-6 py-4 border border-[var(--color-gold)]/50 text-base font-medium rounded-xl text-white bg-gradient-to-r from-[var(--color-forest)] to-[var(--color-moss)] hover:shadow-xl hover:shadow-[var(--color-gold)]/30 transition-all duration-200 transform hover:scale-[1.02]">
                      Order Now <ArrowRight className="ml-2 h-5 w-5" />
                    </a>
                  </div>
                </div>
              </FadeInOnScroll>

              {/* Eggs Card */}
              <FadeInOnScroll>
                <div className="bg-gray-900 rounded-3xl shadow-2xl border border-[var(--color-gold)]/40 overflow-hidden group hover:shadow-[0_20px_60px_rgba(212,175,55,0.25)] transition-all duration-200 transform hover:-translate-y-4">
                  <div className="h-64 overflow-hidden relative">
                    <img 
                      src="https://i.ibb.co/DsS5QN2/front-view-white-chicken-eggs-inside-basket-with-towel-dark-surface.jpg" 
                      alt="Fresh brown heritage eggs in a basket - pasture-raised at Tanvi Agro Farm" 
                      className="w-full h-full object-cover transition-transform duration-400 group-hover:scale-110 opacity-90"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-4 left-4 bg-gray-900/90 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-bold text-white flex items-center gap-2 border border-[var(--color-gold)]/50 text-shadow-premium">
                      <Egg className="h-4 w-4 text-[var(--color-gold)]" />
                      Pasture Raised
                    </div>
                  </div>
                  <div className="p-8">
                    <h2 className="font-serif text-3xl font-bold text-white mb-2 text-shadow-premium">Farm Fresh Eggs</h2>
                    <p className="text-gray-400 mb-6 font-light">Rich, golden yolks from hens that forage freely outdoors. High in Omega-3s and natural vitamins.</p>
                    
                    <div className="space-y-4 mb-8">
                      <div className="flex justify-between items-center p-4 bg-gray-800/50 rounded-xl border border-[var(--color-gold)]/20">
                        <span className="font-medium text-gray-200">30 Eggs</span>
                        <span className="font-serif text-2xl font-bold text-[var(--color-gold)] drop-shadow-[0_0_8px_rgba(212,175,55,0.4)]">₹300</span>
                      </div>
                      <div className="flex justify-between items-center p-4 bg-[var(--color-forest)]/20 rounded-xl border border-[var(--color-gold)]/30">
                        <span className="font-medium text-white flex items-center">60 Eggs</span>
                        <span className="font-serif text-2xl font-bold text-[var(--color-gold)] drop-shadow-[0_0_8px_rgba(212,175,55,0.4)]">₹600</span>
                      </div>
                    </div>
                    
                    <a href="#order" className="w-full flex items-center justify-center px-6 py-4 border border-[var(--color-gold)]/50 text-base font-medium rounded-xl text-white bg-gradient-to-r from-[var(--color-forest)] to-[var(--color-moss)] hover:shadow-xl hover:shadow-[var(--color-gold)]/30 transition-all duration-200 transform hover:scale-[1.02]">
                      Order Now <ArrowRight className="ml-2 h-5 w-5" />
                    </a>
                  </div>
                </div>
              </FadeInOnScroll>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="py-20 md:py-32 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <FadeInOnScroll>
              <div className="text-center mb-16">
                <h2 className="font-serif text-5xl md:text-6xl text-[#2D5A27] mb-4">Frequently Asked Questions</h2>
              </div>
            </FadeInOnScroll>

            <div className="space-y-6">
              {[
                {
                  q: "What does 'Six Score Days' mean?",
                  a: "It refers to our 120-day natural growth cycle (6 x 20 days), ensuring superior taste and nutrition."
                },
                {
                  q: "Do you deliver outside Pune?",
                  a: "Currently, we focus on providing the freshest produce to the Pune area with free delivery on orders above ₹1,300."
                },
                {
                  q: "Are your products antibiotic-free?",
                  a: "Yes, 100%. We believe in natural growth without any shortcuts or chemical interventions."
                }
              ].map((item, i) => (
                <FadeInOnScroll key={i}>
                  <div className="bg-[#F9F9F9] p-8 md:p-10 rounded-[32px] transition-all duration-300 hover:shadow-sm">
                    <h3 className="text-[#2D5A27] font-bold text-xl md:text-2xl mb-4">
                      {item.q}
                    </h3>
                    <p className="text-gray-600 text-lg leading-relaxed">
                      {item.a}
                    </p>
                  </div>
                </FadeInOnScroll>
              ))}
            </div>
          </div>
        </section>

        {/* Order Section */}
        <section id="order" className="py-20 md:py-32 bg-white border-t border-gray-100">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <FadeInOnScroll>
              <div className="text-center mb-16">
                <h2 className="font-serif text-4xl md:text-5xl font-bold text-gray-900 mb-4">Place Your Order</h2>
                <p className="text-lg text-gray-600 font-light max-w-2xl mx-auto">
                  Fill out the form below and we'll contact you via WhatsApp to confirm your delivery slot and final amount.
                </p>
              </div>
            </FadeInOnScroll>

            <FadeInOnScroll>
              <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
                <div className="p-8 md:p-12">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Honeypot field - hidden from users */}
                    <div className="hidden" aria-hidden="true">
                      <input type="text" name="website" tabIndex={-1} autoComplete="off" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          required
                          maxLength={50}
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[var(--color-forest)] focus:border-transparent transition-all outline-none"
                          placeholder="Your Name"
                        />
                      </div>
                      <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Phone Number (WhatsApp) *</label>
                        <input
                          type="tel"
                          id="phone"
                          name="phone"
                          required
                          maxLength={15}
                          pattern="[0-9]*"
                          inputMode="numeric"
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[var(--color-forest)] focus:border-transparent transition-all outline-none"
                          placeholder="10-digit mobile number"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">Delivery Address *</label>
                      <textarea
                        id="address"
                        name="address"
                        required
                        rows={3}
                        maxLength={200}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[var(--color-forest)] focus:border-transparent transition-all outline-none resize-none"
                        placeholder="Complete address for home delivery"
                      ></textarea>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="chicken_qty" className="block text-sm font-medium text-gray-700 mb-1">Country Chicken Qty</label>
                        <select
                          id="chicken_qty"
                          name="chicken_qty"
                          value={chickenQty}
                          onChange={(e) => setChickenQty(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[var(--color-forest)] focus:border-transparent transition-all outline-none bg-white"
                        >
                          <option value="0">None</option>
                          <option value="1">1 Bird (₹1,100)</option>
                          <option value="2">2 Birds (₹2,100)</option>
                          <option value="3">3 Birds (₹3,100)</option>
                        </select>
                      </div>
                      <div>
                        <label htmlFor="eggs_qty" className="block text-sm font-medium text-gray-700 mb-1">Farm Fresh Eggs Qty</label>
                        <select
                          id="eggs_qty"
                          name="eggs_qty"
                          value={eggsQty}
                          onChange={(e) => setEggsQty(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[var(--color-forest)] focus:border-transparent transition-all outline-none bg-white"
                        >
                          <option value="0">None</option>
                          <option value="30">30 Eggs (₹300)</option>
                          <option value="60">60 Eggs (₹600)</option>
                        </select>
                      </div>
                    </div>

                    {/* Order Summary */}
                    {(chickenQty !== '0' || eggsQty !== '0') && (
                      <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 animate__animated animate__fadeIn">
                        <h4 className="font-serif font-bold text-gray-900 mb-4">Order Summary</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Subtotal</span>
                            <span className="font-medium">₹{totalAmount}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Delivery Charge</span>
                            <span className="font-medium">{isFreeDelivery ? 'FREE' : `₹${deliveryCharge}`}</span>
                          </div>
                          {!isFreeDelivery && totalAmount > 0 && (
                            <p className="text-[10px] text-[var(--color-forest)] font-medium">
                              Add ₹{amountToFreeDelivery} more for FREE delivery!
                            </p>
                          )}
                          <div className="pt-2 border-t border-gray-200 flex justify-between text-base font-bold text-gray-900">
                            <span>Total Amount</span>
                            <span>₹{totalAmount + deliveryCharge}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="pt-4">
                      <button
                        type="submit"
                        disabled={isSubmitting || isSuccess}
                        className={`w-full flex justify-center items-center gap-2 py-4 px-8 rounded-full shadow-lg text-base font-bold text-white transition-all duration-200 transform hover:-translate-y-0.5 ${
                          isSuccess 
                            ? 'bg-green-600' 
                            : 'bg-gradient-to-r from-[var(--color-forest)] to-[var(--color-moss)] hover:shadow-xl hover:shadow-[var(--color-forest)]/20'
                        } ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="animate-spin h-5 w-5" />
                            Processing...
                          </>
                        ) : isSuccess ? (
                          <>
                            <CheckCircle2 className="h-5 w-5" />
                            Order Request Sent!
                          </>
                        ) : (
                          <>
                            Confirm Order via WhatsApp
                            <ArrowRight className="h-5 w-5" />
                          </>
                        )}
                      </button>
                      <p className="text-center text-xs text-gray-500 mt-4">
                        Cash on delivery available in Pune area
                      </p>
                    </div>
                  </form>
                </div>
              </div>
            </FadeInOnScroll>
          </div>
        </section>

        {/* Customer Love Section */}
        <section className="py-20 md:py-32 bg-white overflow-hidden border-t border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <FadeInOnScroll>
              <div className="text-center max-w-3xl mx-auto mb-16">
                <h2 className="font-serif text-4xl md:text-5xl font-bold text-gray-900 mb-4">Customer Love</h2>
                <div className="h-1 w-24 bg-[var(--color-gold)] mx-auto mb-6"></div>
                <p className="text-lg text-gray-600 font-light">
                  Real stories from our community in Pune who have experienced the Tanvi Agro Farm difference.
                </p>
              </div>
            </FadeInOnScroll>

            {/* Horizontal Scroll Container */}
            <div className="relative group">
              <div className="flex overflow-x-auto pb-12 gap-6 snap-x snap-mandatory scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
                {[
                  {
                    name: "Rahul M.",
                    location: "Baner",
                    content: "The 120-day difference is real. The chicken is much juicier than what I get at the local market. Worth every rupee!",
                  },
                  {
                    name: "Priya S.",
                    location: "Koregaon Park",
                    content: "The eggs have such a rich yellow yolk. My kids won't eat standard store eggs anymore. Delivery was right on time.",
                  },
                  {
                    name: "Amit K.",
                    location: "Wakad",
                    content: "Finally a place in Pune that sells actual Gavran chicken. The flavor reminded me of my village. Highly recommended!",
                  },
                  {
                    name: "Aniket Deshpande",
                    location: "Kothrud",
                    content: "Finally, authentic Gavran taste in the city. The 120-day slow-growth difference is visible in the texture. Excellent quality.",
                  },
                  {
                    name: "Sunita Kulkarni",
                    location: "Aundh",
                    content: "The eggs are so fresh! The deep yellow yolks remind me of my childhood on the farm. My family loves them.",
                  },
                  {
                    name: "Rahul Patil",
                    location: "Wakad",
                    content: "I was hesitant about the ₹1,300 minimum, but once I tasted the chicken, I understood why. This is premium stuff.",
                  },
                  {
                    name: "Snehal Shinde",
                    location: "Baner",
                    content: "Clean packaging and very polite delivery. The chicken was dressed perfectly. Highly recommended for health-conscious families.",
                  },
                  {
                    name: "Vikram More",
                    location: "Hadapsar",
                    content: "Ordered 2 chickens and 60 eggs. The 'Premium Taste' slogan isn't just marketing—it's the truth. Best in Pune.",
                  },
                  {
                    name: "Aditi Gokhale",
                    location: "Viman Nagar",
                    content: "I bake a lot, and these eggs have changed my cakes. You can't get this quality at a local dairy.",
                  },
                  {
                    name: "Sandeep Gawade",
                    location: "Pimpri",
                    content: "True Gavran flavor. It takes time to cook, which proves it's naturally raised and not a broiler hybrid.",
                  }
                ].map((review, i) => (
                  <div 
                    key={i} 
                    className="flex-shrink-0 w-[85vw] md:w-[calc(33.333%-1rem)] snap-center"
                  >
                    <div className="bg-[var(--color-eggshell)] p-8 rounded-3xl border border-[var(--color-forest)]/20 shadow-sm h-full flex flex-col transition-all duration-300 hover:shadow-md hover:border-[var(--color-forest)]/40">
                      <div className="flex gap-1 mb-4">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="h-4 w-4 fill-[var(--color-gold)] text-[var(--color-gold)]" />
                        ))}
                      </div>
                      
                      <p className="text-gray-700 italic mb-8 flex-grow leading-relaxed">"{review.content}"</p>
                      
                      <div className="flex items-center justify-between pt-6 border-t border-[var(--color-forest)]/10">
                        <div>
                          <h4 className="font-bold text-gray-900">{review.name}</h4>
                          <p className="text-xs text-gray-500 uppercase tracking-wider">{review.location}</p>
                        </div>
                        <div className="flex items-center gap-1.5 bg-[var(--color-forest)]/10 px-3 py-1 rounded-full">
                          <CheckCircle2 className="h-3.5 w-3.5 text-[var(--color-forest)]" />
                          <span className="text-[10px] font-bold text-[var(--color-forest)] uppercase tracking-tight">Verified Buyer</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Scroll Indicators (Mobile Only) */}
              <div className="flex justify-center gap-2 mt-4 md:hidden">
                {[...Array(10)].map((_, i) => (
                  <div key={i} className="w-1.5 h-1.5 rounded-full bg-gray-200"></div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-[#FDFCF8] py-16 px-4 sm:px-6 lg:px-8 border-t border-gray-200">
        {/* Floating WhatsApp Button */}
        <a 
          href="https://wa.me/918767326565?text=Hello%20Tanvi%20Agro%20Farm!%0AI%E2%80%99ve%20heard%20about%20your%20Premium%20Taste%20chicken%20and%20fresh%20eggs.%20I%E2%80%99d%20love%20to%20bring%20that%20natural%20farm%20flavor%20to%20my%20kitchen!%0ACould%20you%20please%20help%20me%20with%20an%20order%3F" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="fixed bottom-8 right-8 z-[100] flex items-center justify-center w-16 h-16 rounded-full bg-[#25D366] text-white shadow-2xl hover:scale-110 transition-transform duration-200 group"
        >
          <svg 
            viewBox="0 0 24 24" 
            className="w-10 h-10 fill-current"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          <span className="absolute right-20 bg-gray-900 text-white text-xs font-bold px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-xl">
            Order via WhatsApp
          </span>
        </a>

        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          {/* Brand (Left Side) */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <div className="flex items-center gap-3 mb-2">
              <span className="font-serif text-3xl font-bold text-[#2D5A27]">
                Tanvi Agro Farm
              </span>
            </div>
            <p className="text-gray-500 mt-2 text-sm font-medium">
              Nature’s Pace, Premium Taste.
            </p>
          </div>

          {/* Buttons (Right Side) */}
          <div className="flex items-center gap-6">
            {/* Instagram */}
            <a href="https://www.instagram.com/tanvi_agro_farm_/?hl=en" target="_blank" rel="noopener noreferrer" className="group relative flex items-center justify-center w-14 h-14 rounded-full bg-white shadow-[0_10px_10px_rgba(0,0,0,0.05)] cursor-pointer transition-all duration-200 hover:bg-[linear-gradient(45deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)]">
              <div className="absolute top-0 opacity-0 group-hover:-top-16 group-hover:opacity-100 transition-all duration-200 ease-[cubic-bezier(0.68,-0.55,0.265,1.55)] pointer-events-none bg-[linear-gradient(45deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)] text-white text-sm font-medium px-3 py-1.5 rounded-md shadow-lg whitespace-nowrap z-10">
                See Farm Life
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-[linear-gradient(45deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)] rotate-45"></div>
              </div>
              <Instagram className="w-6 h-6 text-gray-600 group-hover:text-white transition-colors duration-200" />
            </a>

            {/* WhatsApp */}
            <a href="https://wa.me/918767326565?text=Hello%20Tanvi%20Agro%20Farm!%0AI%E2%80%99ve%20heard%20about%20your%20Premium%20Taste%20chicken%20and%20fresh%20eggs.%20I%E2%80%99d%20love%20to%20bring%20that%20natural%20farm%20flavor%20to%20my%20kitchen!%0ACould%20you%20please%20help%20me%20with%20an%20order%3F" target="_blank" rel="noopener noreferrer" className="group relative flex items-center justify-center w-14 h-14 rounded-full bg-white shadow-[0_10px_10px_rgba(0,0,0,0.05)] cursor-pointer transition-all duration-200 hover:bg-[#25D366] animate-pulse-gold">
              <div className="absolute top-0 opacity-0 group-hover:-top-16 group-hover:opacity-100 transition-all duration-200 ease-[cubic-bezier(0.68,-0.55,0.265,1.55)] pointer-events-none bg-[#25D366] text-white text-sm font-medium px-3 py-1.5 rounded-md shadow-lg whitespace-nowrap z-10">
                Order via WhatsApp
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-[#25D366] rotate-45"></div>
              </div>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-600 group-hover:text-white transition-colors duration-200">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.79 19.79 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
              </svg>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
