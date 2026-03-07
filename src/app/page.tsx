"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

const translations = {
    id: {
        title: "PT. Pantauan Nusantara - Instalasi CCTV, Jaringan & Web Design Profesional Surabaya",
        meta_desc: "Solusi lengkap keamanan & teknologi: Instalasi CCTV profesional, infrastruktur jaringan, dan jasa pembuatan website untuk bisnis Anda. Survey lokasi gratis. Hubungi 0851-0047-6464",
        nav_services: "Layanan",
        nav_why: "Keunggulan",
        nav_portfolio: "Portfolio",
        nav_partners: "Partners",
        nav_contact: "Kontak",
        nav_cta: "Jadwalkan Survey →",
        hero_h1: "Keamanan & Teknologi",
        hero_highlight: "Terukur. Terpercaya.",
        hero_p: "Solusi lengkap instalasi CCTV profesional, infrastruktur jaringan, dan pengembangan website untuk bisnis Anda. Kami tidak hanya memasang — kami membangun sistem yang bekerja dengan presisi.",
        hero_btn_1: "Lihat Layanan",
        hero_btn_2: "Konsultasi Gratis",
        stat_1: "10+",
        stat_1_label: "Tahun Pengalaman",
        stat_2: "500+",
        stat_2_label: "Proyek Selesai",
        stat_3: "100%",
        stat_3_label: "Dokumentasi Lengkap",
        grid_1_title: "CCTV Pro",
        grid_1: "Instalasi berkualitas internasional",
        grid_2_title: "Jaringan",
        grid_2: "Infrastruktur terstruktur & stabil",
        grid_3_title: "Website",
        grid_3: "Desain modern & responsif",
        grid_4_title: "Survey Pro",
        grid_4: "Perencanaan detail & akurat",
        sec_serv_tag: "— Layanan Kami",
        sec_serv_title: "Solusi Terintegrasi untuk Bisnis Anda",
        sec_serv_desc: "Dari keamanan fisik hingga kehadiran digital, kami menyediakan teknologi yang mendukung pertumbuhan bisnis Anda.",
        service_1_title: "Instalasi CCTV Profesional",
        service_1_desc: "Sistem keamanan visual dengan standar internasional. Penempatan kamera berdasarkan analisa risiko, bukan sekadar banyak titik.",
        li_1_1: "Survey lokasi dengan mapping terukur",
        li_1_2: "Hikvision, Dahua, Ruijie authorized",
        li_1_3: "Warehouse, factory, retail, office",
        li_1_4: "Remote monitoring & cloud storage",
        li_1_5: "Garansi instalasi & perangkat",
        link_1: "Jadwalkan Survey →",
        service_2_title: "Infrastruktur Jaringan",
        service_2_desc: "Backbone teknologi yang kuat dan scalable. Structured cabling, networking, dan sistem terintegrasi untuk operasional yang lancar.",
        li_2_1: "Structured cabling profesional",
        li_2_2: "Access point & WiFi enterprise",
        li_2_3: "Switch, rack, patch panel",
        li_2_4: "DVR/NVR setup & konfigurasi",
        li_2_5: "Network testing & dokumentasi",
        link_2: "Konsultasi Jaringan →",
        service_3_title: "Website Development",
        service_3_desc: "Kehadiran digital yang profesional dan efektif. Website modern, responsif, dan SEO-friendly untuk meningkatkan kredibilitas bisnis Anda.",
        li_3_1: "Landing page & company profile",
        li_3_2: "E-commerce & toko online",
        li_3_3: "Website custom & dashboard",
        li_3_4: "SEO optimization & performance",
        li_3_5: "Maintenance & update berkelanjutan",
        link_3: "Mulai Project Web →",
        sec_why_tag: "— Keunggulan Kami",
        sec_why_title: "Built on Discipline, Not Guesswork",
        sec_why_desc: "Kami bekerja dengan metode yang terukur, transparan, dan terdokumentasi dengan lengkap.",
        why_1_title: "Survey Profesional",
        why_1_desc: "Rough mapping lokasi, penentuan titik optimal, perhitungan material akurat. Semua terukur sebelum eksekusi.",
        why_2_title: "Dokumentasi Lengkap",
        why_2_desc: "Setiap instalasi terdokumentasi detail. Laporan serah terima dengan checklist dan tanda tangan pelanggan.",
        why_3_title: "Quality Assurance",
        why_3_desc: "Sistem diuji secara menyeluruh sebelum diserahkan. Instalasi rapi, aman, dan sesuai best practice internasional.",
        why_4_title: "Harga Transparan",
        why_4_desc: "Estimasi biaya yang jelas dan terperinci. Tidak ada biaya tersembunyi. Anda tahu persis apa yang Anda bayar.",
        why_5_title: "Dukungan Purna Jual",
        why_5_desc: "Maintenance, troubleshooting, dan support teknis. Kami siap membantu Anda bahkan setelah project selesai.",
        why_6_title: "Pengalaman 10+ Tahun",
        why_6_desc: "Installer berpengalaman dengan sertifikasi. Ratusan project sukses di berbagai industri dan skala bisnis.",
        partners_title: "Authorized Dealer & Integration Partner",
        cta_title: "Siap Meningkatkan Keamanan & Teknologi Bisnis Anda?",
        cta_p: "Diskusikan kebutuhan Anda dengan tim profesional kami. Survey gratis untuk project yang berjalan.",
        btn_whatsapp: "WhatsApp: 0851-0047-6464",
        btn_email: "Email Kami",
        ft_desc: "Professional Integration Partner untuk solusi keamanan CCTV, infrastruktur jaringan, dan website development yang terukur dan terpercaya.",
        ft_s1: "Layanan",
        ft_l1: "Instalasi CCTV",
        ft_l2: "Infrastruktur Jaringan",
        ft_l3: "Website Development",
        ft_l4: "Survey Profesional",
        ft_s2: "Perusahaan",
        ft_l5: "Tentang Kami",
        ft_s3: "Kontak",
        ft_copy: "© 2026 PT. Pantauan Nusantara Teknologi. All rights reserved."
    },
    en: {
        title: "PT. Pantauan Nusantara – Professional CCTV Installation, Network & Web Design Surabaya",
        meta_desc: "Complete security & technology solutions: professional CCTV installation, network infrastructure, and website development services for your business. Free consultation available. Contact 0851-0047-6464.",
        nav_services: "Services",
        nav_why: "Why Us",
        nav_portfolio: "Portfolio",
        nav_partners: "Partners",
        nav_contact: "Contact",
        nav_cta: "Schedule Survey →",
        hero_h1: "Security & Technology",
        hero_highlight: "Integrated Solutions for Your Business",
        hero_p: "From physical security to digital presence, we provide technology solutions that support the growth of your business.",
        hero_btn_1: "View Services",
        hero_btn_2: "Free Consultation",
        stat_1: "10+",
        stat_1_label: "Years Experience",
        stat_2: "500+",
        stat_2_label: "Completed Projects",
        stat_3: "100%",
        stat_3_label: "Comprehensive Docs",
        grid_1_title: "CCTV Pro",
        grid_1: "International quality installation",
        grid_2_title: "Network",
        grid_2: "Structured & stable infrastructure",
        grid_3_title: "Website",
        grid_3: "Modern & responsive design",
        grid_4_title: "Survey Pro",
        grid_4: "Detailed & accurate planning",
        sec_serv_tag: "— Our Services",
        sec_serv_title: "Integrated Solutions for Your Business",
        sec_serv_desc: "From physical security to digital presence, we provide technology solutions that support the growth of your business.",
        service_1_title: "Professional CCTV Installation",
        service_1_desc: "Security surveillance systems designed for businesses, warehouses, and commercial facilities.",
        li_1_1: "Site survey with measured mapping",
        li_1_2: "Hikvision, Dahua, Ruijie authorized",
        li_1_3: "Warehouse, factory, retail, office",
        li_1_4: "Remote monitoring & cloud storage",
        li_1_5: "Installation & device warranty",
        link_1: "Schedule Survey →",
        service_2_title: "Network Infrastructure",
        service_2_desc: "Stable and scalable network systems for offices and commercial environments.",
        li_2_1: "Professional structured cabling",
        li_2_2: "Enterprise Access Point & WiFi",
        li_2_3: "Switch, rack, patch panel",
        li_2_4: "DVR/NVR setup & configuration",
        li_2_5: "Network testing & documentation",
        link_2: "Network Consultation →",
        service_3_title: "Website Development",
        service_3_desc: "Professional website development to strengthen your company's digital presence.",
        li_3_1: "Landing page & company profile",
        li_3_2: "E-commerce & online store",
        li_3_3: "Custom website & dashboard",
        li_3_4: "SEO optimization & performance",
        li_3_5: "Continuous maintenance & updates",
        link_3: "Start Web Project →",
        sec_why_tag: "— Why Choose Us",
        sec_why_title: "Built on Discipline, Not Guesswork",
        sec_why_desc: "We work with measurable, transparent, and fully documented methods.",
        why_1_title: "Professional Survey",
        why_1_desc: "Rough location mapping, optimal point determination, accurate material calculation. Everything is measured before execution.",
        why_2_title: "Complete Documentation",
        why_2_desc: "Every installation is documented in detail. Handover report with checklist and customer signature.",
        why_3_title: "Quality Assurance",
        why_3_desc: "System is thoroughly tested before handover. Neat, safe installation aligned with international best practices.",
        why_4_title: "Transparent Pricing",
        why_4_desc: "Clear and detailed cost estimates. No hidden fees. You know exactly what you pay.",
        why_5_title: "After-Sales Support",
        why_5_desc: "Maintenance, troubleshooting, and technical support. We are ready to help even after the project is complete.",
        why_6_title: "10+ Years Experience",
        why_6_desc: "Experienced certified installers. Hundreds of successful projects across various industries & scales.",
        partners_title: "Authorized Dealer & Integration Partner",
        cta_title: "Ready to Improve Your Business Security & Technology?",
        cta_p: "Discuss your needs with our professional team. Consultation is available for ongoing projects.",
        btn_whatsapp: "WhatsApp: 0851-0047-6464",
        btn_email: "Email Us",
        ft_desc: "Professional Integration Partner for reliable CCTV security solutions, network infrastructure, and website development.",
        ft_s1: "Services",
        ft_l1: "CCTV Installation",
        ft_l2: "Network Infrastructure",
        ft_l3: "Website Development",
        ft_l4: "Professional Survey",
        ft_s2: "Company",
        ft_l5: "About Us",
        ft_s3: "Contact",
        ft_copy: "© 2026 PT. Pantauan Nusantara Teknologi. All rights reserved."
    },
    zh: {
        title: "PT. Pantauan Nusantara — 泗水专业 CCTV 安装、网络系统与网站设计",
        meta_desc: "为企业提供完整的安全与技术解决方案：专业 CCTV 安装、网络基础设施建设以及网站开发服务。欢迎咨询：0851-0047-6464。",
        nav_services: "服务",
        nav_why: "为什么选择我们",
        nav_portfolio: "作品集",
        nav_partners: "合作伙伴",
        nav_contact: "联系我们",
        nav_cta: "安排调查 →",
        hero_h1: "安全与技术",
        hero_highlight: "为企业提供一体化解决方案",
        hero_p: "从实体安全到数字化业务，我们提供支持企业发展的技术解决方案。",
        hero_btn_1: "查看服务",
        hero_btn_2: "免费咨询",
        stat_1: "10+",
        stat_1_label: "年经验",
        stat_2: "500+",
        stat_2_label: "完成项目",
        stat_3: "100%",
        stat_3_label: "完整文档",
        grid_1_title: "CCTV 专业",
        grid_1: "国际品质安装",
        grid_2_title: "网络系统",
        grid_2: "结构化与稳定的网络系统",
        grid_3_title: "网站开发",
        grid_3: "现代与响应式设计",
        grid_4_title: "专业调查",
        grid_4: "详细准确的规划",
        sec_serv_tag: "— 我们的服务",
        sec_serv_title: "为企业提供一体化解决方案",
        sec_serv_desc: "从实体安全到数字化业务，我们提供支持企业发展的技术解决方案。",
        service_1_title: "专业 CCTV 安装",
        service_1_desc: "为企业、仓库和商业设施提供专业监控系统安装。",
        li_1_1: "带测量映射的现场调查",
        li_1_2: "Hikvision, Dahua, Ruijie 授权",
        li_1_3: "仓库、工厂、零售、办公室",
        li_1_4: "远程监控与云存储",
        li_1_5: "安装与设备保修",
        link_1: "安排调查 →",
        service_2_title: "网络基础设施",
        service_2_desc: "为办公室和商业环境建立稳定且可扩展的网络系统。",
        li_2_1: "专业结构化布线",
        li_2_2: "企业级接入点与 WiFi",
        li_2_3: "交换机、机架、配线架",
        li_2_4: "DVR/NVR 设置与配置",
        li_2_5: "网络测试与文档",
        link_2: "网络咨询 →",
        service_3_title: "网站开发",
        service_3_desc: "帮助企业建立专业的数字形象。",
        li_3_1: "登录页与公司简介",
        li_3_2: "电子商务与在线商店",
        li_3_3: "定制网站与后台",
        li_3_4: "SEO 优化与性能",
        li_3_5: "持续维护与更新",
        link_3: "开始网页项目 →",
        sec_why_tag: "— 为什么选择我们",
        sec_why_title: "基于严谨，而非猜测",
        sec_why_desc: "我们以可衡量、透明且记录完整的方法开展工作。",
        why_1_title: "专业调查",
        why_1_desc: "粗略的地点映射、最佳点确定、准确的材料计算。所有环节都在执行前经过测量。",
        why_2_title: "完整文档",
        why_2_desc: "每次安装均有详细记录。包含交接报告、检查清单和客户签名。",
        why_3_title: "质量保证",
        why_3_desc: "系统在移交前会经过全面测试。整洁、安全的安装符合国际最佳实践。",
        why_4_title: "透明价格",
        why_4_desc: "清晰详细的成本估算。没有隐藏费用。您清楚知道自己支付的费用。",
        why_5_title: "售后支持",
        why_5_desc: "维护、故障排除和技术支持。即使在项目完成后，我们也随时准备提供帮助。",
        why_6_title: "10 年以上经验",
        why_6_desc: "经验丰富的认证安装人员。跨多个行业和业务规模的数百个成功项目。",
        partners_title: "授权经销商与系统集成伙伴",
        cta_title: "准备提升企业的安全与技术系统了吗？",
        cta_p: "与我们的专业团队讨论您的需求。项目可提供咨询服务。",
        btn_whatsapp: "WhatsApp: 0851-0047-6464",
        btn_email: "发送电子邮件",
        ft_desc: "可靠的 CCTV 安全解决方案、网络基础设施和网站开发的专业集成合作伙伴。",
        ft_s1: "服务",
        ft_l1: "CCTV 安装",
        ft_l2: "网络基础设施",
        ft_l3: "网站开发",
        ft_l4: "专业调查",
        ft_s2: "公司",
        ft_l5: "关于我们",
        ft_s3: "联系方式",
        ft_copy: "© 2026 PT. Pantauan Nusantara Teknologi。版权所有。"
    }
};

