"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowRight, Terminal, Shield, Wrench, Menu, X, MousePointer2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

gsap.registerPlugin(ScrollTrigger);

// --- COMPONENT: Navbar ---
function Navbar() {
    const navRef = useRef<HTMLDivElement>(null);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const ctx = gsap.context(() => {
            ScrollTrigger.create({
                start: "top -80",
                end: 99999,
                toggleClass: { className: "nav-scrolled", targets: navRef.current },
            });
        }, navRef);
        return () => ctx.revert();
    }, []);

    return (
        <nav
            ref={navRef}
            className="group fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-5xl rounded-[3rem] transition-all duration-500 bg-transparent text-white border border-transparent 
      [&.nav-scrolled]:bg-[#15151A]/80 [&.nav-scrolled]:backdrop-blur-xl [&.nav-scrolled]:text-[#FAF8F5] [&.nav-scrolled]:border-[rgba(250,248,245,0.1)] [&.nav-scrolled]:shadow-lg"
        >
            <div className="flex items-center justify-between px-6 py-4">
                <div className="font-[family-name:var(--font-inter)] font-medium text-sm tracking-tight flex items-center gap-3">
                    <Image
                        src="/logo-new.svg"
                        alt="PT. PN Logo"
                        width={40}
                        height={40}
                        className="transition-all duration-500 object-contain invert brightness-200"
                    />
                    <span className="hidden sm:inline">PT. Pantauan Nusantara</span>
                </div>

                <div className="hidden md:flex items-center gap-8 font-medium text-sm text-[#FAF8F5]/80">
                    <a href="#features" className="hover:text-[#C9A84C] hover:-translate-y-0.5 transition-all">Features</a>
                    <a href="#philosophy" className="hover:text-[#C9A84C] hover:-translate-y-0.5 transition-all">Philosophy</a>
                    <a href="#protocol" className="hover:text-[#C9A84C] hover:-translate-y-0.5 transition-all">Protocol</a>
                </div>

                <div className="hidden md:flex gap-3">
                    <Link href="/login" className="px-5 py-2.5 rounded-[2rem] text-sm font-medium border border-[rgba(250,248,245,0.2)] hover:bg-[#FAF8F5] hover:text-[#0D0D12] transition-colors">
                        Sign In
                    </Link>
                    <a href="mailto:admin@pantauannusantara.com" className="px-5 py-2.5 rounded-[2rem] text-sm font-medium bg-[#C9A84C] text-[#0D0D12] hover:bg-[#b0913f] transition-colors flex items-center gap-2 group/btn overflow-hidden relative">
                        <span className="relative z-10">Consultation</span>
                        <ArrowRight className="w-4 h-4 relative z-10 group-hover/btn:translate-x-1 transition-transform" />
                    </a>
                </div>

                <button className="md:hidden" onClick={() => setIsOpen(!isOpen)}>
                    {isOpen ? <X className="w-6 h-6 text-[#C9A84C]" /> : <Menu className="w-6 h-6 text-[#FAF8F5]" />}
                </button>
            </div>

            {isOpen && (
                <div className="md:hidden absolute top-full left-0 w-full mt-2 bg-[#15151A] border border-[rgba(250,248,245,0.1)] rounded-[2rem] p-4 flex flex-col gap-4 text-[#FAF8F5] shadow-2xl backdrop-blur-3xl">
                    <a href="#features" onClick={() => setIsOpen(false)} className="hover:text-[#C9A84C]">Features</a>
                    <a href="#philosophy" onClick={() => setIsOpen(false)} className="hover:text-[#C9A84C]">Philosophy</a>
                    <a href="#protocol" onClick={() => setIsOpen(false)} className="hover:text-[#C9A84C]">Protocol</a>
                    <Link href="/login" onClick={() => setIsOpen(false)} className="bg-[#FAF8F5] text-[#0D0D12] text-center py-3 rounded-xl font-medium mt-2">Sign In</Link>
                </div>
            )}
        </nav>
    );
}

