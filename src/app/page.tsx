import React from 'react';
import Image from 'next/image';
import { ShieldCheck, Crosshair, Wrench, ArrowRight, ShieldStar } from '@phosphor-icons/react/dist/ssr';

export default function EnterpriseLanding() {
    return (
        <main className="min-h-screen bg-white text-slate-900 font-inter selection:bg-red-600 selection:text-white">

            {/* Header */}
            <header className="fixed top-0 left-0 right-0 h-24 bg-white/95 backdrop-blur-md border-b border-slate-200 z-50 transition-all duration-300">
                <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between relative">

                    {/* Logo & Company Name */}
                    <div className="flex items-center gap-4 h-full">
                        {/* Overflowing Logo Container */}
                        <div className="absolute top-0 -left-6 md:-left-8 w-[140px] md:w-[180px] h-[140px] md:h-[180px]">
                            <Image
                                src="/logo-transparent.png"
                                alt="PT.PN Logo"
                                fill
                                className="object-contain drop-shadow-md"
                                priority
                            />
                        </div>
                        {/* Company Text Shifted Right */}
                        <div className="ml-[120px] md:ml-[160px] flex flex-col hidden sm:flex">
                            <span className="font-syne font-bold text-xl md:text-2xl text-slate-900 tracking-tight leading-none mb-1">PT. Pantauan Nusantara</span>
                            <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Professional Integration Partner</span>
                        </div>
                    </div>

                    <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
                        <a href="#about" className="hover:text-slate-900 transition-colors tracking-wide uppercase">About Us</a>
                        <a href="#services" className="hover:text-slate-900 transition-colors tracking-wide uppercase">Services</a>
                        <a href="#process" className="hover:text-slate-900 transition-colors tracking-wide uppercase">How We Work</a>
                    </nav>

                    <div className="flex items-center">
                        <a href="https://wa.me/6285100476464" target="_blank" rel="noopener noreferrer" className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm font-bold shadow-md transition-all flex items-center gap-2 border border-red-700">
                            Request Site Survey <ArrowRight weight="bold" />
                        </a>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="pt-40 pb-20 md:pt-48 md:pb-32 bg-slate-50 border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center gap-12">

                    <div className="flex-1 text-left">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-100 border border-red-200 text-red-700 text-xs font-bold mb-6 uppercase tracking-widest shadow-sm">
                            <ShieldStar weight="fill" className="w-4 h-4" /> Professional Integration Partner
                        </div>

                        <h1 className="text-4xl md:text-6xl font-syne font-extrabold text-slate-900 leading-[1.15] mb-6 tracking-tight">
                            Quality Installation.<br />
                            Reliable Security.<br />
                            <span className="text-red-600">One Smart Solution.</span>
                        </h1>

                        <p className="text-lg text-slate-600 mb-10 max-w-xl leading-relaxed font-medium">
                            We design, install, and manage professional CCTV and network systems with structured execution and verified documentation.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center gap-4">
                            <a href="#contact" className="px-8 py-4 bg-slate-900 text-white rounded-md font-bold hover:bg-slate-800 transition-all flex items-center justify-center gap-2 shadow-lg w-full sm:w-auto">
                                Request Site Survey <ArrowRight weight="bold" />
                            </a>
                            <a href="https://wa.me/6285100476464" target="_blank" rel="noopener noreferrer" className="px-8 py-4 bg-white text-slate-900 border border-slate-300 rounded-md font-bold hover:bg-slate-50 transition-all w-full sm:w-auto text-center">
                                Get Quotation
                            </a>
                        </div>
                    </div>

                    <div className="flex-1 w-full">
                        <div className="relative aspect-video md:aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl bg-slate-200 border border-slate-300">
                            <Image
                                src="https://images.unsplash.com/photo-1557597774-9d273605dfa9?q=80&w=2000&auto=format&fit=crop"
                                alt="Security Operations"
                                fill
                                className="object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-tr from-slate-900/40 to-transparent mix-blend-multiply"></div>
                        </div>
                    </div>
                </div>

                {/* Partner Marquee Strip */}
                <div className="mt-20 overflow-hidden border-y border-slate-200 bg-white py-8">
                    <div className="max-w-7xl mx-auto px-6">
                        <p className="text-center text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">Authorized Dealer & Integration Partner</p>
                        <div className="flex justify-center flex-wrap items-center gap-16 md:gap-32 opacity-80 grayscale hover:grayscale-0 transition-all duration-500">
                            {/* Standard logos */}
                            <img src="/logo-hikvision.png" alt="Hikvision" className="h-10 md:h-12 object-contain w-auto mix-blend-multiply" />
                            <img src="/logo-dahua.png" alt="Dahua" className="h-10 md:h-12 object-contain w-auto mix-blend-multiply" />
                            <img src="/logo-ruijie.png" alt="Ruijie" className="h-8 md:h-10 object-contain w-auto mix-blend-multiply" />
                        </div>
                    </div>
                </div>
            </section>

            {/* About Us */}
            <section id="about" className="py-24 bg-white">
                <div className="max-w-4xl mx-auto px-6 text-center">
                    <h2 className="text-3xl md:text-5xl font-syne font-bold text-slate-900 mb-8 tracking-tight">Built on Discipline, <br />Not Guesswork</h2>
                    <p className="text-xl text-slate-600 leading-relaxed font-medium mb-12">
                        We are a professional CCTV and network installation company focused on precision, documentation, and accountability.
                    </p>

                    <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 text-left mb-16">
                        <div className="p-6 bg-slate-50 border border-slate-100 rounded-xl">
                            <span className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-bold mb-4">1</span>
                            <p className="text-slate-800 font-semibold">Site assessment with mapping</p>
                        </div>
                        <div className="p-6 bg-slate-50 border border-slate-100 rounded-xl">
                            <span className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-bold mb-4">2</span>
                            <p className="text-slate-800 font-semibold">Transparent material planning</p>
                        </div>
                        <div className="p-6 bg-slate-50 border border-slate-100 rounded-xl">
                            <span className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-bold mb-4">3</span>
                            <p className="text-slate-800 font-semibold">Verified installation</p>
                        </div>
                        <div className="p-6 bg-slate-50 border border-slate-100 rounded-xl">
                            <span className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-bold mb-4">4</span>
                            <p className="text-slate-800 font-semibold">Evidence-based completion report</p>
                        </div>
                        <div className="p-6 bg-slate-50 border border-slate-100 rounded-xl">
                            <span className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-bold mb-4">5</span>
                            <p className="text-slate-800 font-semibold">Secure payment workflow</p>
                        </div>
                    </div>

                    <div className="inline-block p-8 bg-slate-900 text-white rounded-2xl shadow-xl w-full">
                        <p className="text-2xl font-syne font-bold text-red-500 mb-2">We don't just install cameras.</p>
                        <p className="text-lg text-slate-300">We build systems that protect assets, operations, and peace of mind.</p>
                    </div>
                </div>
            </section>

            {/* Services Grid */}
            <section id="services" className="py-24 bg-slate-50 border-y border-slate-200">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-syne font-bold text-slate-900 mb-6 tracking-tight">Our Services</h2>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Service Card 1 */}
                        <div className="bg-white p-10 rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg transition-all duration-300">
                            <div className="w-14 h-14 bg-red-100 text-red-600 rounded-xl flex items-center justify-center mb-6">
                                <Crosshair weight="duotone" className="w-7 h-7" />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900 mb-4 font-syne">1. CCTV System Installation</h3>
                            <p className="text-slate-600 mb-6 leading-relaxed">
                                Complete design and installation for Warehouse, Factory, Retail Shop, and Residential Property.
                            </p>
                            <p className="text-sm font-semibold text-slate-800 p-4 bg-slate-50 rounded-lg">
                                We plan coverage based on real operational risk, not random camera placement.
                            </p>
                        </div>

                        {/* Service Card 2 */}
                        <div className="bg-white p-10 rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg transition-all duration-300">
                            <div className="w-14 h-14 bg-slate-100 text-blue-600 rounded-xl flex items-center justify-center mb-6">
                                <ShieldCheck weight="duotone" className="w-7 h-7" />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900 mb-4 font-syne">2. Network & Infrastructure</h3>
                            <ul className="text-slate-600 mb-6 space-y-2 text-sm">
                                <li>• Structured cabling</li>
                                <li>• Access point installation</li>
                                <li>• Switch configuration</li>
                                <li>• DVR / NVR integration</li>
                                <li>• Remote monitoring setup</li>
                            </ul>
                            <p className="text-sm font-semibold text-slate-800 p-4 bg-slate-50 rounded-lg">
                                Your system is configured, tested, and verified before handover.
                            </p>
                        </div>

                        {/* Service Card 3 */}
                        <div className="bg-white p-10 rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg transition-all duration-300">
                            <div className="w-14 h-14 bg-slate-100 text-amber-600 rounded-xl flex items-center justify-center mb-6">
                                <Wrench weight="duotone" className="w-7 h-7" />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900 mb-4 font-syne">3. Maintenance & Optimization</h3>
                            <ul className="text-slate-600 mb-6 space-y-2 text-sm">
                                <li>• Periodic system health check</li>
                                <li>• Storage monitoring</li>
                                <li>• Firmware update</li>
                                <li>• Coverage optimization</li>
                                <li>• Hardware replacement planning</li>
                            </ul>
                            <p className="text-sm font-semibold text-slate-800 p-4 bg-slate-50 rounded-lg">
                                Security is not a one-time job.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* How We Work */}
            <section id="process" className="py-24 bg-white">
                <div className="max-w-5xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-syne font-bold text-slate-900 mb-6 tracking-tight">How We Work</h2>
                        <p className="text-slate-500 font-semibold uppercase tracking-widest text-sm">No ambiguity. No hidden scope.</p>
                    </div>

                    <div className="space-y-6">
                        <div className="flex gap-6 items-start p-6 bg-slate-50 border border-slate-100 rounded-2xl">
                            <div className="w-12 h-12 shrink-0 bg-slate-900 text-white font-bold font-syne text-xl flex items-center justify-center rounded-xl">1</div>
                            <div>
                                <h4 className="text-xl font-bold text-slate-900 mb-2">Consultation</h4>
                                <p className="text-slate-600 leading-relaxed">We understand your operational needs and security priorities.</p>
                            </div>
                        </div>

                        <div className="flex gap-6 items-start p-6 bg-slate-50 border border-slate-100 rounded-2xl">
                            <div className="w-12 h-12 shrink-0 bg-slate-900 text-white font-bold font-syne text-xl flex items-center justify-center rounded-xl">2</div>
                            <div>
                                <h4 className="text-xl font-bold text-slate-900 mb-2">On-Site Survey</h4>
                                <p className="text-slate-600 leading-relaxed">Our technical team maps your location, calculates material requirements, and designs optimal camera placement.</p>
                            </div>
                        </div>

                        <div className="flex gap-6 items-start p-6 bg-white border-2 border-red-500 rounded-2xl shadow-md transform md:-translate-x-4">
                            <div className="w-12 h-12 shrink-0 bg-red-600 text-white font-bold font-syne text-xl flex items-center justify-center rounded-xl">3</div>
                            <div>
                                <h4 className="text-xl font-bold text-slate-900 mb-2">Transparent Proposal</h4>
                                <p className="text-slate-600 leading-relaxed">You receive a structured proforma invoice with clear scope and payment terms.</p>
                            </div>
                        </div>

                        <div className="flex gap-6 items-start p-6 bg-slate-50 border border-slate-100 rounded-2xl">
                            <div className="w-12 h-12 shrink-0 bg-slate-900 text-white font-bold font-syne text-xl flex items-center justify-center rounded-xl">4</div>
                            <div>
                                <h4 className="text-xl font-bold text-slate-900 mb-2">Professional Installation</h4>
                                <p className="text-slate-600 leading-relaxed">Installation is documented per camera with checklist verification.</p>
                            </div>
                        </div>

                        <div className="flex gap-6 items-start p-6 bg-slate-50 border border-slate-100 rounded-2xl">
                            <div className="w-12 h-12 shrink-0 bg-slate-900 text-white font-bold font-syne text-xl flex items-center justify-center rounded-xl">5</div>
                            <div>
                                <h4 className="text-xl font-bold text-slate-900 mb-2">Verified Handover</h4>
                                <p className="text-slate-600 leading-relaxed">You receive a complete installation report with documentation and proof of work.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer / CTA */}
            <footer className="bg-slate-900 text-slate-400 py-16 border-t border-slate-800">
                <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
                    <div>
                        <h2 className="text-3xl font-syne font-bold text-white mb-6 leading-tight">
                            Security Installed with Precision.
                        </h2>
                        <p className="text-lg text-slate-300 mb-8 max-w-md">
                            Protect your property with a system designed for performance and accountability. We operate with accountability, not assumptions.
                        </p>
                        <ul className="space-y-3 text-sm font-semibold text-slate-400 mb-8">
                            <li className="flex items-center gap-2">✔ Structured Survey & Mapping</li>
                            <li className="flex items-center gap-2">✔ Transparent Cost Breakdown</li>
                            <li className="flex items-center gap-2">✔ Evidence-Based Installation</li>
                            <li className="flex items-center gap-2">✔ Reliable After-Sales Support</li>
                        </ul>
                        <a href="https://wa.me/6285100476464" target="_blank" rel="noopener noreferrer" className="inline-flex px-8 py-4 bg-red-600 text-white rounded-md font-bold hover:bg-red-500 transition-all items-center gap-2 shadow-lg">
                            Request a Professional Site Survey <ArrowRight weight="bold" />
                        </a>
                    </div>

                    <div className="bg-slate-800 p-8 rounded-2xl border border-slate-700">
                        <div className="flex items-center gap-4 mb-8 pb-8 border-b border-slate-700">
                            <div className="relative w-32 h-16 filter invert brightness-200">
                                <Image src="/logo.png" alt="PT.PN Logo" fill className="object-contain" />
                            </div>
                            <div>
                                <span className="block font-syne font-bold text-lg text-white">PT. Pantauan Nusantara</span>
                                <span className="text-xs text-slate-400">Professional Integration Partner</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6 text-sm">
                            <div>
                                <h4 className="text-white font-bold mb-4 uppercase tracking-wider text-xs">Industries</h4>
                                <ul className="space-y-2">
                                    <li>Manufacturing & Factory</li>
                                    <li>Warehouse & Logistics</li>
                                    <li>Retail & Commercial Shop</li>
                                    <li>Residential Property</li>
                                    <li>Office & Corporate</li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="text-white font-bold mb-4 uppercase tracking-wider text-xs">Contact</h4>
                                <ul className="space-y-2 text-slate-300">
                                    <li>sales@pantauannusantara.com</li>
                                    <li className="font-semibold text-white">+62 851 0047 6464</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>
        </main>
    );
}