export default function LandingPage() {
    const [lang, setLang] = useState<"id" | "en" | "zh">("id");
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const t = translations[lang];

    useEffect(() => {
        document.title = t.title;
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) metaDesc.setAttribute("content", t.meta_desc);
    }, [t]);

    return (
        <>
            <style jsx global>{`
                :root {
                    --primary: #5B2EFF;
                    --primary-dark: #3D1FB8;
                    --primary-light: #7B5CFF;
                    --primary-glow: rgba(91, 46, 255, 0.5);
                    --accent: #00E5FF;
                    --accent-glow: rgba(0, 229, 255, 0.5);
                    --dark: #0F0F1A;
                    --dark-2: #1A1A2E;
                    --dark-3: #252542;
                    --gray: #6B7280;
                    --light-gray: #9CA3AF;
                    --border: #2D2D44;
                    --white: #FFFFFF;
                    --off-white: #E5E7EB;
                }

                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }

                html {
                    scroll-behavior: smooth;
                }

                body {
                    font-family: var(--font-work-sans), -apple-system, BlinkMacSystemFont, sans-serif;
                    background: var(--dark);
                    color: var(--off-white);
                    line-height: 1.6;
                    overflow-x: hidden;
                }

                @keyframes slideDown {
                    from { transform: translateY(-100%); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }

                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }

                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(30px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                /* Navigation */
                nav {
                    position: fixed;
                    top: 0;
                    width: 100%;
                    background: rgba(15, 15, 26, 0.95);
                    backdrop-filter: blur(10px);
                    border-bottom: 1px solid var(--border);
                    z-index: 1000;
                    animation: slideDown 0.6s ease-out;
                }

                .nav-container {
                    max-width: 1400px;
                    margin: 0 auto;
                    padding: 1.2rem 2rem;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .brand-container {
                    position: absolute;
                    top: 40px;
                    left: 2rem;
                    display: flex;
                    align-items: center;
                    background: rgba(26, 26, 46, 0.95);
                    padding: 12px 28px 16px 100px;
                    border-radius: 12px;
                    border: 1px solid var(--border);
                    box-shadow: 0 16px 40px rgba(0, 0, 0, 0.6);
                    z-index: 10000;
                    text-decoration: none;
                }

                .logo-icon {
                    position: absolute;
                    left: -30px;
                    top: 50%;
                    transform: translateY(-50%);
                    width: 140px;
                    height: 140px;
                    object-fit: contain;
                    filter: invert(1) brightness(0.9);
                }

                .logo-text {
                    font-family: var(--font-rajdhani), sans-serif;
                    font-weight: 700;
                    font-size: 1.4rem;
                    color: var(--white);
                    line-height: 1.2;
                    transform: translateY(-2px);
                    text-decoration: none;
                }

                .logo-text span {
                    display: block;
                    font-family: var(--font-ibm-mono), monospace;
                    font-size: 0.70rem;
                    color: var(--light-gray);
                    font-weight: 500;
                    letter-spacing: 1px;
                    text-transform: uppercase;
                }

                .nav-wrapper {
                    margin-left: auto;
                    display: flex;
                    align-items: center;
                    gap: 2rem;
                    padding-right: 2rem;
                }

                .nav-links {
                    display: flex;
                    gap: 2.5rem;
                    list-style: none;
                }

                .nav-links a {
                    color: var(--off-white);
                    text-decoration: none;
                    font-weight: 500;
                    font-size: 0.95rem;
                    transition: all 0.3s ease;
                    position: relative;
                }

                .nav-links a::after {
                    content: '';
                    position: absolute;
                    bottom: -5px;
                    left: 0;
                    width: 0;
                    height: 2px;
                    background: var(--primary);
                    transition: width 0.3s ease;
                }

                .nav-links a:hover {
                    color: var(--primary);
                }

                .nav-links a:hover::after {
                    width: 100%;
                }

                .lang-selector {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-family: var(--font-work-sans), sans-serif;
                    font-size: 0.85rem;
                    font-weight: 600;
                    background: rgba(255, 255, 255, 0.05);
                    padding: 4px 12px;
                    border-radius: 20px;
                    border: 1px solid var(--border);
                }

                .lang-selector button {
                    background: none;
                    border: none;
                    color: var(--light-gray);
                    cursor: pointer;
                    padding: 0;
                    font: inherit;
                    transition: color 0.3s ease;
                }

                .lang-selector button.active,
                .lang-selector button:hover {
                    color: var(--white);
                }

                .lang-selector .divider {
                    color: var(--gray);
                    font-size: 0.8rem;
                }

                .brand-mobile {
                    display: none;
                }

                .mobile-menu-toggle {
                    display: none;
                }

                .mobile-menu {
                    display: none;
                }

                .cta-button {
                    background: var(--primary);
                    color: var(--white);
                    padding: 0.75rem 1.8rem;
                    border-radius: 4px;
                    text-decoration: none;
                    font-weight: 600;
                    font-size: 0.95rem;
                    transition: all 0.3s ease;
                    border: 2px solid var(--primary);
                }

                .cta-button:hover {
                    background: transparent;
                    color: var(--primary);
                    transform: translateY(-2px);
                }

                /* Hero Section */
                .hero {
                    margin-top: 80px;
                    min-height: 90vh;
                    display: flex;
                    align-items: center;
                    position: relative;
                    overflow: hidden;
                    background: radial-gradient(ellipse at top right, rgba(91, 46, 255, 0.15) 0%, transparent 50%),
                                radial-gradient(ellipse at bottom left, rgba(0, 229, 255, 0.08) 0%, transparent 50%),
                                linear-gradient(180deg, var(--dark) 0%, var(--dark-2) 100%);
                }

                .hero::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    right: 0;
                    width: 50%;
                    height: 100%;
                    background: linear-gradient(45deg, transparent 30%, rgba(91, 46, 255, 0.05) 30%),
                                linear-gradient(-45deg, transparent 30%, rgba(0, 229, 255, 0.05) 30%);
                    background-size: 60px 60px;
                    opacity: 0.5;
                }

                .hero-container {
                    max-width: 1400px;
                    margin: 0 auto;
                    padding: 4rem 2rem;
                    display: grid;
                    grid-template-columns: 1.2fr 1fr;
                    gap: 4rem;
                    align-items: center;
                    position: relative;
                    z-index: 1;
                }

                .hero-content h1 {
                    font-family: var(--font-rajdhani), sans-serif;
                    font-size: 4.5rem;
                    font-weight: 700;
                    line-height: 1.1;
                    margin-bottom: 1.5rem;
                    color: var(--white);
                    letter-spacing: -2px;
                    animation: fadeInUp 0.8s ease-out 0.2s both;
                }

                .hero-content h1 .highlight {
                    color: var(--primary);
                    display: block;
                }

                .hero-content p {
                    font-size: 1.25rem;
                    color: var(--light-gray);
                    margin-bottom: 2.5rem;
                    line-height: 1.8;
                    animation: fadeInUp 0.8s ease-out 0.4s both;
                }

                .hero-buttons {
                    display: flex;
                    gap: 1.5rem;
                    animation: fadeInUp 0.8s ease-out 0.6s both;
                }

                .btn-primary {
                    background: var(--primary);
                    color: var(--white);
                    padding: 1rem 2.5rem;
                    border-radius: 4px;
                    text-decoration: none;
                    font-weight: 600;
                    font-size: 1.05rem;
                    transition: all 0.3s ease;
                    border: 2px solid var(--primary);
                    display: inline-block;
                }

                .btn-primary:hover {
                    background: var(--primary-dark);
                    transform: translateY(-2px);
                    box-shadow: 0 10px 30px var(--primary-glow);
                }

                .btn-secondary {
                    background: transparent;
                    color: var(--white);
                    padding: 1rem 2.5rem;
                    border-radius: 4px;
                    text-decoration: none;
                    font-weight: 600;
                    font-size: 1.05rem;
                    transition: all 0.3s ease;
                    border: 2px solid var(--border);
                    display: inline-block;
                }

                .btn-secondary:hover {
                    border-color: var(--accent);
                    color: var(--accent);
                    transform: translateY(-2px);
                }

                .hero-stats {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 2rem;
                    margin-top: 3rem;
                    padding-top: 3rem;
                    border-top: 1px solid var(--border);
                    animation: fadeInUp 0.8s ease-out 0.8s both;
                }

                .stat {
                    text-align: center;
                }

                .stat-number {
                    font-family: var(--font-rajdhani), sans-serif;
                    font-size: 2.5rem;
                    font-weight: 700;
                    color: var(--primary);
                    display: block;
                }

                .stat-label {
                    font-size: 0.9rem;
                    color: var(--light-gray);
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    font-family: var(--font-ibm-mono), monospace;
                }

                .hero-visual {
                    position: relative;
                    animation: fadeIn 1s ease-out 0.4s both;
                }

                .security-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 1.5rem;
                }

                .grid-item {
                    background: var(--dark-2);
                    border: 1px solid var(--border);
                    padding: 2rem;
                    border-radius: 8px;
                    transition: all 0.3s ease;
                }

                .grid-item:hover {
                    border-color: var(--primary);
                    transform: translateY(-5px);
                }

                .grid-item-icon {
                    font-size: 2.5rem;
                    margin-bottom: 1rem;
                }

                .grid-item h3 {
                    font-family: var(--font-rajdhani), sans-serif;
                    font-size: 1.3rem;
                    margin-bottom: 0.5rem;
                    color: var(--white);
                }

                .grid-item p {
                    font-size: 0.9rem;
                    color: var(--light-gray);
                }

                /* Services Section */
                .services {
                    padding: 8rem 2rem;
                    background: var(--dark-2);
                    position: relative;
                }

                .section-header {
                    max-width: 1400px;
                    margin: 0 auto 5rem;
                    text-align: center;
                }

                .section-tag {
                    font-family: var(--font-ibm-mono), monospace;
                    font-size: 0.85rem;
                    color: var(--primary);
                    text-transform: uppercase;
                    letter-spacing: 2px;
                    margin-bottom: 1rem;
                    display: block;
                }

                .section-header h2 {
                    font-family: var(--font-rajdhani), sans-serif;
                    font-size: 3.5rem;
                    font-weight: 700;
                    color: var(--white);
                    margin-bottom: 1.5rem;
                    letter-spacing: -1px;
                }

                .section-header p {
                    font-size: 1.2rem;
                    color: var(--light-gray);
                    max-width: 700px;
                    margin: 0 auto;
                }

                .services-grid {
                    max-width: 1400px;
                    margin: 0 auto;
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
                    gap: 2.5rem;
                }

                .service-card {
                    background: var(--dark);
                    border: 1px solid var(--border);
                    border-radius: 8px;
                    padding: 3rem;
                    transition: all 0.4s ease;
                    position: relative;
                    overflow: hidden;
                }

                .service-card::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 4px;
                    background: var(--primary);
                    transform: scaleX(0);
                    transform-origin: left;
                    transition: transform 0.4s ease;
                }

                .service-card:hover::before {
                    transform: scaleX(1);
                }

                .service-card:hover {
                    transform: translateY(-10px);
                    border-color: var(--primary);
                    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
                }

                .service-icon {
                    font-size: 3.5rem;
                    margin-bottom: 1.5rem;
                    display: block;
                }

                .service-card h3 {
                    font-family: var(--font-rajdhani), sans-serif;
                    font-size: 2rem;
                    font-weight: 700;
                    margin-bottom: 1rem;
                    color: var(--white);
                }

                .service-card p {
                    color: var(--light-gray);
                    margin-bottom: 1.5rem;
                    line-height: 1.8;
                }

                .service-features {
                    list-style: none;
                    margin-bottom: 2rem;
                }

                .service-features li {
                    padding: 0.5rem 0;
                    color: var(--light-gray);
                    border-bottom: 1px solid var(--border);
                    font-size: 0.95rem;
                }

                .service-features li::before {
                    content: '✓';
                    color: var(--primary);
                    font-weight: bold;
                    margin-right: 0.75rem;
                }

                .service-link {
                    color: var(--primary);
                    text-decoration: none;
                    font-weight: 600;
                    font-size: 0.95rem;
                    display: inline-flex;
                    align-items: center;
                    gap: 0.5rem;
                    transition: gap 0.3s ease;
                }

                .service-link:hover {
                    gap: 1rem;
                }

                /* Why Choose Us */
                .why-choose {
                    padding: 8rem 2rem;
                    background: var(--dark);
                }

                .section-header.why-header {
                    margin-bottom: 5rem;
                }

                .why-grid {
                    max-width: 1400px;
                    margin: 0 auto;
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 3rem;
                }

                .why-item {
                    text-align: center;
                    padding: 2rem;
                }

                .why-icon {
                    font-size: 3rem;
                    margin-bottom: 1.5rem;
                    display: inline-block;
                    padding: 1.5rem;
                    background: var(--dark-2);
                    border: 2px solid var(--border);
                    border-radius: 50%;
                    transition: all 0.3s ease;
                }

                .why-item:hover .why-icon {
                    border-color: var(--primary);
                    transform: rotate(360deg);
                }

                .why-item h3 {
                    font-family: var(--font-rajdhani), sans-serif;
                    font-size: 1.5rem;
                    margin-bottom: 1rem;
                    color: var(--white);
                }

                .why-item p {
                    color: var(--light-gray);
                    line-height: 1.8;
                }

                /* Portfolio Section */
                .portfolio {
                    padding: 8rem 2rem;
                    background: var(--dark);
                }

                .portfolio-grid {
                    max-width: 1400px;
                    margin: 0 auto;
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
                    gap: 2.5rem;
                }

                .portfolio-item {
                    background: var(--dark-2);
                    border: 1px solid var(--border);
                    border-radius: 8px;
                    padding: 2.5rem;
                    transition: all 0.4s ease;
                    text-align: center;
                }

                .portfolio-item:hover {
                    transform: translateY(-10px);
                    border-color: var(--primary);
                    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
                }

                .portfolio-image {
                    font-size: 4rem;
                    margin-bottom: 1.5rem;
                    display: block;
                }

                .portfolio-item h3 {
                    font-family: var(--font-rajdhani), sans-serif;
                    font-size: 1.5rem;
                    font-weight: 700;
                    margin-bottom: 1rem;
                    color: var(--white);
                }

                .portfolio-item p {
                    color: var(--light-gray);
                    line-height: 1.6;
                }

                /* Partners */
                .partners {
                    padding: 6rem 2rem;
                    background: linear-gradient(180deg, var(--dark-2) 0%, var(--dark-3) 100%);
                    border-top: 1px solid var(--border);
                }

                .partners-container {
                    max-width: 1400px;
                    margin: 0 auto;
                    text-align: center;
                }

                .partners h3 {
                    font-family: var(--font-ibm-mono), monospace;
                    font-size: 0.9rem;
                    color: var(--primary-light);
                    text-transform: uppercase;
                    letter-spacing: 2px;
                    margin-bottom: 3rem;
                    text-shadow: 0 0 20px rgba(91, 46, 255, 0.3);
                }

                .partners-logos {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    gap: 5rem;
                    flex-wrap: wrap;
                }

                .partner-logo-img {
                    height: 70px;
                    object-fit: contain;
                    filter: grayscale(0%) brightness(1) contrast(1);
                    opacity: 0.9;
                    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                }

                .partner-logo-img:hover {
                    filter: grayscale(0%) brightness(1.1) contrast(1);
                    opacity: 1;
                    transform: scale(1.15);
                    filter: drop-shadow(0 0 20px rgba(91, 46, 255, 0.4));
                }

                /* CTA Section */
                .cta-section {
                    padding: 8rem 2rem;
                    background: linear-gradient(135deg, var(--primary-dark) 0%, var(--primary) 100%);
                    position: relative;
                    overflow: hidden;
                }

                .cta-section::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255, 255, 255, 0.03) 10px, rgba(255, 255, 255, 0.03) 20px);
                }

                .cta-container {
                    max-width: 900px;
                    margin: 0 auto;
                    text-align: center;
                    position: relative;
                    z-index: 1;
                }

                .cta-container h2 {
                    font-family: var(--font-rajdhani), sans-serif;
                    font-size: 3.5rem;
                    font-weight: 700;
                    color: var(--white);
                    margin-bottom: 1.5rem;
                    letter-spacing: -1px;
                }

                .cta-container p {
                    font-size: 1.3rem;
                    color: rgba(255, 255, 255, 0.9);
                    margin-bottom: 3rem;
                }

                .cta-buttons {
                    display: flex;
                    gap: 1.5rem;
                    justify-content: center;
                }

                .btn-white {
                    background: var(--white);
                    color: var(--primary);
                    padding: 1.2rem 3rem;
                    border-radius: 4px;
                    text-decoration: none;
                    font-weight: 700;
                    font-size: 1.1rem;
                    transition: all 0.3s ease;
                    border: 2px solid var(--white);
                }

                .btn-white:hover {
                    background: transparent;
                    color: var(--white);
                    transform: translateY(-3px);
                    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
                }

                .btn-outline-white {
                    background: transparent;
                    color: var(--white);
                    padding: 1.2rem 3rem;
                    border-radius: 4px;
                    text-decoration: none;
                    font-weight: 700;
                    font-size: 1.1rem;
                    transition: all 0.3s ease;
                    border: 2px solid var(--white);
                }

                .btn-outline-white:hover {
                    background: var(--white);
                    color: var(--primary);
                    transform: translateY(-3px);
                }

                /* Footer */
                footer {
                    background: var(--dark);
                    border-top: 1px solid var(--border);
                    padding: 4rem 2rem 2rem;
                }

                .footer-container {
                    max-width: 1400px;
                    margin: 0 auto;
                    display: grid;
                    grid-template-columns: 2fr 1fr 1fr 1fr;
                    gap: 4rem;
                    margin-bottom: 3rem;
                }

                .footer-brand h4 {
                    font-family: var(--font-rajdhani), sans-serif;
                    font-size: 1.8rem;
                    font-weight: 700;
                    color: var(--white);
                    margin-bottom: 1rem;
                }

                .footer-brand p {
                    color: var(--light-gray);
                    line-height: 1.8;
                    margin-bottom: 1.5rem;
                }

                .footer-section h5 {
                    font-family: var(--font-rajdhani), sans-serif;
                    font-size: 1.2rem;
                    color: var(--white);
                    margin-bottom: 1.5rem;
                }

                .footer-section ul {
                    list-style: none;
                }

                .footer-section ul li {
                    margin-bottom: 0.75rem;
                }

                .footer-section ul li a {
                    color: var(--light-gray);
                    text-decoration: none;
                    transition: color 0.3s ease;
                }

                .footer-section ul li a:hover {
                    color: var(--primary);
                }

                .footer-bottom {
                    max-width: 1400px;
                    margin: 0 auto;
                    padding-top: 2rem;
                    border-top: 1px solid var(--border);
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .footer-bottom p {
                    color: var(--light-gray);
                    font-size: 0.9rem;
                }

                .social-links {
                    display: flex;
                    gap: 1.5rem;
                }

                .social-links a {
                    color: var(--light-gray);
                    font-size: 1.3rem;
                    transition: all 0.3s ease;
                }

                .social-links a:hover {
                    color: var(--primary);
                    transform: translateY(-3px);
                }

                /* Responsive - Tablet */
                /* Responsive - Navbar (Custom Breakpoint to prevent overlap) */
                @media (max-width: 1200px) {
                    .brand-container {
                        display: none;
                    }

                    .brand-mobile {
                        position: absolute;
                        top: 20px;
                        left: 1rem;
                        display: flex;
                        align-items: center;
                        padding: 8px 16px 8px 60px;
                        background: rgba(26, 26, 46, 0.95);
                        border: 1px solid var(--border);
                        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.6);
                        border-radius: 12px;
                        text-decoration: none;
                        z-index: 10000;
                        transform: scale(0.85);
                        transform-origin: top left;
                    }

                    .brand-mobile img {
                        position: absolute;
                        left: -20px;
                        top: 50%;
                        transform: translateY(-50%);
                        width: 90px !important;
                        height: 90px !important;
                    }

                    .brand-mobile .logo-text {
                        font-family: var(--font-rajdhani), sans-serif;
                        font-weight: 700;
                        font-size: 1.3rem;
                        color: var(--white);
                        line-height: 1;
                        margin: 0;
                        white-space: nowrap;
                    }

                    .nav-container {
                        padding: 1rem 1.5rem;
                    }

                    .nav-links {
                        display: none;
                    }

                    .desktop-only {
                        display: none !important;
                    }

                    .mobile-menu-toggle {
                        display: block;
                        background: none;
                        border: none;
                        width: 30px;
                        height: 24px;
                        position: relative;
                        cursor: pointer;
                        z-index: 1001;
                    }

                    .hamburger, .hamburger::before, .hamburger::after {
                        content: '';
                        display: block;
                        background: var(--white);
                        height: 2px;
                        width: 100%;
                        position: absolute;
                        transition: all 0.3s ease;
                    }

                    .hamburger {
                        top: 50%;
                        transform: translateY(-50%);
                    }

                    .hamburger::before {
                        top: -8px;
                    }

                    .hamburger::after {
                        bottom: -8px;
                    }

                    .hamburger.open {
                        background: transparent;
                    }

                    .hamburger.open::before {
                        top: 0;
                        transform: rotate(45deg);
                    }

                    .hamburger.open::after {
                        bottom: 0;
                        transform: rotate(-45deg);
                    }

                    .mobile-menu {
                        display: block;
                        position: fixed;
                        top: 0;
                        left: 0;
                        width: 100%;
                        height: 100vh;
                        background: rgba(15, 15, 26, 0.98);
                        backdrop-filter: blur(15px);
                        z-index: 999;
                        padding: 80px 2rem 2rem;
                        transform: translateY(-100%);
                        opacity: 0;
                        transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                        pointer-events: none;
                        overflow-y: auto;
                    }

                    .mobile-menu.open {
                        transform: translateY(0);
                        opacity: 1;
                        pointer-events: auto;
                    }

                    .mobile-nav-links {
                        list-style: none;
                        display: flex;
                        flex-direction: column;
                        gap: 2rem;
                        margin-bottom: 3rem;
                        text-align: center;
                        padding: 0;
                    }

                    .mobile-nav-links a {
                        color: var(--white);
                        text-decoration: none;
                        font-size: 1.25rem;
                        font-weight: 500;
                        transition: color 0.3s ease;
                    }

                    .mobile-nav-links a:active {
                        color: var(--primary);
                    }

                    .mobile-lang-selector {
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        gap: 15px;
                        margin-bottom: 3rem;
                        font-family: var(--font-work-sans), sans-serif;
                    }

                    .mobile-lang-selector button {
                        background: none;
                        border: none;
                        color: var(--light-gray);
                        font-size: 1.1rem;
                        font-weight: 600;
                        cursor: pointer;
                        padding: 5px 10px;
                    }

                    .mobile-lang-selector button.active {
                        color: var(--white);
                        background: rgba(255, 255, 255, 0.1);
                        border-radius: 4px;
                    }

                    .mobile-lang-selector .divider {
                        color: var(--border);
                    }

                    .mobile-cta-button {
                        display: block;
                        width: 100%;
                        text-align: center;
                        background: var(--primary);
                        color: var(--white);
                        padding: 1rem;
                        border-radius: 4px;
                        text-decoration: none;
                        font-weight: 600;
                        font-size: 1.1rem;
                    }
                }

                /* Responsive - Tablet */
                @media (max-width: 1024px) {

                    .hero-container {
                        grid-template-columns: 1fr;
                        gap: 3rem;
                    }

                    .hero-content h1 {
                        font-size: 3.5rem;
                    }

                    .why-grid {
                        grid-template-columns: 1fr;
                    }

                    .footer-container {
                        grid-template-columns: 1fr 1fr;
                        gap: 3rem;
                    }
                }

                /* Responsive - Mobile */
                @media (max-width: 768px) {
                    .brand-mobile {
                        transform: scale(0.75);
                    }

                    .hero {
                        margin-top: 60px;
                        min-height: auto;
                        padding: 3rem 0;
                    }

                    .hero-container {
                        padding: 2rem 1.5rem;
                        gap: 2rem;
                    }

                    .hero-content h1 {
                        font-size: 2.5rem;
                    }

                    .hero-content p {
                        font-size: 1rem;
                        margin-bottom: 1.5rem;
                    }

                    .hero-buttons {
                        flex-direction: column;
                        gap: 1rem;
                    }

                    .btn-primary, .btn-secondary {
                        width: 100%;
                        text-align: center;
                        padding: 0.875rem 1.5rem;
                    }

                    .hero-stats {
                        grid-template-columns: 1fr;
                        gap: 1.5rem;
                    }

                    .security-grid {
                        grid-template-columns: 1fr;
                    }

                    .services {
                        padding: 4rem 1.5rem;
                    }

                    .portfolio {
                        padding: 4rem 1.5rem;
                    }

                    .portfolio-grid {
                        grid-template-columns: 1fr;
                    }

                    .section-header h2 {
                        font-size: 2.5rem;
                    }

                    .section-header p {
                        font-size: 1rem;
                    }

                    .services-grid {
                        grid-template-columns: 1fr;
                    }

                    .service-card {
                        padding: 2rem;
                    }

                    .why-choose {
                        padding: 4rem 1.5rem;
                    }

                    .partners {
                        padding: 4rem 1.5rem;
                    }

                    .partners-logos {
                        gap: 2rem;
                    }

                    .cta-section {
                        padding: 4rem 1.5rem;
                    }

                    .cta-container h2 {
                        font-size: 2rem;
                    }

                    .cta-container p {
                        font-size: 1rem;
                    }

                    .cta-buttons {
                        flex-direction: column;
                    }

                    .btn-white, .btn-outline-white {
                        width: 100%;
                        text-align: center;
                    }

                    .footer {
                        padding: 3rem 1.5rem 1.5rem;
                    }

                    .footer-container {
                        grid-template-columns: 1fr;
                        gap: 2rem;
                    }

                    .footer-bottom {
                        flex-direction: column;
                        gap: 1rem;
                        text-align: center;
                    }
                }

                /* Responsive - Small Mobile */
                @media (max-width: 480px) {
                    .hero-content h1 {
                        font-size: 2rem;
                    }

                    .section-header h2 {
                        font-size: 1.75rem;
                    }

                    .stat-number {
                        font-size: 2rem;
                    }

                    .grid-item {
                        padding: 1.5rem;
                    }

                    .service-icon, .why-icon {
                        font-size: 2.5rem;
                    }
                }
            `}</style>

            {/* Navigation */}
            <nav>
                <div className="nav-container">
                    {/* Desktop Brand */}
                    <a href="#" className="brand-container">
                        <Image src="/logo-landing.png" className="logo-icon" alt="Pantauan Nusantara Logo" width={140} height={140} style={{ filter: "invert(1) brightness(0.9)" }} />
                        <div className="logo-text" style={{ textDecoration: "none" }}>
                            PT. Pantauan Nusantara
                            <span>PROFESSIONAL INTEGRATION PARTNER</span>
                        </div>
                    </a>

                    {/* Mobile Brand */}
                    <a href="#" className="brand-mobile">
                        <Image src="/logo-landing.png" alt="Pantauan Nusantara Logo" width={40} height={40} style={{ filter: "invert(1) brightness(0.9)" }} />
                        <div className="logo-text">
                            Pantauan Nusantara
                        </div>
                    </a>

                    <div className="nav-wrapper">
                        <ul className="nav-links">
                            <li><a href="#services">{t.nav_services}</a></li>
                            <li><a href="#why-us">{t.nav_why}</a></li>
                            <li><a href="#portfolio">{t.nav_portfolio}</a></li>
                            <li><a href="#partners">{t.nav_partners}</a></li>
                            <li><a href="#contact">{t.nav_contact}</a></li>
                        </ul>
                        <div className="lang-selector desktop-only">
                            <button onClick={() => setLang("id")} className={lang === "id" ? "active" : ""}>ID</button>
                            <span className="divider">|</span>
                            <button onClick={() => setLang("en")} className={lang === "en" ? "active" : ""}>EN</button>
                            <span className="divider">|</span>
                            <button onClick={() => setLang("zh")} className={lang === "zh" ? "active" : ""}>ZH</button>
                        </div>
                        <a href="https://wa.me/6285100476464" className="cta-button desktop-only">{t.nav_cta}</a>

                        {/* Mobile Toggle Button */}
                        <button
                            className="mobile-menu-toggle"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            aria-label="Toggle mobile menu"
                        >
                            <span className={`hamburger ${isMobileMenuOpen ? 'open' : ''}`}></span>
                        </button>
                    </div>
                </div>

                {/* Mobile Menu Dropdown */}
                <div className={`mobile-menu ${isMobileMenuOpen ? 'open' : ''}`}>
                    <ul className="mobile-nav-links">
                        <li><a href="#services" onClick={() => setIsMobileMenuOpen(false)}>{t.nav_services}</a></li>
                        <li><a href="#why-us" onClick={() => setIsMobileMenuOpen(false)}>{t.nav_why}</a></li>
                        <li><a href="#portfolio" onClick={() => setIsMobileMenuOpen(false)}>{t.nav_portfolio}</a></li>
                        <li><a href="#partners" onClick={() => setIsMobileMenuOpen(false)}>{t.nav_partners}</a></li>
                        <li><a href="#contact" onClick={() => setIsMobileMenuOpen(false)}>{t.nav_contact}</a></li>
                    </ul>
                    <div className="mobile-lang-selector">
                        <button onClick={() => { setLang("id"); setIsMobileMenuOpen(false); }} className={lang === "id" ? "active" : ""}>ID</button>
                        <span className="divider">|</span>
                        <button onClick={() => { setLang("en"); setIsMobileMenuOpen(false); }} className={lang === "en" ? "active" : ""}>EN</button>
                        <span className="divider">|</span>
                        <button onClick={() => { setLang("zh"); setIsMobileMenuOpen(false); }} className={lang === "zh" ? "active" : ""}>ZH</button>
                    </div>
                    <a href="https://wa.me/6285100476464" className="mobile-cta-button">{t.nav_cta}</a>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="hero">
                <div className="hero-container">
                    <div className="hero-content">
                        <h1>
                            {t.hero_h1}
                            <span className="highlight">{t.hero_highlight}</span>
                        </h1>
                        <p>{t.hero_p}</p>
                        <div className="hero-buttons">
                            <a href="#services" className="btn-primary">{t.hero_btn_1}</a>
                            <a href="https://wa.me/6285100476464" className="btn-secondary">{t.hero_btn_2}</a>
                        </div>
                        <div className="hero-stats">
                            <div className="stat">
                                <span className="stat-number">{t.stat_1}</span>
                                <span className="stat-label">{t.stat_1_label}</span>
                            </div>
                            <div className="stat">
                                <span className="stat-number">{t.stat_2}</span>
                                <span className="stat-label">{t.stat_2_label}</span>
                            </div>
                            <div className="stat">
                                <span className="stat-number">{t.stat_3}</span>
                                <span className="stat-label">{t.stat_3_label}</span>
                            </div>
                        </div>
                    </div>
                    <div className="hero-visual">
                        <div className="security-grid">
                            <div className="grid-item">
                                <div className="grid-item-icon">🎥</div>
                                <h3>{t.grid_1_title}</h3>
                                <p>{t.grid_1}</p>
                            </div>
                            <div className="grid-item">
                                <div className="grid-item-icon">🌐</div>
                                <h3>{t.grid_2_title}</h3>
                                <p>{t.grid_2}</p>
                            </div>
                            <div className="grid-item">
                                <div className="grid-item-icon">💻</div>
                                <h3>{t.grid_3_title}</h3>
                                <p>{t.grid_3}</p>
                            </div>
                            <div className="grid-item">
                                <div className="grid-item-icon">📋</div>
                                <h3>{t.grid_4_title}</h3>
                                <p>{t.grid_4}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Services Section */}
            <section className="services" id="services">
                <div className="section-header">
                    <span className="section-tag">{t.sec_serv_tag}</span>
                    <h2>{t.sec_serv_title}</h2>
                    <p>{t.sec_serv_desc}</p>
                </div>
                <div className="services-grid">
                    <article className="service-card">
                        <span className="service-icon">🎥</span>
                        <h3>{t.service_1_title}</h3>
                        <p>{t.service_1_desc}</p>
                        <ul className="service-features">
                            <li>{t.li_1_1}</li>
                            <li>{t.li_1_2}</li>
                            <li>{t.li_1_3}</li>
                            <li>{t.li_1_4}</li>
                            <li>{t.li_1_5}</li>
                        </ul>
                        <a href="#contact" className="service-link">{t.link_1}</a>
                    </article>

                    <article className="service-card">
                        <span className="service-icon">🌐</span>
                        <h3>{t.service_2_title}</h3>
                        <p>{t.service_2_desc}</p>
                        <ul className="service-features">
                            <li>{t.li_2_1}</li>
                            <li>{t.li_2_2}</li>
                            <li>{t.li_2_3}</li>
                            <li>{t.li_2_4}</li>
                            <li>{t.li_2_5}</li>
                        </ul>
                        <a href="#contact" className="service-link">{t.link_2}</a>
                    </article>

                    <article className="service-card">
                        <span className="service-icon">💻</span>
                        <h3>{t.service_3_title}</h3>
                        <p>{t.service_3_desc}</p>
                        <ul className="service-features">
                            <li>{t.li_3_1}</li>
                            <li>{t.li_3_2}</li>
                            <li>{t.li_3_3}</li>
                            <li>{t.li_3_4}</li>
                            <li>{t.li_3_5}</li>
                        </ul>
                        <a href="#contact" className="service-link">{t.link_3}</a>
                    </article>
                </div>
            </section>

            {/* Why Choose Us */}
            <section className="why-choose" id="why-us">
                <div className="section-header why-header">
                    <span className="section-tag">{t.sec_why_tag}</span>
                    <h2>{t.sec_why_title}</h2>
                    <p>{t.sec_why_desc}</p>
                </div>
                <div className="why-grid">
                    <div className="why-item">
                        <div className="why-icon">📐</div>
                        <h3>{t.why_1_title}</h3>
                        <p>{t.why_1_desc}</p>
                    </div>
                    <div className="why-item">
                        <div className="why-icon">📄</div>
                        <h3>{t.why_2_title}</h3>
                        <p>{t.why_2_desc}</p>
                    </div>
                    <div className="why-item">
                        <div className="why-icon">✓</div>
                        <h3>{t.why_3_title}</h3>
                        <p>{t.why_3_desc}</p>
                    </div>
                    <div className="why-item">
                        <div className="why-icon">💰</div>
                        <h3>{t.why_4_title}</h3>
                        <p>{t.why_4_desc}</p>
                    </div>
                    <div className="why-item">
                        <div className="why-icon">🛠️</div>
                        <h3>{t.why_5_title}</h3>
                        <p>{t.why_5_desc}</p>
                    </div>
                    <div className="why-item">
                        <div className="why-icon">⚡</div>
                        <h3>{t.why_6_title}</h3>
                        <p>{t.why_6_desc}</p>
                    </div>
                </div>
            </section>

            {/* Portfolio Section */}
            <section className="portfolio" id="portfolio">
                <div className="section-header">
                    <span className="section-tag">— Portfolio Kami</span>
                    <h2>Proyek Terbaru</h2>
                    <p>Beberapa proyek instalasi CCTV dan jaringan yang telah kami selesaikan dengan sukses.</p>
                </div>
                <div className="portfolio-grid">
                    <div className="portfolio-item">
                        <div className="portfolio-image">🏭</div>
                        <h3>Warehouse CCTV Installation</h3>
                        <p>Instalasi 120+ kamera CCTV untuk warehouse logistik di Surabaya</p>
                    </div>
                    <div className="portfolio-item">
                        <div className="portfolio-image">🏢</div>
                        <h3>Office Network Infrastructure</h3>
                        <p>Structured cabling dan network setup untuk gedung perkantoran 8 lantai</p>
                    </div>
                    <div className="portfolio-item">
                        <div className="portfolio-image">🏪</div>
                        <h3>Retail Store Security System</h3>
                        <p>Integrated CCTV dan access control untuk jaringan retail nasional</p>
                    </div>
                </div>
            </section>

            {/* Partners */}
            <section className="partners" id="partners">
                <div className="partners-container">
                    <h3>{t.partners_title}</h3>
                    <div className="partners-logos">
                        <Image src="/logo-hikvision.png" className="partner-logo-img" alt="Hikvision" width={200} height={70} />
                        <Image src="/logo-dahua.png" className="partner-logo-img" alt="Dahua" width={200} height={70} />
                        <Image src="/logo-ruijie.png" className="partner-logo-img" alt="Ruijie" width={200} height={70} />
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="cta-section" id="contact">
                <div className="cta-container">
                    <h2>{t.cta_title}</h2>
                    <p>{t.cta_p}</p>
                    <div className="cta-buttons">
                        <a href="https://wa.me/6285100476464" className="btn-white">{t.btn_whatsapp}</a>
                        <a href="mailto:sales@pantauannusantara.com" className="btn-outline-white">{t.btn_email}</a>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer>
                <div className="footer-container">
                    <div className="footer-brand">
                        <h4>PT. Pantauan Nusantara</h4>
                        <p>{t.ft_desc}</p>
                    </div>
                    <div className="footer-section">
                        <h5>{t.ft_s1}</h5>
                        <ul>
                            <li><a href="#services">{t.ft_l1}</a></li>
                            <li><a href="#services">{t.ft_l2}</a></li>
                            <li><a href="#services">{t.ft_l3}</a></li>
                            <li><a href="#contact">{t.ft_l4}</a></li>
                        </ul>
                    </div>
                    <div className="footer-section">
                        <h5>{t.ft_s2}</h5>
                        <ul>
                            <li><a href="#why-us">{t.ft_l5}</a></li>
                            <li><a href="#partners">{t.nav_partners}</a></li>
                            <li><a href="#contact">{t.nav_contact}</a></li>
                        </ul>
                    </div>
                    <div className="footer-section">
                        <h5>{t.ft_s3}</h5>
                        <ul>
                            <li><a href="tel:+6285100476464">+62 851 0047 6464</a></li>
                            <li><a href="mailto:sales@pantauannusantara.com">sales@pantauannusantara.com</a></li>
                            <li><a href="https://www.pantauannusantara.com">www.pantauannusantara.com</a></li>
                        </ul>
                    </div>
                </div>
                <div className="footer-bottom">
                    <p>{t.ft_copy}</p>
                    <div className="social-links">
                        <a href="https://wa.me/6285100476464" aria-label="WhatsApp">📱</a>
                        <a href="mailto:sales@pantauannusantara.com" aria-label="Email">📧</a>
                        <a href="#" aria-label="Instagram">📷</a>
                    </div>
                </div>
            </footer>
        </>
    );
}
