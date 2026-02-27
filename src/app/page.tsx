"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { ShieldCheck, Crosshair, Wrench, ArrowRight, ShieldStar, CheckCircle, ChatCircle, FileText, MagnifyingGlassPlus } from '@phosphor-icons/react/dist/ssr';
import { Translate } from '@phosphor-icons/react';

const content = {
    id: {
        nav: { about: "Tentang Kami", services: "Layanan", survey: "Survey" },
        hero: {
            sub: "Professional Integration Partner",
            headline: "Quality Installation.\nReliable Security.\nOne Smart Solution.",
            desc1: "Kami menyediakan solusi instalasi CCTV dan jaringan yang terstruktur, terdokumentasi, dan dapat dipertanggungjawabkan.",
            desc2: "Kami tidak hanya memasang kamera. Kami membangun sistem keamanan yang bekerja dengan benar.",
            btnSurvey: "Request Site Survey",
            btnQuote: "Get Quotation",
            partner: "Authorized Dealer & Integration Partner"
        },
        why: {
            title: "Kenapa Harus Pasang CCTV?",
            desc1: "Saat ini banyak kasus kejahatan tidak dapat diproses karena kurangnya bukti yang jelas. Pelaku sulit diidentifikasi, dan jejak kejadian tidak terdokumentasi dengan baik.",
            desc2: "Dengan sistem CCTV yang dirancang dan dipasang secara profesional, Anda mendapatkan:",
            list: [
                "Rekaman berkualitas sebagai bukti hukum",
                "Identifikasi pelaku yang lebih akurat",
                "Pencegahan tindak kriminal",
                "Pengawasan operasional bisnis",
                "Bukti visual untuk klaim asuransi"
            ],
            footer: "Keamanan bukan sekadar pemasangan perangkat. Keamanan adalah sistem yang dirancang dengan tepat."
        },
        about: {
            titleHero: "Built on Discipline, Not Guesswork",
            subtitle: "Kami adalah perusahaan instalasi CCTV dan jaringan profesional yang berfokus pada presisi, dokumentasi, dan akuntabilitas.",
            pointTitle: "Kenapa Pilih Kami?",
            points: [
                "Installer berpengalaman lebih dari 10 tahun",
                "Mengikuti CCTV best practice internasional",
                "Survey lokasi dengan mapping terukur",
                "Estimasi material dan biaya transparan",
                "Instalasi terdokumentasi lengkap",
                "Laporan serah terima dengan checklist dan tanda tangan pelanggan"
            ],
            workflowTitle: "Kami bekerja dengan alur yang jelas:",
            workflow: "Survey → Perencanaan → Proforma → Instalasi → Dokumentasi → Serah Terima",
            footer: "Tanpa asumsi. Tanpa improvisasi."
        },
        services: {
            title: "Layanan Kami",
            cctvTitle: "Instalasi CCTV",
            cctvDesc: "Untuk:\n• Warehouse\n• Factory\n• Retail / Shop\n• Residential\n• Office",
            cctvFooter: "Penempatan kamera berdasarkan analisa risiko, bukan sekadar banyak titik.",
            netTitle: "Instalasi Jaringan & Infrastruktur",
            netList: [
                "Structured cabling",
                "Access point",
                "Switch & rack",
                "DVR / NVR setup",
                "Remote monitoring"
            ],
            netFooter: "Semua diuji sebelum diserahkan."
        },
        survey: {
            title: "Survey Lokasi Profesional (Berbayar)",
            desc: "Kami melakukan survey teknis yang mencakup:",
            list: [
                "Rough mapping lokasi",
                "Penentuan titik kamera",
                "Perhitungan kabel & material",
                "Analisa kebutuhan storage",
                "Estimasi biaya terukur"
            ],
            footer1: "Biaya survey diinformasikan di awal dan dapat diperhitungkan sebagai potongan apabila proyek berjalan.",
            footer2: "Survey profesional memastikan sistem yang tepat sejak awal dan mencegah pemborosan biaya.",
            btn: "Jadwalkan Survey Profesional"
        },
        action: {
            quoteTitle: "Minta Penawaran Sekarang",
            quoteDesc: "Diskusikan kebutuhan Anda langsung dengan tim kami melalui WhatsApp.",
            quoteBtn: "Chat via WhatsApp",
            consultTitle: "Konsultasi Keamanan Gratis",
            consultDesc: "Belum yakin kebutuhan sistem Anda? Isi form singkat dan tim sales kami akan menghubungi Anda untuk konsultasi awal tanpa biaya.",
            consultBtn: "Isi Form Konsultasi"
        },
        commit: {
            title: "Komitmen Kami",
            list: [
                "Instalasi rapi dan aman",
                "Dokumentasi lengkap per kamera",
                "Checklist verifikasi pelanggan",
                "Sistem diuji sebelum serah terima",
                "Dukungan purna jual"
            ],
            footer1: "Keamanan dipasang dengan presisi.",
            footer2: "Bukti terekam dengan jelas."
        }
    },
    en: {
        nav: { about: "About Us", services: "Services", survey: "Survey" },
        hero: {
            sub: "Professional Integration Partner",
            headline: "Quality Installation.\nReliable Security.\nOne Smart Solution.",
            desc1: "We provide structured and documented CCTV and network installation services designed for accountability and performance.",
            desc2: "We don’t just install cameras. We build security systems that work.",
            btnSurvey: "Request Site Survey",
            btnQuote: "Get Quotation",
            partner: "Authorized Dealer & Integration Partner"
        },
        why: {
            title: "Why Install CCTV?",
            desc1: "Many criminal cases fail due to lack of evidence. Poor recording quality or missing footage makes identification difficult.",
            desc2: "A professionally designed CCTV system provides:",
            list: [
                "Clear visual evidence",
                "Accurate suspect identification",
                "Crime prevention",
                "Operational monitoring",
                "Insurance claim support"
            ],
            footer: "Security is not about installing devices. It’s about building a reliable system."
        },
        about: {
            titleHero: "Built on Discipline, Not Guesswork",
            subtitle: "We are a professional CCTV and network installation company focused on precision, documentation, and accountability.",
            pointTitle: "Why Choose Us?",
            points: [
                "10+ years of installation experience",
                "International CCTV best practice standards",
                "Structured site survey with mapping",
                "Transparent material and cost estimation",
                "Fully documented installation",
                "Signed completion checklist"
            ],
            workflowTitle: "Our workflow:",
            workflow: "Survey → Planning → Proforma → Installation → Documentation → Handover",
            footer: "No guesswork. No improvisation."
        },
        services: {
            title: "Our Services",
            cctvTitle: "CCTV Installation",
            cctvDesc: "For:\n• Warehouses\n• Factories\n• Retail Shops\n• Residential Properties\n• Offices",
            cctvFooter: "Camera placement based on risk analysis, not random positioning.",
            netTitle: "Network & Infrastructure Setup",
            netList: [
                "Structured cabling",
                "Access point installation",
                "Switch configuration",
                "DVR / NVR integration",
                "Remote access setup"
            ],
            netFooter: "All systems are tested before handover."
        },
        survey: {
            title: "Professional Paid Site Survey",
            desc: "Our technical survey includes:",
            list: [
                "Site rough mapping",
                "Camera point planning",
                "Cable & material calculation",
                "Storage requirement analysis",
                "Structured cost estimation"
            ],
            footer1: "Survey fee is informed upfront and can be deducted from project value if confirmed.",
            footer2: "Professional planning prevents under-installation and cost overruns.",
            btn: "Schedule Professional Survey"
        },
        action: {
            quoteTitle: "Request a Quotation",
            quoteDesc: "Speak directly with our team via WhatsApp for a quick estimate.",
            quoteBtn: "Chat via WhatsApp",
            consultTitle: "Free Security Consultation",
            consultDesc: "Not sure what system you need? Fill out our form and our sales team will follow up with a free initial consultation.",
            consultBtn: "Fill Consultation Form"
        },
        commit: {
            title: "Our Commitment",
            list: [
                "Clean and secure installation",
                "Per-camera documentation",
                "Customer verification checklist",
                "System fully tested before handover",
                "After-sales support"
            ],
            footer1: "Security installed with precision.",
            footer2: "Evidence recorded with clarity."
        }
    },
    zh: {
        nav: { about: "关于我们", services: "服务", survey: "现场勘察" },
        hero: {
            sub: "专业集成合作伙伴",
            headline: "质量安装安防\n可靠安防\n一体化智能方案",
            desc1: "我们提供结构清晰、可追溯的 CCTV 和网络安装服务，确保系统性能与责任明确。",
            desc2: "我们不只安装摄像头。我们构建真正有效的安防系统。",
            btnSurvey: "预约专业勘察",
            btnQuote: "获取报价",
            partner: "授权经销商与集成伙伴"
        },
        why: {
            title: "为什么要安装 CCTV？",
            desc1: "许多案件因缺乏清晰证据而无法处理。录像模糊或缺失导致嫌疑人难以识别。",
            desc2: "一套专业设计的 CCTV 系统能够提供：",
            list: [
                "清晰的视频证据",
                "更准确的嫌疑人识别",
                "犯罪预防",
                "业务运营监控",
                "保险索赔支持"
            ],
            footer: "安防不是简单安装设备，而是构建可靠的系统。"
        },
        about: {
            titleHero: "基于严谨，拒绝猜测",
            subtitle: "我们是一家专业的 CCTV 和网络安装公司，专注于精准、文档化和责任感。",
            pointTitle: "为什么选择我们？",
            points: [
                "10 年以上安装经验",
                "遵循国际 CCTV 最佳实践标准",
                "现场勘察并绘制测量草图",
                "材料和成本透明估算",
                "完整的安装文档记录",
                "客户签字确认的交付清单"
            ],
            workflowTitle: "我们的工作流程：",
            workflow: "勘察 → 规划 → 报价 → 安装 → 文档 → 交付",
            footer: "没有猜测，没有临时凑合。"
        },
        services: {
            title: "我们的服务",
            cctvTitle: "CCTV 安装",
            cctvDesc: "适用于：\n• 仓库\n• 工厂\n• 零售店 / 商铺\n• 住宅\n• 办公室",
            cctvFooter: "摄像头位置基于风险分析，而非随意布点。",
            netTitle: "网络与基础设施安装",
            netList: [
                "结构化布线",
                "接入点安装",
                "交换机配置",
                "DVR / NVR 集成",
                "远程访问设置"
            ],
            netFooter: "所有系统在交付前均经过测试。"
        },
        survey: {
            title: "专业现场勘察（收费）",
            desc: "我们的技术勘察包括：",
            list: [
                "现场草图绘制",
                "摄像头点位规划",
                "线缆与材料计算",
                "存储需求分析",
                "结构化成本估算"
            ],
            footer1: "勘察费用事先告知，若项目确认执行，可从总费用中抵扣。",
            footer2: "专业规划可避免安装不足或成本超支。",
            btn: "预约专业勘察"
        },
        action: {
            quoteTitle: "立即获取报价",
            quoteDesc: "通过 WhatsApp 直接与我们的团队沟通，快速获取估算。",
            quoteBtn: "WhatsApp 咨询",
            consultTitle: "免费安全咨询",
            consultDesc: "不确定需要什么系统？填写简短表单，我们的销售团队将免费提供初步咨询。",
            consultBtn: "填写咨询表单"
        },
        commit: {
            title: "我们的承诺",
            list: [
                "整洁安全的安装",
                "每台摄像头的文档记录",
                "客户验证清单",
                "交付前系统全面测试",
                "售后支持"
            ],
            footer1: "安防安装，精准无误。",
            footer2: "证据记录，清晰可靠。"
        }
    }
};

