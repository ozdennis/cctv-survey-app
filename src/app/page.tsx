"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowRight, Terminal, Shield, Wrench, Menu, X, MousePointer2, Camera } from "lucide-react";
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
                        width={48}
                        height={48}
                        className="transition-all duration-500 object-contain invert brightness-200"
                    />
                    <span className="hidden sm:inline">PT. Pantauan Nusantara</span>
                </div>

                <div className="hidden md:flex items-center gap-10 font-medium text-sm text-[#FAF8F5]/80">
                    <a href="#features" className="hover:text-[#C9A84C] hover:-translate-y-0.5 transition-all">Layanan</a>
                    <a href="#philosophy" className="hover:text-[#C9A84C] hover:-translate-y-0.5 transition-all">Filosofi</a>
                    <a href="#protocol" className="hover:text-[#C9A84C] hover:-translate-y-0.5 transition-all">Proses</a>
                </div>

                <div className="hidden md:flex gap-3">
                    <Link href="/login" className="px-6 py-3 rounded-[2rem] text-sm font-medium border border-[rgba(250,248,245,0.2)] hover:bg-[#FAF8F5] hover:text-[#0D0D12] transition-colors hover:-translate-y-0.5 transform will-change-transform">
                        Sign In
                    </Link>
                    <a href="mailto:admin@pantauannusantara.com" className="px-6 py-3 rounded-[2rem] text-sm font-medium bg-[#C9A84C] text-[#0D0D12] hover:bg-[#b0913f] transition-colors flex items-center gap-2 group/btn overflow-hidden relative hover:-translate-y-0.5 transform will-change-transform shadow-[0_4px_14px_rgba(201,168,76,0.2)] hover:shadow-[0_6px_20px_rgba(201,168,76,0.3)]">
                        <span className="relative z-10">Konsultasi</span>
                        <ArrowRight className="w-4 h-4 relative z-10 group-hover/btn:translate-x-1 transition-transform" />
                    </a>
                </div>

                <button className="md:hidden" onClick={() => setIsOpen(!isOpen)}>
                    {isOpen ? <X className="w-6 h-6 text-[#C9A84C]" /> : <Menu className="w-6 h-6 text-[#FAF8F5]" />}
                </button>
            </div>

            {isOpen && (
                <div className="md:hidden absolute top-full left-0 w-full mt-2 bg-[#15151A] border border-[rgba(250,248,245,0.1)] rounded-[2rem] p-4 flex flex-col gap-4 text-[#FAF8F5] shadow-2xl backdrop-blur-3xl">
                    <a href="#features" onClick={() => setIsOpen(false)} className="hover:text-[#C9A84C] px-4 py-2">Layanan</a>
                    <a href="#philosophy" onClick={() => setIsOpen(false)} className="hover:text-[#C9A84C] px-4 py-2">Filosofi</a>
                    <a href="#protocol" onClick={() => setIsOpen(false)} className="hover:text-[#C9A84C] px-4 py-2">Proses</a>
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
                y: 45,
                opacity: 0,
                duration: 1.4,
                stagger: 0.15,
                ease: "power3.out",
                delay: 0.1
            });
        }, textRef);
        return () => ctx.revert();
    }, []);

    return (
        <header className="relative w-full h-[100dvh] min-h-[800px] flex items-center justify-center px-8 md:px-16 overflow-hidden">
            <div className="absolute inset-0 z-0 bg-[#0D0D12]">
                <Image
                    src="https://images.unsplash.com/photo-1557597774-9d273605dfa9?q=80&w=2940&auto=format&fit=crop"
                    alt="Modern Minimalist Security Architecture"
                    fill
                    className="object-cover opacity-60 mix-blend-luminosity brightness-50"
                    priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D12] via-[#0D0D12]/40 to-transparent" />
            </div>

            <div ref={textRef} className="relative z-10 w-full max-w-5xl flex flex-col items-center text-center gap-8 mt-20 text-[#FAF8F5]">
                <div className="hero-line font-[family-name:var(--font-jetbrains)] text-xs md:text-sm tracking-[0.25em] uppercase text-[#C9A84C] drop-shadow-md font-medium">
                    Spesialis Keamanan & CCTV Terbaik Di Indonesia
                </div>

                <h1 className="flex flex-col gap-2 md:gap-4 mt-4">
                    <span className="hero-line font-[family-name:var(--font-inter)] font-normal tracking-tight text-5xl md:text-7xl leading-tight">
                        Pantau Rumah Dan Bisnis Anda
                    </span>
                    <span className="hero-line font-[family-name:var(--font-playfair)] italic font-light text-6xl md:text-[8rem] text-[#C9A84C] tracking-tight drop-shadow-2xl mt-2">
                        Bersama Kami.
                    </span>
                </h1>

                <p className="hero-line max-w-2xl text-lg md:text-xl text-[#FAF8F5]/60 font-light mt-6 leading-relaxed">
                    Menggabungkan estetika arsitektur premium dengan teknologi keamanan tingkat enterprise untuk melindungi aset paling berharga Anda.
                </p>

                <div className="hero-line mt-10">
                    <a href="mailto:admin@pantauannusantara.com" className="inline-flex items-center justify-center gap-4 px-10 py-5 bg-[#C9A84C] text-[#0D0D12] rounded-[3rem] font-medium text-lg hover:bg-[#FAF8F5] hover:scale-105 transition-all duration-500 will-change-transform shadow-[0_15px_40px_rgba(201,168,76,0.2)] group">
                        Konsultasikan Kebutuhan Anda
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
                    </a>
                </div>
            </div>
        </header>
    );
}