// --- COMPONENT: Hero ---
function Hero() {
    const textRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.from(".hero-line", {
                y: 40,
                opacity: 0,
                duration: 1.2,
                stagger: 0.1,
                ease: "power3.out",
                delay: 0.2
            });
        }, textRef);
        return () => ctx.revert();
    }, []);

    return (
        <header className="relative w-full h-[100dvh] flex items-end justify-start pb-24 px-8 md:px-16 overflow-hidden">
            <div className="absolute inset-0 z-0 bg-[#0D0D12]">
                <Image
                    src="https://images.unsplash.com/photo-1628156106670-36e355c457f0?q=80&w=2940&auto=format&fit=crop"
                    alt="Dark marble architecture"
                    fill
                    className="object-cover opacity-40 mix-blend-luminosity brightness-50"
                    priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D12] via-[#0D0D12]/60 to-transparent" />
            </div>

            <div ref={textRef} className="relative z-10 w-full max-w-4xl flex flex-col gap-6 text-[#FAF8F5]">
                <div className="hero-line font-[family-name:var(--font-jetbrains)] text-xs tracking-[0.2em] uppercase text-[#C9A84C]/80">
                    PT. Pantauan Nusantara // Private integration atelier
                </div>
                <h1 className="flex flex-col gap-1 md:gap-2">
                    <span className="hero-line font-[family-name:var(--font-inter)] font-normal tracking-tight text-5xl md:text-7xl leading-none">
                        Absolute Security meets
                    </span>
                    <span className="hero-line font-[family-name:var(--font-playfair)] italic font-light text-6xl md:text-[8.5rem] text-[#C9A84C] tracking-tight ml-2 md:ml-12 drop-shadow-2xl">
                        Precision.
                    </span>
                </h1>
                <div className="hero-line mt-6">
                    <a href="mailto:admin@pantauannusantara.com" className="inline-flex items-center gap-3 px-8 py-4 bg-[#C9A84C] text-[#0D0D12] rounded-[3rem] font-medium text-lg hover:bg-[#FAF8F5] transition-all duration-500 will-change-transform shadow-[0_10px_40px_rgba(201,168,76,0.15)] group">
                        Book a confidential consultation
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </a>
                </div>
            </div>
        </header>
    );
}