export default function EnterpriseLanding() {
    const [lang, setLang] = useState<'id' | 'en' | 'zh'>('id');
    const t = content[lang];

    return (
        <main className="min-h-screen bg-slate-50 text-slate-900 font-inter selection:bg-red-600 selection:text-white">

            {/* Header */}
            <header className="fixed top-0 left-0 right-0 h-24 bg-white/95 backdrop-blur-md border-b border-slate-200 z-50 transition-all duration-300">
                <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between relative">

                    {/* Logo & Company Name */}
                    <div className="flex items-center gap-4 h-full">
                        <div className="absolute top-0 -left-6 md:-left-8 w-[140px] md:w-[180px] h-[140px] md:h-[180px]">
                            <Image
                                src="/logo-transparent.png"
                                alt="PT.PN Logo"
                                fill
                                className="object-contain drop-shadow-md"
                                priority
                            />
                        </div>
                        <div className="ml-[120px] md:ml-[160px] flex flex-col hidden sm:flex">
                            <span className="font-syne font-bold text-xl md:text-2xl text-slate-900 tracking-tight leading-none mb-1">PT. Pantauan Nusantara</span>
                            <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest">{t.hero.sub}</span>
                        </div>
                    </div>

                    <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
                        <a href="#about" className="hover:text-slate-900 transition-colors tracking-wide uppercase">{t.nav.about}</a>
                        <a href="#services" className="hover:text-slate-900 transition-colors tracking-wide uppercase">{t.nav.services}</a>
                        <a href="#survey" className="hover:text-slate-900 transition-colors tracking-wide uppercase">{t.nav.survey}</a>
                    </nav>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => {
                                if (lang === 'id') setLang('en');
                                else if (lang === 'en') setLang('zh');
                                else setLang('id');
                            }}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-300 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all shadow-sm"
                        >
                            <Translate weight="bold" className="w-4 h-4" />
                            {lang.toUpperCase()}
                        </button>
                        <a href="#survey" className="hidden lg:flex px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm font-bold shadow-md transition-all items-center gap-2 border border-red-700">
                            {t.survey.btn} <ArrowRight weight="bold" />
                        </a>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="pt-40 pb-20 md:pt-48 md:pb-32 bg-slate-50 border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center gap-12">

                    <div className="flex-1 text-left">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-100 border border-red-200 text-red-700 text-xs font-bold mb-6 uppercase tracking-widest shadow-sm">
                            <ShieldStar weight="fill" className="w-4 h-4" /> {t.hero.sub}
                        </div>

                        <h1 className="text-4xl md:text-6xl font-syne font-extrabold text-slate-900 leading-[1.15] mb-6 tracking-tight whitespace-pre-wrap">
                            {t.hero.headline}
                        </h1>

                        <div className="text-lg text-slate-600 mb-10 max-w-xl leading-relaxed font-medium space-y-4">
                            <p>{t.hero.desc1}</p>
                            <p className="font-bold text-slate-800 border-l-4 border-red-600 pl-4 bg-white py-2 rounded-r-lg shadow-sm">{t.hero.desc2}</p>
                        </div>

                        <div className="flex flex-col sm:flex-row items-center gap-4">
                            <a href="#survey" className="px-8 py-4 bg-slate-900 text-white rounded-md font-bold hover:bg-slate-800 transition-all flex items-center justify-center gap-2 shadow-lg w-full sm:w-auto">
                                {t.hero.btnSurvey} <ArrowRight weight="bold" />
                            </a>
                            <a href="https://wa.me/6285100476464" target="_blank" rel="noopener noreferrer" className="px-8 py-4 bg-white text-slate-900 border border-slate-300 rounded-md font-bold hover:bg-slate-50 transition-all w-full sm:w-auto text-center shadow-sm">
                                {t.hero.btnQuote}
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
                <div className="mt-20 overflow-hidden border-y border-slate-200 bg-white py-8 shadow-sm">
                    <div className="max-w-7xl mx-auto px-6">
                        <p className="text-center text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">{t.hero.partner}</p>
                        <div className="flex justify-center flex-wrap items-center gap-16 md:gap-32 opacity-80 grayscale hover:grayscale-0 transition-all duration-500">
                            <img src="/logo-hikvision.png" alt="Hikvision" className="h-10 md:h-12 object-contain w-auto mix-blend-multiply" />
                            <img src="/logo-dahua.png" alt="Dahua" className="h-10 md:h-12 object-contain w-auto mix-blend-multiply" />
                            <img src="/logo-ruijie.png" alt="Ruijie" className="h-8 md:h-10 object-contain w-auto mix-blend-multiply" />
                        </div>
                    </div>
                </div>
            </section>

            {/* Why CCTV */}
            <section className="py-24 bg-white">
                <div className="max-w-4xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-syne font-bold text-slate-900 tracking-tight">{t.why.title}</h2>
                    </div>

                    <div className="bg-slate-50 border border-slate-200 p-8 md:p-12 rounded-2xl shadow-sm mb-8 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/5 rounded-bl-[100px] -z-0"></div>
                        <p className="text-lg text-slate-600 leading-relaxed mb-6 font-medium relative z-10">{t.why.desc1}</p>
                        <p className="text-lg text-slate-800 font-bold mb-6 relative z-10">{t.why.desc2}</p>

                        <ul className="grid sm:grid-cols-2 gap-4 relative z-10">
                            {t.why.list.map((item, idx) => (
                                <li key={idx} className="flex items-start gap-3">
                                    <CheckCircle weight="fill" className="text-red-500 w-6 h-6 shrink-0 mt-0.5" />
                                    <span className="text-slate-700 font-medium">{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="text-center">
                        <p className="text-xl font-syne font-bold text-slate-900 bg-red-50 text-red-700 py-4 px-8 rounded-lg inline-block">{t.why.footer}</p>
                    </div>
                </div>
            </section>

            {/* Why Choose Us & Workflow */}
            <section id="about" className="py-24 bg-slate-900 text-white">
                <div className="max-w-5xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-syne font-bold text-white mb-6 tracking-tight">{t.about.titleHero}</h2>
                        <p className="text-xl text-slate-400 font-medium max-w-3xl mx-auto">{t.about.subtitle}</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-12 mb-20">
                        <div>
                            <h3 className="text-2xl font-syne font-bold mb-8 text-red-500">{t.about.pointTitle}</h3>
                            <ul className="space-y-4">
                                {t.about.points.map((pt, idx) => (
                                    <li key={idx} className="flex items-center gap-3 bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
                                        <div className="w-8 h-8 rounded-full bg-red-600/20 text-red-500 flex items-center justify-center font-bold shrink-0">✔</div>
                                        <span className="text-slate-200">{pt}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="bg-slate-800 rounded-2xl p-8 border border-slate-700">
                            <h3 className="text-2xl font-syne font-bold mb-6 text-white">{t.about.workflowTitle}</h3>
                            <div className="flex flex-col gap-4">
                                {t.about.workflow.split(' → ').map((step, idx) => (
                                    <div key={idx} className="flex items-center gap-4">
                                        <div className="w-10 h-10 shrink-0 bg-slate-900 border border-slate-600 rounded-lg flex items-center justify-center font-bold text-slate-400">{idx + 1}</div>
                                        <div className="text-lg font-medium text-slate-200">{step}</div>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-10 p-4 bg-red-600 text-white text-center rounded-xl font-bold tracking-wide uppercase">
                                {t.about.footer}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Services */}
            <section id="services" className="py-24 bg-slate-50 border-b border-slate-200">
                <div className="max-w-5xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-syne font-bold text-slate-900 mb-6 tracking-tight">{t.services.title}</h2>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        {/* CCTV */}
                        <div className="bg-white p-10 rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg transition-all duration-300">
                            <div className="w-14 h-14 bg-red-100 text-red-600 rounded-xl flex items-center justify-center mb-6">
                                <Crosshair weight="duotone" className="w-7 h-7" />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900 mb-4 font-syne">{t.services.cctvTitle}</h3>
                            <p className="text-slate-600 mb-6 whitespace-pre-line leading-relaxed">{t.services.cctvDesc}</p>
                            <p className="text-sm font-semibold text-slate-800 p-4 bg-slate-50 rounded-lg border border-slate-100">
                                {t.services.cctvFooter}
                            </p>
                        </div>

                        {/* Network */}
                        <div className="bg-white p-10 rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg transition-all duration-300">
                            <div className="w-14 h-14 bg-slate-100 text-blue-600 rounded-xl flex items-center justify-center mb-6">
                                <ShieldCheck weight="duotone" className="w-7 h-7" />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900 mb-4 font-syne">{t.services.netTitle}</h3>
                            <ul className="text-slate-600 mb-6 space-y-2">
                                {t.services.netList.map((item, idx) => (
                                    <li key={idx} className="flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span> {item}
                                    </li>
                                ))}
                            </ul>
                            <p className="text-sm font-semibold text-slate-800 p-4 bg-slate-50 rounded-lg border border-slate-100 mt-auto">
                                {t.services.netFooter}
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Action / Survey Section */}
            <section id="survey" className="py-24 bg-white relative overflow-hidden">
                <div className="max-w-4xl mx-auto px-6 relative z-10">
                    <div className="bg-slate-900 rounded-3xl p-10 md:p-16 text-white shadow-2xl overflow-hidden relative">
                        {/* Decorative Background */}
                        <div className="absolute top-[-50%] right-[-10%] w-96 h-96 bg-red-600/20 rounded-full blur-3xl" />

                        <div className="relative z-10">
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-800 border border-slate-700 text-red-400 text-xs font-bold mb-6 uppercase tracking-widest shadow-sm">
                                <MagnifyingGlassPlus weight="bold" className="w-4 h-4" /> Professional
                            </div>

                            <h2 className="text-3xl md:text-4xl font-syne font-bold mb-6">{t.survey.title}</h2>
                            <p className="text-slate-300 mb-8 text-lg">{t.survey.desc}</p>

                            <ul className="grid sm:grid-cols-2 gap-4 mb-10">
                                {t.survey.list.map((item, idx) => (
                                    <li key={idx} className="flex items-center gap-3 text-slate-200 font-medium">
                                        <div className="w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center text-xs shrink-0">✔</div>
                                        {item}
                                    </li>
                                ))}
                            </ul>

                            <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 mb-10 space-y-2">
                                <p className="text-slate-300 text-sm">{t.survey.footer1}</p>
                                <p className="text-slate-300 text-sm font-bold text-red-400">{t.survey.footer2}</p>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4">
                                <a href="https://wa.me/6285100476464" target="_blank" rel="noopener noreferrer" className="px-8 py-4 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-all text-center shadow-[0_0_20px_rgba(220,38,38,0.4)] md:text-lg">
                                    {t.survey.btn}
                                </a>
                            </div>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8 mt-12">
                        <div className="p-8 border-2 border-slate-100 rounded-2xl bg-white shadow-sm hover:shadow-md transition-shadow text-center">
                            <ChatCircle weight="duotone" className="w-12 h-12 text-slate-900 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-slate-900 mb-2">{t.action.quoteTitle}</h3>
                            <p className="text-slate-500 mb-6 h-12 leading-relaxed">{t.action.quoteDesc}</p>
                            <a href="https://wa.me/6285100476464" target="_blank" rel="noopener noreferrer" className="inline-block px-6 py-3 bg-slate-900 text-white rounded-lg font-bold hover:bg-slate-800 w-full">
                                {t.action.quoteBtn}
                            </a>
                        </div>
                        <div className="p-8 border-2 border-slate-100 rounded-2xl bg-white shadow-sm hover:shadow-md transition-shadow text-center">
                            <FileText weight="duotone" className="w-12 h-12 text-slate-900 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-slate-900 mb-2">{t.action.consultTitle}</h3>
                            <p className="text-slate-500 mb-6 h-12 leading-relaxed">{t.action.consultDesc}</p>
                            <a href="/sales/new" className="inline-block px-6 py-3 bg-white border-2 border-slate-200 text-slate-900 rounded-lg font-bold hover:bg-slate-50 w-full">
                                {t.action.consultBtn}
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer / Commitment */}
            <footer className="bg-slate-950 text-slate-400 py-16 border-t border-slate-800">
                <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
                    <div>
                        <h2 className="text-3xl font-syne font-bold text-white mb-6 leading-tight">{t.commit.title}</h2>
                        <ul className="space-y-4 font-medium text-slate-300 mb-10">
                            {t.commit.list.map((item, idx) => (
                                <li key={idx} className="flex items-center gap-3">
                                    <ShieldStar weight="fill" className="text-red-600 w-5 h-5 shrink-0" /> {item}
                                </li>
                            ))}
                        </ul>

                        <div className="space-y-1">
                            <p className="text-xl font-syne font-bold text-white">{t.commit.footer1}</p>
                            <p className="text-xl font-syne font-bold text-white">{t.commit.footer2}</p>
                        </div>
                    </div>

                    <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800">
                        <div className="flex items-center gap-4 mb-8 pb-8 border-b border-slate-800">
                            <div className="relative w-24 h-12 filter invert brightness-200 opacity-50">
                                <Image src="/logo.png" alt="PT.PN Logo" fill className="object-contain" />
                            </div>
                            <div>
                                <span className="block font-syne font-bold text-lg text-white">PT. Pantauan Nusantara</span>
                                <span className="text-xs text-slate-500 uppercase tracking-widest">{t.hero.sub}</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6 text-sm">
                            <div>
                                <h4 className="text-slate-500 font-bold mb-4 uppercase tracking-wider text-xs">Menu</h4>
                                <ul className="space-y-3">
                                    <li><a href="#about" className="hover:text-white transition-colors">{t.nav.about}</a></li>
                                    <li><a href="#services" className="hover:text-white transition-colors">{t.nav.services}</a></li>
                                    <li><a href="#survey" className="hover:text-white transition-colors">{t.survey.title}</a></li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="text-slate-500 font-bold mb-4 uppercase tracking-wider text-xs">Contact</h4>
                                <ul className="space-y-3 text-slate-400">
                                    <li className="hover:text-white transition-colors cursor-pointer">sales@pantauannusantara.com</li>
                                    <li className="font-bold text-white">+62 851 0047 6464</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>
        </main>
    );
}
