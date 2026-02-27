import { Inter, Syne, Space_Grotesk } from "next/font/google";
import { FolderOpen, Users, ChartLineUp, SignOut } from "@phosphor-icons/react/dist/ssr";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const syne = Syne({ subsets: ["latin"], variable: "--font-syne" });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-space-grotesk" });

export default function SalesLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className={`min-h-screen bg-slate-50 flex ${inter.variable} ${syne.variable} ${spaceGrotesk.variable} font-inter`}>
            {/* Sidebar */}
            <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col items-start hidden md:flex min-h-screen border-r border-slate-800">
                <div className="h-20 w-full flex items-center px-6 border-b border-slate-800 bg-slate-950">
                    <span className="font-syne font-bold text-lg text-white tracking-tight">Sales<span className="text-red-500">Hub</span></span>
                </div>

                <nav className="flex-1 w-full py-6 flex flex-col gap-2 px-4">
                    <a href="/sales" className="flex items-center gap-3 px-4 py-3 bg-red-600/10 text-red-500 rounded-lg font-semibold transition-colors">
                        <FolderOpen weight="duotone" className="w-5 h-5" /> Pipeline
                    </a>
                    <a href="/sales/clients" className="flex items-center gap-3 px-4 py-3 hover:bg-slate-800 hover:text-white rounded-lg font-medium transition-colors">
                        <Users weight="duotone" className="w-5 h-5" /> Clients
                    </a>
                    <a href="/sales/reports" className="flex items-center gap-3 px-4 py-3 hover:bg-slate-800 hover:text-white rounded-lg font-medium transition-colors">
                        <ChartLineUp weight="duotone" className="w-5 h-5" /> Reports
                    </a>
                </nav>

                <div className="p-4 w-full border-t border-slate-800">
                    <form action="/auth/signout" method="post">
                        <button type="submit" className="flex w-full items-center gap-3 px-4 py-3 hover:bg-slate-800 hover:text-white rounded-lg font-medium transition-colors text-left text-sm">
                            <SignOut weight="duotone" className="w-5 h-5 text-slate-400" /> Sign Out
                        </button>
                    </form>
                </div>
            </aside>

            {/* Mobile Header -> TODO: add hamburger */}
            <div className="flex-1 flex flex-col overflow-hidden max-h-screen">
                <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0">
                    <h1 className="text-xl font-syne font-bold text-slate-900">CRM Dashboard</h1>
                    <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-full bg-slate-200 border border-slate-300 flex items-center justify-center text-xs font-bold text-slate-600">S</div>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto bg-slate-50/50 p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