// --- COMPONENT: Diagnostic Shuffler (Quality) ---
function DiagnosticShuffler() {
    const containerRef = useRef<HTMLDivElement>(null);
    const [cards, setCards] = useState([
        { id: 1, text: "Boutique Hardware Curation", bg: "#1A1A24", color: "#FAF8F5", border: "rgba(250,248,245,0.05)" },
        { id: 2, text: "Aesthetic Cable Concealment", bg: "#C9A84C", color: "#0D0D12", border: "transparent" },
        { id: 3, text: "Architectural Integration", bg: "#2A2A35", color: "#FAF8F5", border: "rgba(250,248,245,0.05)" }
    ]);

    useEffect(() => {
        const interval = setInterval(() => {
            setCards(current => {
                const newCards = [...current];
                const last = newCards.pop()!;
                newCards.unshift(last);
                return newCards;
            });
        }, 3500);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="bg-[#15151A] rounded-[2.5rem] p-8 md:p-10 flex flex-col shadow-2xl border border-[rgba(250,248,245,0.05)] h-[28rem] hover:-translate-y-1 transition-transform relative overflow-hidden group">
            <div className="mb-auto z-10 relative">
                <div className="w-12 h-12 rounded-full border border-[rgba(201,168,76,0.3)] flex items-center justify-center mb-6">
                    <Wrench className="w-5 h-5 text-[#C9A84C]" />
                </div>
                <h3 className="font-normal text-2xl font-[family-name:var(--font-inter)] tracking-tight text-[#FAF8F5]">Quality Installation</h3>
                <p className="text-[#FAF8F5]/50 text-sm mt-3 font-[family-name:var(--font-inter)] max-w-xs leading-relaxed">Artisan-grade hardware deployment for premium architectural spaces.</p>
            </div>

            <div className="relative h-48 w-full mt-8 flex items-center justify-center pointer-events-none" ref={containerRef}>
                {cards.map((card, idx) => (
                    <div
                        key={card.id}
                        className="absolute w-[95%] left-[2.5%] h-24 rounded-[1.5rem] flex items-center justify-center px-6 text-center font-medium text-sm tracking-wide transition-all duration-[1000ms] shadow-2xl"
                        style={{
                            backgroundColor: card.bg,
                            color: card.color,
                            border: `1px solid ${card.border}`,
                            zIndex: 3 - idx,
                            transform: `translateY(${-idx * 16}px) scale(${1 - idx * 0.04})`,
                            opacity: 1 - idx * 0.15,
                            transitionTimingFunction: "cubic-bezier(0.25, 1, 0.5, 1)"
                        }}
                    >
                        {card.text}
                    </div>
                ))}
            </div>
        </div>
    );
}

// --- COMPONENT: Telemetry Typewriter (Secure) ---
function TelemetryTypewriter() {
    const [typed, setTyped] = useState("");
    const codeString = "Initiating handshake sequence...\nVerifying biometric signatures...\nEnd-to-end encryption established.\nZero-trust architecture active.";

    useEffect(() => {
        let i = 0;
        const interval = setInterval(() => {
            setTyped(codeString.substring(0, i));
            i++;
            if (i > codeString.length) {
                clearInterval(interval);
                setTimeout(() => setTyped(""), 2500); // loop
            }
        }, 45);
        return () => clearInterval(interval);
    }, [typed === ""]);

    return (
        <div className="bg-[#0D0D12] rounded-[2.5rem] p-8 md:p-10 flex flex-col shadow-2xl border border-[rgba(250,248,245,0.08)] h-[28rem] hover:-translate-y-1 transition-transform relative">
            <div className="absolute inset-0 bg-gradient-to-br from-[#C9A84C]/5 to-transparent rounded-[2.5rem] pointer-events-none" />

            <div className="flex justify-between items-start mb-6 relative z-10">
                <div>
                    <div className="w-12 h-12 rounded-full border border-[rgba(201,168,76,0.3)] flex items-center justify-center mb-6">
                        <Shield className="w-5 h-5 text-[#C9A84C]" />
                    </div>
                    <h3 className="font-normal text-2xl font-[family-name:var(--font-inter)] tracking-tight text-[#FAF8F5]">Secure Infrastructure</h3>
                    <p className="text-[#FAF8F5]/50 text-sm mt-3 font-[family-name:var(--font-inter)] max-w-xs leading-relaxed">Impenetrable data sovereignty for private environments.</p>
                </div>
            </div>

            <div className="mt-auto bg-[#1A1A24]/80 backdrop-blur-md rounded-[1.5rem] p-6 min-h-[150px] font-[family-name:var(--font-jetbrains)] text-[#FAF8F5]/90 text-xs h-[150px] border border-[rgba(250,248,245,0.03)] shadow-inner">
                <div className="flex items-center gap-2 mb-4 text-[10px] text-[#C9A84C]/80 uppercase tracking-widest border-b border-[rgba(250,248,245,0.05)] pb-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#C9A84C] animate-pulse" /> Live Terminal
                </div>
                <pre className="whitespace-pre-wrap leading-relaxed opacity-80">{typed}<span className="inline-block w-2 bg-[#C9A84C] animate-pulse ml-1 opacity-70">&nbsp;</span></pre>
            </div>
        </div>
    );
}

// --- COMPONENT: Cursor Protocol Scheduler (Reliable) ---
function CursorScheduler() {
    return (
        <div className="bg-[#15151A] rounded-[2.5rem] p-8 md:p-10 flex flex-col shadow-2xl border border-[rgba(250,248,245,0.05)] h-[28rem] hover:-translate-y-1 transition-transform overflow-hidden relative group">
            <div className="mb-6 relative z-10">
                <div className="w-12 h-12 rounded-full border border-[rgba(201,168,76,0.3)] flex items-center justify-center mb-6">
                    <Terminal className="w-5 h-5 text-[#C9A84C]" />
                </div>
                <h3 className="font-normal text-2xl font-[family-name:var(--font-inter)] tracking-tight text-[#FAF8F5]">Consistent Reliability</h3>
                <p className="text-[#FAF8F5]/50 text-sm mt-3 font-[family-name:var(--font-inter)] max-w-xs leading-relaxed">Automated bespoke maintenance scheduling.</p>
            </div>

            <div className="relative w-full h-full mt-auto flex flex-col items-center justify-end pointer-events-none pb-4">
                {/* Fake Calendar */}
                <div className="grid grid-cols-7 gap-1.5 w-full max-w-[260px] p-4 bg-[#0D0D12] rounded-[1.5rem] border border-[rgba(250,248,245,0.05)] shadow-xl">
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => (
                        <div key={d} className="text-center font-[family-name:var(--font-jetbrains)] text-[9px] font-normal opacity-40 text-[#FAF8F5] mb-2">{d}</div>
                    ))}
                    {Array.from({ length: 14 }).map((_, i) => (
                        <div key={i} className={`w-full aspect-square rounded-md border border-[rgba(250,248,245,0.03)] transition-colors duration-500 ${i === 11 ? 'bg-[#C9A84C]/20 border-[#C9A84C]/50 shadow-[inset_0_0_10px_rgba(201,168,76,0.2)]' : 'bg-[#15151A]'}`}></div>
                    ))}
                </div>

                {/* Animated Mouse Cursor */}
                <div className="absolute top-12 left-12 pointer-events-none animate-[cursorLuxury_4.5s_infinite]">
                    <MousePointer2 className="w-6 h-6 text-[#C9A84C] fill-[#15151A] drop-shadow-xl" strokeWidth={1.5} />
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
        @keyframes cursorLuxury {
          0% { transform: translate(0, 0) scale(1); opacity: 0; }
          10% { opacity: 1; }
          30% { transform: translate(160px, 95px) scale(1); }
          40% { transform: translate(160px, 95px) scale(0.9); } 
          50% { transform: translate(160px, 95px) scale(1); }
          80% { transform: translate(60px, 160px) scale(1); opacity: 1; }
          90% { transform: translate(60px, 160px) scale(0.9); opacity: 0; }
          100% { transform: translate(0px, 0px) scale(1); opacity: 0; }
        }
      `}} />
        </div>
    );
}

// --- COMPONENT: Philosophy ---
function Philosophy() {
    const comp = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.from(".phil-text .word", {
                scrollTrigger: {
                    trigger: comp.current,
                    start: "top 75%",
                },
                y: 40,
                opacity: 0,
                stagger: 0.05,
                ease: "power3.out",
                duration: 1
            });
        }, comp);
        return () => ctx.revert();
    }, []);

    const TextSplit = ({ text, className }: { text: string, className?: string }) => (
        <span className={`phil-text block ${className}`}>
            {text.split(' ').map((word, i) => (
                <span key={i} className="inline-block overflow-hidden mr-3">
                    <span className="word inline-block">{word}</span>
                </span>
            ))}
        </span>
    );

    return (
        <section ref={comp} id="philosophy" className="relative w-full py-40 md:py-64 bg-[#0D0D12] overflow-hidden text-[#FAF8F5] px-8 md:px-16 flex flex-col items-center text-center">
            {/* Texture overlay */}
            <div className="absolute inset-0 opacity-20 mix-blend-screen pointer-events-none">
                <Image
                    src="https://images.unsplash.com/photo-1618219908412-a29a1bb7b86e?q=80&w=2940&auto=format&fit=crop"
                    alt="Luxury Architecture Texture"
                    fill
                    className="object-cover grayscale brightness-50"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-[#0D0D12] via-transparent to-[#0D0D12]" />
            </div>

            <div className="relative z-10 w-full max-w-5xl flex flex-col gap-12">
                <TextSplit
                    text="Most security focuses on mass-market, reactive surveillance."
                    className="font-[family-name:var(--font-inter)] font-light text-xl md:text-2xl text-[#FAF8F5]/40 tracking-wide"
                />
                <h2 className="flex flex-col gap-3">
                    <TextSplit text="We focus on:" className="font-[family-name:var(--font-inter)] tracking-tight text-4xl md:text-6xl font-normal" />
                    <TextSplit text="bespoke digital sovereignty." className="font-[family-name:var(--font-playfair)] italic font-light text-6xl md:text-[7rem] text-[#C9A84C]" />
                </h2>
            </div>
        </section>
    );
}

// --- COMPONENT: Protocol Stacking ---
function Protocol() {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            const cards = gsap.utils.toArray('.stack-card') as HTMLElement[];

            cards.forEach((card, index) => {
                if (index === cards.length - 1) return; // Last card doesn't scale away

                ScrollTrigger.create({
                    trigger: card,
                    start: "top top",
                    endTrigger: cards[index + 1],
                    end: "top top",
                    pin: true,
                    pinSpacing: false,
                    animation: gsap.to(card, {
                        scale: 0.9,
                        opacity: 0.2,
                        filter: "blur(12px)",
                        ease: "none"
                    }),
                    scrub: true,
                });
            });
        }, containerRef);
        return () => ctx.revert();
    }, []);

    const steps = [
        { num: "I.", title: "Architectural Blueprinting", desc: "Rigorous mapping of physical premises to identify aesthetic and absolute optical coverage zones." },
        { num: "II.", title: "Bespoke Deployment", desc: "Surgical installations and encrypted continuous fiber-optic pipeline generation with zero visual intrusion." },
        { num: "III.", title: "System Commissioning", desc: "Activation sequence of telemetry nodes, finalizing cloud handshakes, securing the private enclave." },
    ];

    return (
        <section id="protocol" ref={containerRef} className="w-full bg-[#0D0D12] relative">
            <div className="py-32 px-8 md:px-16 text-center">
                <h2 className="font-[family-name:var(--font-inter)] font-normal tracking-tight text-4xl text-[#FAF8F5]">Integration Protocol</h2>
                <p className="font-[family-name:var(--font-jetbrains)] text-[#C9A84C]/70 mt-6 tracking-[0.2em] text-xs uppercase">Surgical precision</p>
            </div>

            <div className="w-full relative px-4 md:px-0">
                {steps.map((step, i) => (
                    <div key={i} className="stack-card h-[100dvh] w-full max-w-6xl mx-auto flex items-center justify-center pt-24 pb-12">
                        <div className="w-full h-full bg-[#15151A] rounded-[3rem] shadow-2xl border border-[rgba(250,248,245,0.05)] p-12 lg:p-16 flex flex-col md:flex-row items-center gap-16 overflow-hidden">

                            <div className="flex-1 flex flex-col justify-center h-full">
                                <span className="font-[family-name:var(--font-playfair)] italic text-6xl md:text-[7rem] text-[#C9A84C]/20 font-light w-full leading-none mb-6">{step.num}</span>
                                <h3 className="font-[family-name:var(--font-inter)] tracking-tight text-4xl md:text-5xl font-normal mt-4 text-[#FAF8F5]">{step.title}</h3>
                                <p className="mt-8 text-[#FAF8F5]/50 md:text-lg font-light max-w-md leading-relaxed">{step.desc}</p>
                            </div>

                            {/* Decorative SVG Art piece per card (Luxury variants) */}
                            <div className="hidden md:flex flex-1 w-full max-w-md h-[400px] items-center justify-center bg-[#0D0D12] rounded-[2rem] border border-[rgba(250,248,245,0.03)] relative overflow-hidden shadow-inner">
                                {i === 0 && (
                                    <svg viewBox="0 0 100 100" className="w-[80%] h-[80%] opacity-80 animate-[spin_40s_linear_infinite]" style={{ transformOrigin: 'center' }}>
                                        <circle cx="50" cy="50" r="40" fill="none" stroke="#C9A84C" strokeWidth="0.5" strokeDasharray="1 4" />
                                        <circle cx="50" cy="50" r="30" fill="none" stroke="#C9A84C" strokeWidth="1" opacity="0.5" />
                                        <polygon points="50,15 85,75 15,75" fill="none" stroke="#C9A84C" strokeWidth="0.5" className="animate-[pulse_4s_infinite]" />
                                        <polygon points="50,85 15,25 85,25" fill="none" stroke="#C9A84C" strokeWidth="0.5" className="animate-[pulse_4s_infinite_1s]" />
                                    </svg>
                                )}
                                {i === 1 && (
                                    <div className="w-full h-full p-12 relative flex items-center justify-center">
                                        <div className="w-full h-full border border-[#C9A84C]/20 rounded-full flex items-center justify-center">
                                            <div className="w-[70%] h-[70%] border border-[#C9A84C]/40 rounded-full flex items-center justify-center">
                                                <div className="w-[40%] h-[40%] bg-[#C9A84C]/10 rounded-full shadow-[0_0_30px_#C9A84C]" />
                                            </div>
                                        </div>
                                        <div className="absolute top-1/2 left-0 w-full h-[1px] bg-[#C9A84C]/50 shadow-[0_0_15px_#C9A84C] animate-[luxScan_4s_infinite_ease-in-out]" />
                                    </div>
                                )}
                                {i === 2 && (
                                    <svg viewBox="0 0 100 50" className="w-[90%] overflow-visible border-b border-[#C9A84C]/20 pb-4">
                                        <path d="M 0,25 L 15,25 L 20,15 L 25,40 L 30,10 L 35,35 L 40,25 L 100,25" fill="none" stroke="#C9A84C" strokeWidth="1" strokeDasharray="200" strokeDashoffset="0" className="animate-[luxPulse_3s_infinite]" />
                                        <circle cx="25" cy="40" r="1.5" fill="#C9A84C" className="animate-pulse" />
                                        <circle cx="30" cy="10" r="1.5" fill="#FAF8F5" className="animate-pulse" />
                                    </svg>
                                )}
                                <style dangerouslySetInnerHTML={{
                                    __html: `
                  @keyframes luxScan { 0% { transform: translateY(-150px); } 50% { transform: translateY(150px); } 100% { transform: translateY(-150px); } }
                  @keyframes luxPulse { 0% { stroke-dashoffset: 200; } 50% { stroke-dashoffset: 0; } 100% { stroke-dashoffset: -200; } }
                `}} />
                            </div>

                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}

// --- COMPONENT: Footer ---
function Footer() {
    return (
        <footer className="w-full bg-[#15151A] rounded-t-[4rem] px-8 md:px-16 pt-24 pb-8 mt-24 text-[#FAF8F5] border-t border-[rgba(250,248,245,0.05)] relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D12] to-transparent pointer-events-none" />

            <div className="relative max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-start gap-16 md:gap-8 z-10">
                <div className="flex flex-col gap-6 max-w-md">
                    <div className="font-[family-name:var(--font-inter)] font-normal text-lg tracking-tight flex items-center gap-3">
                        <Image
                            src="/logo-new.svg"
                            alt="PT. PN Logo"
                            width={56}
                            height={56}
                            className="object-contain invert brightness-200"
                        />
                        PT. Pantauan Nusantara
                    </div>
                    <h2 className="font-[family-name:var(--font-playfair)] text-5xl italic font-light text-[#C9A84C] mt-4 tracking-tight">Protect the perimeter.</h2>
                    <p className="text-[#FAF8F5]/50 font-light max-w-sm mt-2 leading-relaxed">Exclusive bespoke security integrations for elite commercial properties.</p>
                    <a href="mailto:admin@pantauannusantara.com" className="inline-flex w-fit items-center gap-3 px-8 py-4 bg-[#FAF8F5] text-[#0D0D12] rounded-[3rem] font-medium hover:bg-[#C9A84C] transition-colors duration-500 shadow-[0_10px_40px_rgba(250,248,245,0.05)] mt-6">
                        Initiate Contact
                        <ArrowRight className="w-4 h-4" />
                    </a>
                </div>

                <div className="flex flex-col gap-5 text-sm font-[family-name:var(--font-inter)] mt-8 md:mt-0">
                    <h4 className="font-normal mb-2 opacity-40 uppercase tracking-[0.2em] font-[family-name:var(--font-jetbrains)] text-xs text-[#C9A84C]">Sitemap</h4>
                    <a href="#features" className="hover:text-[#C9A84C] transition-colors font-light">Features</a>
                    <a href="#philosophy" className="hover:text-[#C9A84C] transition-colors font-light">Philosophy</a>
                    <a href="#protocol" className="hover:text-[#C9A84C] transition-colors font-light">Protocol</a>
                    <Link href="/login" className="hover:text-[#C9A84C] transition-colors font-light mt-4 text-[#FAF8F5]/60 flex items-center gap-2 border-b border-[rgba(250,248,245,0.1)] pb-1 w-fit">
                        Client Login Access
                    </Link>
                </div>
            </div>

            <div className="relative z-10 max-w-6xl mx-auto mt-32 pt-8 border-t border-[rgba(250,248,245,0.05)] flex flex-col md:flex-row justify-between items-center gap-6 text-xs font-[family-name:var(--font-jetbrains)] opacity-50 tracking-wider">
                <div>© {new Date().getFullYear()} PT Pantauan Nusantara. Restricted access.</div>
                <div className="flex items-center gap-2 border border-[rgba(250,248,245,0.1)] rounded-full px-5 py-2.5">
                    <span className="w-2 h-2 rounded-full bg-[#C9A84C] animate-pulse shadow-[0_0_10px_rgba(201,168,76,0.8)]" />
                    SYSTEM OPERATIONAL
                </div>
            </div>
        </footer>
    );
}

// --- MAIN PAGE COMPONENT ---
export default function LandingPage() {
    return (
        <>
            <div className="noise-overlay" />
            <Navbar />
            <main className="flex flex-col items-center bg-[#0D0D12]">
                <Hero />

                <section id="features" className="w-full max-w-7xl mx-auto px-6 py-40 grid grid-cols-1 xl:grid-cols-3 gap-6 relative z-10">
                    <DiagnosticShuffler />
                    <TelemetryTypewriter />
                    <CursorScheduler />
                </section>

                <Philosophy />
                <Protocol />
            </main>
            <Footer />
        </>
    );
}