// --- COMPONENT: Diagnostic Shuffler (Konsultasi & Design) ---
function DiagnosticShuffler() {
    const containerRef = useRef<HTMLDivElement>(null);
    const [cards, setCards] = useState([
        { id: 1, text: "Analisa Titik Buta", bg: "#1A1A24", color: "#FAF8F5", border: "rgba(250,248,245,0.05)" },
        { id: 2, text: "Rekomendasi Hardware Terbaik", bg: "#C9A84C", color: "#0D0D12", border: "transparent" },
        { id: 3, text: "Desain Topologi Jaringan", bg: "#2A2A35", color: "#FAF8F5", border: "rgba(250,248,245,0.05)" }
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
        <div className="bg-[#15151A] rounded-[2.5rem] p-10 flex flex-col shadow-xl border border-[rgba(250,248,245,0.03)] h-[28rem] hover:-translate-y-2 hover:shadow-2xl transition-all duration-500 cursor-default relative overflow-hidden group">
            <div className="mb-auto z-10 relative">
                <div className="w-14 h-14 rounded-full border border-[rgba(201,168,76,0.3)] bg-[#C9A84C]/5 flex items-center justify-center mb-8 group-hover:bg-[#C9A84C]/10 transition-colors">
                    <Wrench className="w-6 h-6 text-[#C9A84C]" />
                </div>
                <h3 className="font-normal text-2xl md:text-3xl font-[family-name:var(--font-inter)] tracking-tight text-[#FAF8F5]">Konsultasi & Design</h3>
                <p className="text-[#FAF8F5]/50 text-sm md:text-base mt-4 font-[family-name:var(--font-inter)] max-w-xs leading-relaxed">
                    Konsultasikan kepada kami dan kami akan memberikan design sempurna sesuai dengan kebutuhan estetika dan keamanan ruang Anda.
                </p>
            </div>

            <div className="relative h-40 w-full mt-8 flex items-center justify-center pointer-events-none" ref={containerRef}>
                {cards.map((card, idx) => (
                    <div
                        key={card.id}
                        className="absolute w-[90%] left-[5%] h-20 rounded-[1.2rem] flex items-center justify-center px-6 text-center font-medium text-sm tracking-wide transition-all duration-[1200ms] shadow-2xl"
                        style={{
                            backgroundColor: card.bg,
                            color: card.color,
                            border: `1px solid ${card.border}`,
                            zIndex: 3 - idx,
                            transform: `translateY(${-idx * 16}px) scale(${1 - idx * 0.05})`,
                            opacity: 1 - idx * 0.2,
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

// --- COMPONENT: Cursor Protocol Scheduler (Survey & Instalasi) ---
function CursorScheduler() {
    return (
        <div className="bg-[#15151A] rounded-[2.5rem] p-10 flex flex-col shadow-xl border border-[rgba(250,248,245,0.03)] h-[28rem] hover:-translate-y-2 hover:shadow-2xl transition-all duration-500 overflow-hidden relative group">
            <div className="mb-6 relative z-10">
                <div className="w-14 h-14 rounded-full border border-[rgba(201,168,76,0.3)] bg-[#C9A84C]/5 flex items-center justify-center mb-8 group-hover:bg-[#C9A84C]/10 transition-colors">
                    <Camera className="w-6 h-6 text-[#C9A84C]" />
                </div>
                <h3 className="font-normal text-2xl md:text-3xl font-[family-name:var(--font-inter)] tracking-tight text-[#FAF8F5]">Survey & Instalasi</h3>
                <p className="text-[#FAF8F5]/50 text-sm md:text-base mt-4 font-[family-name:var(--font-inter)] max-w-xs leading-relaxed">
                    Tim pekerja profesional melakukan pengecekan lokasi secara presisi sebelum eksekusi instalasi fisik tanpa cacat.
                </p>
            </div>

            <div className="relative w-full h-full mt-auto flex flex-col items-center justify-end pointer-events-none pb-4">
                <div className="grid grid-cols-7 gap-1.5 w-full max-w-[260px] p-4 bg-[#0D0D12]/80 rounded-[1.5rem] border border-[rgba(250,248,245,0.05)] shadow-xl">
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => (
                        <div key={d} className="text-center font-[family-name:var(--font-jetbrains)] text-[10px] font-normal opacity-40 text-[#FAF8F5] mb-2">{d}</div>
                    ))}
                    {Array.from({ length: 14 }).map((_, i) => (
                        <div key={i} className={`w-full aspect-square rounded-md border transition-colors duration-500 ${i === 11 ? 'bg-[#C9A84C]/20 border-[#C9A84C]/50 shadow-[inset_0_0_10px_rgba(201,168,76,0.3)]' : 'bg-[#1A1A24] border-[rgba(250,248,245,0.02]'}`}></div>
                    ))}
                </div>

                <div className="absolute top-8 left-10 pointer-events-none animate-[cursorLuxury_5s_infinite]">
                    <MousePointer2 className="w-7 h-7 text-[#C9A84C] fill-[#15151A] drop-shadow-xl" strokeWidth={1.5} />
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
        @keyframes cursorLuxury {
          0% { transform: translate(0, 0) scale(1); opacity: 0; }
          10% { opacity: 1; }
          30% { transform: translate(150px, 90px) scale(1); }
          40% { transform: translate(150px, 90px) scale(0.85); } 
          50% { transform: translate(150px, 90px) scale(1); }
          80% { transform: translate(50px, 150px) scale(1); opacity: 1; }
          90% { transform: translate(50px, 150px) scale(0.85); opacity: 0; }
          100% { transform: translate(0px, 0px) scale(1); opacity: 0; }
        }
      `}} />
        </div>
    );
}

// --- COMPONENT: Telemetry Typewriter (Pengadaan & Pemeliharaan) ---
function TelemetryTypewriter() {
    const [typed, setTyped] = useState("");
    const codeString = "Standarisasi Hikvision & Dahua.\nMenyusun daftar material...\nPengujian sistem keamanan aktif.\nPenjadwalan pemeliharaan rutin diverifikasi.";

    useEffect(() => {
        let i = 0;
        const interval = setInterval(() => {
            setTyped(codeString.substring(0, i));
            i++;
            if (i > codeString.length) {
                clearInterval(interval);
                setTimeout(() => setTyped(""), 3000); // loop
            }
        }, 40);
        return () => clearInterval(interval);
    }, [typed === ""]);

    return (
        <div className="bg-[#0D0D12] rounded-[2.5rem] p-10 flex flex-col shadow-xl border border-[rgba(250,248,245,0.05)] h-[28rem] hover:-translate-y-2 hover:shadow-2xl transition-all duration-500 relative cursor-default">
            <div className="absolute inset-0 bg-gradient-to-br from-[#C9A84C]/5 to-transparent rounded-[2.5rem] pointer-events-none" />

            <div className="flex justify-between items-start mb-6 relative z-10">
                <div>
                    <div className="w-14 h-14 rounded-full border border-[rgba(201,168,76,0.3)] bg-[#C9A84C]/5 flex items-center justify-center mb-8 group-hover:bg-[#C9A84C]/10 transition-colors">
                        <Shield className="w-6 h-6 text-[#C9A84C]" />
                    </div>
                    <h3 className="font-normal text-2xl md:text-3xl font-[family-name:var(--font-inter)] tracking-tight text-[#FAF8F5]">Barang & Pemeliharaan</h3>
                    <p className="text-[#FAF8F5]/50 text-sm md:text-base mt-4 font-[family-name:var(--font-inter)] max-w-xs leading-relaxed">
                        Menyediakan semua brand Security System terbaik, dilengkapi garansi dan layanan pemeliharaan proaktif.
                    </p>
                </div>
            </div>

            <div className="mt-auto bg-[#1A1A24]/90 backdrop-blur-xl rounded-[1.5rem] p-6 min-h-[140px] font-[family-name:var(--font-jetbrains)] text-[#FAF8F5]/90 text-xs h-[140px] border border-[rgba(250,248,245,0.04)] shadow-inner">
                <div className="flex items-center gap-2 mb-4 text-[11px] text-[#C9A84C] font-semibold uppercase tracking-widest border-b border-[rgba(250,248,245,0.05)] pb-3">
                    <span className="w-2 h-2 rounded-full bg-[#C9A84C] animate-pulse shadow-[0_0_8px_rgba(201,168,76,0.6)]" /> Terminal Logs
                </div>
                <pre className="whitespace-pre-wrap leading-relaxed opacity-80">{typed}<span className="inline-block w-2 bg-[#C9A84C] animate-pulse ml-1 opacity-70">&nbsp;</span></pre>
            </div>
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
                y: 60,
                opacity: 0,
                stagger: 0.08,
                ease: "power3.out",
                duration: 1.4
            });
        }, comp);
        return () => ctx.revert();
    }, []);

    const TextSplit = ({ text, className }: { text: string, className?: string }) => (
        <span className={`phil-text block ${className}`}>
            {text.split(' ').map((word, i) => (
                <span key={i} className="inline-block overflow-hidden mr-3 md:mr-4">
                    <span className="word inline-block">{word}</span>
                </span>
            ))}
        </span>
    );

    return (
        <section ref={comp} id="philosophy" className="relative w-full py-48 md:py-72 bg-[#0D0D12] overflow-hidden text-[#FAF8F5] px-8 md:px-16 flex flex-col items-center text-center">
            <div className="absolute inset-0 opacity-15 mix-blend-screen pointer-events-none">
                <Image
                    src="https://images.unsplash.com/photo-1618219908412-a29a1bb7b86e?q=80&w=2940&auto=format&fit=crop"
                    alt="Luxury Architecture Texture"
                    fill
                    className="object-cover grayscale brightness-50"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-[#0D0D12] via-transparent to-[#0D0D12]" />
            </div>

            <div className="relative z-10 w-full max-w-6xl flex flex-col gap-16 md:gap-20">
                <TextSplit
                    text="Kebanyakan instalasi keamanan dilakukan secara asal, meninggalkan kabel berserakan tanpa memikirkan nilai estetika ruangan."
                    className="font-[family-name:var(--font-inter)] font-light text-xl md:text-3xl text-[#FAF8F5]/40 tracking-wide leading-relaxed max-w-4xl mx-auto"
                />
                <h2 className="flex flex-col gap-4 mt-8">
                    <TextSplit text="Kami hadir membawa standar baru:" className="font-[family-name:var(--font-inter)] tracking-tight text-3xl md:text-5xl font-normal text-[#FAF8F5]/80" />
                    <TextSplit text="Ketenangan pikiran & kemewahan tanpa kompromi." className="font-[family-name:var(--font-playfair)] italic font-light text-5xl md:text-[6.5rem] leading-[1.1] text-[#C9A84C] mt-2" />
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
                if (index === cards.length - 1) return;

                ScrollTrigger.create({
                    trigger: card,
                    start: "top top",
                    endTrigger: cards[index + 1],
                    end: "top top",
                    pin: true,
                    pinSpacing: false,
                    animation: gsap.to(card, {
                        scale: 0.92,
                        opacity: 0.15,
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
        { num: "01", title: "Pemetaan Area", desc: "Penilaian menyeluruh pada titik buta dan rute perkabelan tersembunyi untuk menjaga keindahan interior properti Anda." },
        { num: "02", title: "Eksekusi Akurat", desc: "Tim spesialis kami merakit arsitektur sistem keamanan cctv dengan presisi tinggi dan perangkat keras papan atas." },
        { num: "03", title: "Aktivasi Sistem", desc: "Pengaktifan cloud, penyerahan akses keamanan secara privat, dan komitmen layanan dukungan pemeliharaan aktif." },
    ];

    return (
        <section id="protocol" ref={containerRef} className="w-full bg-[#0D0D12] relative pb-32">
            <div className="py-40 px-8 md:px-16 text-center max-w-3xl mx-auto">
                <h2 className="font-[family-name:var(--font-inter)] font-normal tracking-tight text-5xl md:text-6xl text-[#FAF8F5]">Proses Integrasi</h2>
                <p className="font-[family-name:var(--font-jetbrains)] text-[#C9A84C] mt-8 tracking-[0.25em] text-sm uppercase font-semibold">Tiga langkah menuju keamanan absolut</p>
            </div>

            <div className="w-full relative px-4 md:px-8">
                {steps.map((step, i) => (
                    <div key={i} className="stack-card h-[100dvh] w-full max-w-7xl mx-auto flex items-center justify-center pt-24 pb-12">
                        <div className="w-full h-full bg-[#15151A] rounded-[3rem] shadow-[0_30px_100px_rgba(0,0,0,0.5)] border border-[rgba(250,248,245,0.03)] p-12 lg:p-20 flex flex-col md:flex-row items-center gap-20 overflow-hidden relative">

                            <div className="flex-1 flex flex-col justify-center h-full relative z-10 p-4">
                                <span className="font-[family-name:var(--font-jetbrains)] text-7xl md:text-[9rem] text-[#C9A84C]/10 font-bold w-full leading-none mb-4 absolute -top-10 -left-6 -z-10">{step.num}</span>
                                <h3 className="font-[family-name:var(--font-inter)] tracking-tight text-4xl md:text-5xl font-normal mt-4 text-[#FAF8F5] leading-tight">{step.title}</h3>
                                <p className="mt-8 text-[#FAF8F5]/60 md:text-xl font-light max-w-lg leading-relaxed">{step.desc}</p>
                            </div>

                            <div className="hidden md:flex flex-1 w-full max-w-lg h-[450px] items-center justify-center bg-[#0D0D12]/80 backdrop-blur-md rounded-[2.5rem] border border-[rgba(250,248,245,0.02)] relative overflow-hidden shadow-2xl">
                                {i === 0 && (
                                    <svg viewBox="0 0 100 100" className="w-[85%] h-[85%] opacity-70 animate-[spin_60s_linear_infinite]" style={{ transformOrigin: 'center' }}>
                                        <circle cx="50" cy="50" r="40" fill="none" stroke="#C9A84C" strokeWidth="0.5" strokeDasharray="2 6" />
                                        <circle cx="50" cy="50" r="25" fill="none" stroke="#C9A84C" strokeWidth="0.8" opacity="0.6" />
                                        <polygon points="50,15 80,65 20,65" fill="none" stroke="#C9A84C" strokeWidth="0.5" className="animate-[pulse_4s_infinite]" />
                                    </svg>
                                )}
                                {i === 1 && (
                                    <div className="w-full h-full p-12 relative flex items-center justify-center">
                                        <div className="w-full h-full border border-[#C9A84C]/10 rounded-full flex items-center justify-center">
                                            <div className="w-[60%] h-[60%] border border-[#C9A84C]/30 rounded-full flex items-center justify-center">
                                                <div className="w-[30%] h-[30%] bg-[#C9A84C]/10 rounded-full shadow-[0_0_40px_#C9A84C]" />
                                            </div>
                                        </div>
                                        <div className="absolute top-1/2 left-0 w-full h-[1px] bg-[#C9A84C]/50 shadow-[0_0_20px_#C9A84C] animate-[luxScan_4s_infinite_ease-in-out]" />
                                    </div>
                                )}
                                {i === 2 && (
                                    <svg viewBox="0 0 100 50" className="w-[85%] overflow-visible border-b border-[#C9A84C]/20 pb-4">
                                        <path d="M 0,25 L 15,25 L 20,10 L 25,45 L 30,15 L 35,35 L 40,25 L 100,25" fill="none" stroke="#C9A84C" strokeWidth="1" strokeDasharray="300" strokeDashoffset="0" className="animate-[luxPulse_4s_infinite]" />
                                        <circle cx="25" cy="45" r="1.5" fill="#C9A84C" className="animate-pulse" />
                                        <circle cx="40" cy="25" r="1.5" fill="#FAF8F5" className="animate-pulse" />
                                    </svg>
                                )}
                                <style dangerouslySetInnerHTML={{
                                    __html: `
                  @keyframes luxScan { 0% { transform: translateY(-180px); } 50% { transform: translateY(180px); } 100% { transform: translateY(-180px); } }
                  @keyframes luxPulse { 0% { stroke-dashoffset: 300; } 50% { stroke-dashoffset: 0; } 100% { stroke-dashoffset: -300; } }
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
        <footer className="w-full bg-[#15151A] rounded-t-[4rem] px-8 md:px-16 pt-32 pb-12 mt-20 text-[#FAF8F5] border-t border-[rgba(250,248,245,0.03)] relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D12] to-transparent pointer-events-none" />

            <div className="relative max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start gap-16 md:gap-10 z-10">
                <div className="flex flex-col gap-6 max-w-xl">
                    <div className="font-[family-name:var(--font-inter)] font-normal text-xl tracking-tight flex items-center gap-4">
                        <Image
                            src="/logo-new.svg"
                            alt="PT. PN Logo"
                            width={64}
                            height={64}
                            className="object-contain invert brightness-200"
                        />
                        PT. Pantauan Nusantara
                    </div>
                    <h2 className="font-[family-name:var(--font-playfair)] text-5xl md:text-6xl italic font-light text-[#C9A84C] mt-6 tracking-tight leading-tight">Keamanan absolut, didesain untuk Anda.</h2>
                    <p className="text-[#FAF8F5]/50 font-light text-lg max-w-md mt-4 leading-relaxed">Penyedia jasa teknologi keamanan premium di Surabaya dan seluruh Indonesia.</p>
                    <a href="mailto:admin@pantauannusantara.com" className="inline-flex w-fit items-center gap-4 px-10 py-5 bg-[#FAF8F5] text-[#0D0D12] rounded-[3rem] font-medium text-lg hover:bg-[#C9A84C] hover:scale-105 transition-all duration-500 shadow-[0_15px_40px_rgba(250,248,245,0.1)] mt-8 group">
                        Mulai Konsultasi
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
                    </a>
                </div>

                <div className="flex flex-col gap-6 text-base font-[family-name:var(--font-inter)] mt-10 md:mt-0">
                    <h4 className="font-semibold mb-4 opacity-70 uppercase tracking-[0.2em] font-[family-name:var(--font-jetbrains)] text-sm text-[#C9A84C]">Sitemap</h4>
                    <a href="#features" className="hover:text-[#C9A84C] hover:translate-x-2 transition-all font-light opacity-80">Layanan</a>
                    <a href="#philosophy" className="hover:text-[#C9A84C] hover:translate-x-2 transition-all font-light opacity-80">Filosofi</a>
                    <a href="#protocol" className="hover:text-[#C9A84C] hover:translate-x-2 transition-all font-light opacity-80">Proses Kerja</a>
                    <Link href="/login" className="hover:text-[#C9A84C] hover:translate-x-2 transition-all font-light mt-6 text-[#FAF8F5]/70 flex items-center gap-2 border-b border-[rgba(250,248,245,0.1)] pb-2 w-fit">
                        Akses Vendor Internal &rarr;
                    </Link>
                </div>
            </div>

            <div className="relative z-10 max-w-7xl mx-auto mt-40 pt-10 border-t border-[rgba(250,248,245,0.05)] flex flex-col md:flex-row justify-between items-center gap-8 text-sm font-[family-name:var(--font-jetbrains)] opacity-60 tracking-wider">
                <div>© {new Date().getFullYear()} PT Pantauan Nusantara. Seluruh hak cipta dilindungi.</div>
                <div className="flex items-center gap-3 border border-[rgba(250,248,245,0.1)] bg-[#0D0D12]/50 rounded-full px-6 py-3 shadow-inner">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#C9A84C] animate-pulse shadow-[0_0_12px_rgba(201,168,76,0.9)]" />
                    SISTEM KEAMANAN AKTIF
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

                <section id="features" className="w-full max-w-[1400px] mx-auto px-8 py-48 grid grid-cols-1 xl:grid-cols-3 gap-8 relative z-10">
                    <DiagnosticShuffler />
                    <CursorScheduler />
                    <TelemetryTypewriter />
                </section>

                <Philosophy />
                <Protocol />
            </main>
            <Footer />
        </>
    );
}
