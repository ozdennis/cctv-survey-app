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
      [&.nav-scrolled]:bg-[#F5F3EE]/80 [&.nav-scrolled]:backdrop-blur-xl [&.nav-scrolled]:text-[#111111] [&.nav-scrolled]:border-[rgba(17,17,17,0.1)] [&.nav-scrolled]:shadow-lg"
        >
            <div className="flex items-center justify-between px-6 py-4">
                <div className="font-[family-name:var(--font-space-mono)] font-bold text-sm tracking-tighter flex items-center gap-2">
                    <Image
                        src="/logo-new.svg"
                        alt="PT. PN Logo"
                        width={32}
                        height={32}
                        className="transition-all duration-500 object-contain invert group-[.nav-scrolled]:invert-0 brightness-200 group-[.nav-scrolled]:brightness-100"
                    />
                    <span className="hidden sm:inline">PT. Pantauan Nusantara</span>
                </div>

                <div className="hidden md:flex items-center gap-8 font-medium text-sm">
                    <a href="#features" className="hover:-translate-y-0.5 transition-transform">Features</a>
                    <a href="#philosophy" className="hover:-translate-y-0.5 transition-transform">Philosophy</a>
                    <a href="#protocol" className="hover:-translate-y-0.5 transition-transform">Protocol</a>
                </div>

                <div className="hidden md:flex gap-3">
                    <Link href="/login" className="px-5 py-2.5 rounded-[2rem] text-sm font-semibold border border-[rgba(17,17,17,0.2)] hover:bg-[#111111] hover:text-[#F5F3EE] transition-colors">
                        Sign In
                    </Link>
                    <a href="mailto:admin@pantauannusantara.com" className="px-5 py-2.5 rounded-[2rem] text-sm font-semibold bg-[#E63B2E] text-white hover:bg-[#c93226] transition-colors flex items-center gap-2 group overflow-hidden relative">
                        <span className="relative z-10">Consultation</span>
                        <ArrowRight className="w-4 h-4 relative z-10 group-hover:translate-x-1 transition-transform" />
                    </a>
                </div>

                <button className="md:hidden" onClick={() => setIsOpen(!isOpen)}>
                    {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
            </div>

            {isOpen && (
                <div className="md:hidden absolute top-full left-0 w-full mt-2 bg-[#F5F3EE] border border-[rgba(17,17,17,0.1)] rounded-[2rem] p-4 flex flex-col gap-4 text-[#111111]">
                    <a href="#features" onClick={() => setIsOpen(false)}>Features</a>
                    <a href="#philosophy" onClick={() => setIsOpen(false)}>Philosophy</a>
                    <a href="#protocol" onClick={() => setIsOpen(false)}>Protocol</a>
                    <Link href="/login" onClick={() => setIsOpen(false)} className="bg-[#E8E4DD] text-center py-3 rounded-xl font-bold">Sign In</Link>
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
            <div className="absolute inset-0 z-0 bg-[#111111]">
                <Image
                    src="https://images.unsplash.com/photo-1541888081622-63b715ec3ced?q=80&w=2940&auto=format&fit=crop"
                    alt="Concrete structure"
                    fill
                    className="object-cover opacity-60 mix-blend-luminosity"
                    priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#111111] via-[#111111]/80 to-transparent" />
            </div>

            <div ref={textRef} className="relative z-10 w-full max-w-4xl flex flex-col gap-6 text-[#F5F3EE]">
                <div className="hero-line font-[family-name:var(--font-space-mono)] text-sm tracking-widest uppercase opacity-70">
                    PT. Pantauan Nusantara // Verified Security Integrator
                </div>
                <h1 className="flex flex-col gap-2">
                    <span className="hero-line font-[family-name:var(--font-space-grotesk)] font-bold text-5xl md:text-7xl leading-none">
                        SECURE the
                    </span>
                    <span className="hero-line font-[family-name:var(--font-dm-serif)] italic text-7xl md:text-9xl text-[#E63B2E] tracking-tight ml-4 md:ml-12 drop-shadow-2xl">
                        System.
                    </span>
                </h1>
                <div className="hero-line mt-4">
                    <a href="mailto:admin@pantauannusantara.com" className="inline-flex items-center gap-3 px-8 py-4 bg-[#E63B2E] text-white rounded-[2.5rem] font-bold text-xl hover:scale-[1.03] transition-transform shadow-[0_10px_40px_rgba(230,59,46,0.3)] will-change-transform">
                        Book a consultation
                        <ArrowRight className="w-5 h-5" />
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
        { id: 1, text: "Precision Mounting Protocols", bg: "#111111", color: "#F5F3EE" },
        { id: 2, text: "Code-Compliant Wiring", bg: "#E63B2E", color: "#FFFFFF" },
        { id: 3, text: "Lifetime Maintenance Logs", bg: "#E8E4DD", color: "#111111" }
    ]);

    useEffect(() => {
        const interval = setInterval(() => {
            setCards(current => {
                const newCards = [...current];
                const last = newCards.pop()!;
                newCards.unshift(last);
                return newCards;
            });
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="bg-[#E8E4DD] rounded-[2rem] p-8 md:p-10 flex flex-col shadow-sm border border-[rgba(17,17,17,0.1)] h-[28rem] hover:-translate-y-1 transition-transform relative overflow-hidden group">
            <div className="mb-auto z-10 relative">
                <Wrench className="w-8 h-8 text-[#E63B2E] mb-4" />
                <h3 className="font-bold text-2xl font-[family-name:var(--font-space-grotesk)] text-[#111111]">Quality Installation</h3>
                <p className="text-[#111111]/70 text-sm mt-2 max-w-[200px]">Rigorous hardware deployment standards.</p>
            </div>

            <div className="relative h-48 w-full mt-8 flex items-center justify-center pointer-events-none" ref={containerRef}>
                {cards.map((card, idx) => (
                    <div
                        key={card.id}
                        className="absolute w-[90%] left-[5%] h-24 rounded-2xl flex items-center justify-center px-4 text-center font-bold text-sm tracking-tight transition-all duration-[800ms] shadow-lg"
                        style={{
                            backgroundColor: card.bg,
                            color: card.color,
                            zIndex: 3 - idx,
                            transform: `translateY(${-idx * 16}px) scale(${1 - idx * 0.05})`,
                            opacity: 1 - idx * 0.2,
                            transitionTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)"
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
    const codeString = "Encrypting live feed...\nExchanging handshake keys...\nNode authorized.\nTraffic masked.";

    useEffect(() => {
        let i = 0;
        const interval = setInterval(() => {
            setTyped(codeString.substring(0, i));
            i++;
            if (i > codeString.length) {
                clearInterval(interval);
                setTimeout(() => setTyped(""), 2000); // loop
            }
        }, 50);
        return () => clearInterval(interval);
    }, [typed === ""]); // Restart when cleared

    return (
        <div className="bg-[#111111] rounded-[2rem] p-8 md:p-10 flex flex-col shadow-xl border border-[#333] h-[28rem] hover:-translate-y-1 transition-transform">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <Shield className="w-8 h-8 text-[#E63B2E] mb-4" />
                    <h3 className="font-bold text-2xl font-[family-name:var(--font-space-grotesk)] text-[#F5F3EE]">Secure Infrastructure</h3>
                    <p className="text-[#F5F3EE]/70 text-sm mt-2">End-to-end data integrity.</p>
                </div>
                <div className="flex items-center gap-2 bg-[#E63B2E]/20 text-[#E63B2E] px-3 py-1 rounded-full text-xs font-[family-name:var(--font-space-mono)]">
                    <span className="w-2 h-2 rounded-full bg-[#E63B2E] animate-pulse" /> Live Feed
                </div>
            </div>

            <div className="mt-auto bg-black rounded-xl p-4 min-h-[140px] font-[family-name:var(--font-space-mono)] text-[#F5F3EE] text-xs h-[140px]">
                <div className="opacity-50 mb-2">// SECURITY.LOG_STREAM</div>
                <pre className="whitespace-pre-wrap">{typed}<span className="inline-block w-2 bg-[#E63B2E] animate-pulse ml-1">&nbsp;</span></pre>
            </div>
        </div>
    );
}

// --- COMPONENT: Cursor Protocol Scheduler (Reliable) ---
function CursorScheduler() {
    return (
        <div className="bg-[#E8E4DD] rounded-[2rem] p-8 md:p-10 flex flex-col shadow-sm border border-[rgba(17,17,17,0.1)] h-[28rem] hover:-translate-y-1 transition-transform overflow-hidden relative group">
            <div className="mb-6 relative z-10">
                <Terminal className="w-8 h-8 text-[#E63B2E] mb-4" />
                <h3 className="font-bold text-2xl font-[family-name:var(--font-space-grotesk)] text-[#111111]">Consistent Reliability</h3>
                <p className="text-[#111111]/70 text-sm mt-2">Zero downtime maintenance grids.</p>
            </div>

            <div className="relative w-full h-full mt-auto flex flex-col items-center justify-end pointer-events-none pb-4">
                {/* Fake Calendar */}
                <div className="grid grid-cols-7 gap-1 w-full max-w-[240px]">
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => (
                        <div key={d} className="text-center text-[10px] font-bold opacity-50">{d}</div>
                    ))}
                    {Array.from({ length: 14 }).map((_, i) => (
                        <div key={i} className={`w-full aspect-square rounded-sm border border-[rgba(17,17,17,0.1)] transition-colors duration-200 ${i === 9 ? 'bg-[#E63B2E]/20 animate-pulse' : 'bg-[#F5F3EE]'}`}></div>
                    ))}
                </div>

                {/* Animated Mouse Cursor - Using CSS Animations defined below */}
                <div className="absolute top-10 left-10 pointer-events-none animate-[cursorWorkflow_4s_infinite]">
                    <MousePointer2 className="w-6 h-6 text-[#111111] fill-white drop-shadow-md" />
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
        @keyframes cursorWorkflow {
          0% { transform: translate(0, 0) scale(1); }
          30% { transform: translate(110px, 80px) scale(1); }
          40% { transform: translate(110px, 80px) scale(0.9); } /* click */
          50% { transform: translate(110px, 80px) scale(1); }
          80% { transform: translate(40px, 140px) scale(1); opacity: 1; }
          90% { transform: translate(40px, 140px) scale(0.9); opacity: 0; }
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
                    start: "top 70%",
                },
                y: 30,
                opacity: 0,
                stagger: 0.05,
                ease: "power3.out",
                duration: 0.8
            });
        }, comp);
        return () => ctx.revert();
    }, []);

    // Simple text splitter for GSAP
    const TextSplit = ({ text, className }: { text: string, className?: string }) => (
        <span className={`phil-text block ${className}`}>
            {text.split(' ').map((word, i) => (
                <span key={i} className="inline-block overflow-hidden mr-2 md:mr-3">
                    <span className="word inline-block">{word}</span>
                </span>
            ))}
        </span>
    );

    return (
        <section ref={comp} id="philosophy" className="relative w-full py-40 md:py-64 bg-[#111111] overflow-hidden text-[#F5F3EE] px-8 md:px-16 flex flex-col items-center text-center">
            {/* Texture overlay */}
            <div className="absolute inset-0 opacity-10 mix-blend-screen pointer-events-none">
                <Image
                    src="https://images.unsplash.com/photo-1518175960098-b63de40632df?q=80&w=2000&auto=format&fit=crop"
                    alt="Texture"
                    fill
                    className="object-cover"
                />
            </div>

            <div className="relative z-10 w-full max-w-5xl flex flex-col gap-12">
                <TextSplit
                    text="Most security focuses on: outdated analog reactive monitoring."
                    className="font-[family-name:var(--font-space-grotesk)] text-lg md:text-2xl text-[#F5F3EE]/60"
                />
                <h2 className="flex flex-col gap-2">
                    <TextSplit text="We focus on:" className="font-[family-name:var(--font-space-grotesk)] text-4xl md:text-5xl font-bold" />
                    <TextSplit text="proactive digital precision." className="font-[family-name:var(--font-dm-serif)] italic text-6xl md:text-8xl text-[#E63B2E]" />
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
                        opacity: 0.3,
                        filter: "blur(10px)",
                        ease: "none"
                    }),
                    scrub: true,
                });
            });
        }, containerRef);
        return () => ctx.revert();
    }, []);

    const steps = [
        { num: "01", title: "Site Survey & Blueprinting", desc: "Rigorous algorithmic mapping of physical premises to identify absolute optical coverage zones." },
        { num: "02", title: "Hardware Deployment", desc: "Heavy-duty concrete-anchored installations and encrypted fiber-optic pipeline generation." },
        { num: "03", title: "System Commissioning", desc: "Activation sequence of telemetry nodes, finalizing cloud handshakes, and handing over the control keys." },
    ];

    return (
        <section id="protocol" ref={containerRef} className="w-full bg-[#F5F3EE] relative">
            <div className="py-24 px-8 md:px-16 text-center">
                <h2 className="font-[family-name:var(--font-space-grotesk)] font-bold text-4xl text-[#111111]">Integration Protocol</h2>
                <p className="font-[family-name:var(--font-space-mono)] text-[#111111]/50 mt-4 uppercase text-sm">Systematic deployment</p>
            </div>

            <div className="w-full relative px-4 md:px-0">
                {steps.map((step, i) => (
                    <div key={i} className="stack-card h-[100dvh] w-full max-w-5xl mx-auto flex items-center justify-center pt-24 pb-12">
                        <div className="w-full h-full bg-[#E8E4DD] rounded-[3rem] shadow-2xl border border-[rgba(17,17,17,0.05)] p-12 flex flex-col md:flex-row items-center gap-12 overflow-hidden shadow-[0_20px_50px_rgba(17,17,17,0.2)]">

                            <div className="flex-1 flex flex-col justify-center h-full">
                                <span className="font-[family-name:var(--font-space-mono)] text-6xl md:text-8xl text-[#E63B2E] opacity-20 font-bold w-full leading-none">{step.num}</span>
                                <h3 className="font-[family-name:var(--font-space-grotesk)] text-4xl md:text-5xl font-bold mt-4 text-[#111111]">{step.title}</h3>
                                <p className="mt-6 text-[#111111]/70 md:text-xl font-medium max-w-md">{step.desc}</p>
                            </div>

                            {/* Decorative SVG Art piece per card */}
                            <div className="hidden md:flex flex-1 h-full items-center justify-center bg-[#111111] rounded-[2rem] relative overflow-hidden">
                                {i === 0 && (
                                    <svg viewBox="0 0 100 100" className="w-[60%] h-[60%] animate-spin" style={{ animationDuration: '20s' }}>
                                        <rect x="25" y="25" width="50" height="50" fill="none" stroke="#E63B2E" strokeWidth="2" transform="rotate(45 50 50)" />
                                        <circle cx="50" cy="50" r="20" fill="none" stroke="#F5F3EE" strokeWidth="1" strokeDasharray="4 4" />
                                    </svg>
                                )}
                                {i === 1 && (
                                    <div className="w-full h-full p-8 relative">
                                        <div className="w-full h-full border border-[#E63B2E]/30 grid grid-cols-4 grid-rows-4 gap-2">
                                            {Array.from({ length: 16 }).map((_, j) => <div key={j} className="bg-[#E63B2E]/10" />)}
                                        </div>
                                        <div className="absolute top-0 left-0 w-full h-1 bg-[#F5F3EE] shadow-[0_0_15px_#F5F3EE] animate-[scan_3s_infinite_ease-in-out]" />
                                    </div>
                                )}
                                {i === 2 && (
                                    <svg viewBox="0 0 100 50" className="w-[80%] overflow-visible border-b border-[#E63B2E]/30 pb-4">
                                        <path d="M 0,25 L 20,25 L 30,5 L 40,45 L 50,25 L 100,25" fill="none" stroke="#E63B2E" strokeWidth="2" strokeDasharray="150" strokeDashoffset="0" className="animate-[pulse_2s_infinite]" />
                                    </svg>
                                )}
                                <style dangerouslySetInnerHTML={{
                                    __html: `
                  @keyframes scan { 0% { top: 0%; } 50% { top: 100%; } 100% { top: 0%; } }
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
        <footer className="w-full bg-[#111111] rounded-t-[4rem] px-8 md:px-16 pt-24 pb-8 mt-24 text-[#F5F3EE] border-t border-[#333]">
            <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-start gap-16 md:gap-8">
                <div className="flex flex-col gap-6 max-w-sm">
                    <div className="font-[family-name:var(--font-space-mono)] font-bold text-lg tracking-tighter uppercase flex items-center gap-2">
                        <Image
                            src="/logo-new.svg"
                            alt="PT. PN Logo"
                            width={32}
                            height={32}
                            className="object-contain invert brightness-200"
                        />
                        PT. Pantauan Nusantara
                    </div>
                    <h2 className="font-[family-name:var(--font-dm-serif)] text-4xl italic text-[#F5F3EE]/90">Ready to secure the perimeter?</h2>
                    <a href="mailto:admin@pantauannusantara.com" className="inline-flex w-fit items-center gap-3 px-8 py-4 bg-[#F5F3EE] text-[#111111] rounded-[2.5rem] font-bold hover:scale-[1.03] transition-transform shadow-[0_10px_40px_rgba(245,243,238,0.1)] will-change-transform mt-4">
                        Get Started
                        <ArrowRight className="w-5 h-5" />
                    </a>
                </div>

                <div className="flex flex-col gap-4 text-sm font-[family-name:var(--font-space-grotesk)]">
                    <h4 className="font-bold mb-2 opacity-50 uppercase tracking-widest font-[family-name:var(--font-space-mono)]">Sitemap</h4>
                    <a href="#features" className="hover:text-[#E63B2E] transition-colors">Features</a>
                    <a href="#philosophy" className="hover:text-[#E63B2E] transition-colors">Philosophy</a>
                    <a href="#protocol" className="hover:text-[#E63B2E] transition-colors">Protocol</a>
                    <Link href="/login" className="hover:text-[#E63B2E] transition-colors">Client Portal</Link>
                </div>
            </div>

            <div className="max-w-6xl mx-auto mt-32 pt-8 border-t border-[rgba(245,243,238,0.1)] flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-[family-name:var(--font-space-mono)] opacity-60">
                <div>© {new Date().getFullYear()} PT Pemantau Nusantara. All rights reserved.</div>
                <div className="flex items-center gap-2 border border-[rgba(245,243,238,0.2)] rounded-full px-4 py-2">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.8)]" />
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
            <main className="flex flex-col items-center bg-[#F5F3EE]">
                <Hero />

                <section id="features" className="w-full max-w-6xl mx-auto px-6 py-32 grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10">
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
