import React, { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import { 
    LayoutDashboard, 
    HardDrive, 
    DoorOpen, 
    Users, 
    Calendar, 
    ClipboardCheck, 
    LogOut, 
    Menu, 
    X,
    User
} from 'lucide-react';

export default function DashboardLayout({ children, activePage }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        const storedToken = localStorage.getItem('auth_token');
        const storedUser = localStorage.getItem('auth_user');

        if (!storedToken || !storedUser) {
            router.visit('/login');
        } else {
            setToken(storedToken);
            setUser(JSON.parse(storedUser));
        }
    }, []);

    const handleLogout = async () => {
        try {
            if (token) {
                await fetch('/api/logout', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/json'
                    }
                });
            }
        } catch (err) {
            console.error('Logout error:', err);
        } finally {
            localStorage.removeItem('auth_token');
            localStorage.removeItem('auth_user');
            router.visit('/login');
        }
    };

    if (!user) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <svg className="animate-spin h-8 w-8 text-indigo-500" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
            </div>
        );
    }

    const navigation = [
        { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard', key: 'dashboard' },
        { name: 'Equipments (Alat)', icon: HardDrive, path: '/equipments', key: 'equipments' },
        { name: 'Rooms (Ruangan)', icon: DoorOpen, path: '/rooms', key: 'rooms' },
        { name: 'Members (Anggota)', icon: Users, path: '/members', key: 'members' },
        { name: 'Jadwal Peminjaman', icon: Calendar, path: '/schedules', key: 'schedules' },
        { name: 'Transaksi Check-In', icon: ClipboardCheck, path: '/check-ins', key: 'check-ins' },
    ];

    const isAdmin = user.role === 'admin';

    return (
        <div className="min-h-screen bg-slate-950 flex text-slate-100 font-sans">
            {/* Desktop Sidebar */}
            <aside className="hidden lg:flex lg:flex-col lg:w-72 bg-slate-900 border-r border-slate-800 shrink-0">
                <div className="h-16 flex items-center gap-3 px-6 border-b border-slate-800/80">
                    <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                        </svg>
                    </div>
                    <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">SmartHub</span>
                </div>

                <nav className="flex-1 py-6 px-4 space-y-1.5 overflow-y-auto">
                    {navigation.map((item) => {
                        const IconComponent = item.icon;
                        const isActive = activePage === item.key;
                        return (
                            <button
                                key={item.key}
                                onClick={() => router.visit(item.path)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group ${
                                    isActive
                                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                                        : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                                }`}
                            >
                                <IconComponent className={`w-5 h-5 transition-transform group-hover:scale-105 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`} />
                                {item.name}
                            </button>
                        );
                    })}
                </nav>

                {/* User section at bottom */}
                <div className="p-4 border-t border-slate-800/80 bg-slate-900/40">
                    <div className="flex items-center gap-3 px-2 py-1.5 mb-3">
                        <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700 text-indigo-400 font-bold uppercase shadow-inner">
                            {user.name.substring(0, 2)}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h2 className="text-sm font-semibold truncate text-white">{user.name}</h2>
                            <p className="text-xs text-slate-500 truncate">{user.email}</p>
                        </div>
                    </div>
                    <div className="flex items-center justify-between gap-2 px-2">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider ${
                            isAdmin ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        }`}>
                            {user.role}
                        </span>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-1.5 text-xs font-medium text-red-400 hover:text-red-300 transition-colors py-1.5 px-2.5 rounded-lg hover:bg-red-500/5"
                        >
                            <LogOut className="w-4 h-4" />
                            Log Out
                        </button>
                    </div>
                </div>
            </aside>

            {/* Mobile Navigation Bar */}
            <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-4 z-40">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                        </svg>
                    </div>
                    <span className="font-bold tracking-tight text-white">SmartHub</span>
                </div>
                <button
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors focus:outline-none"
                >
                    {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
            </div>

            {/* Mobile Drawer Backdrop */}
            {mobileMenuOpen && (
                <div 
                    onClick={() => setMobileMenuOpen(false)}
                    className="lg:hidden fixed inset-0 bg-black/60 z-40 backdrop-blur-sm transition-opacity"
                />
            )}

            {/* Mobile Drawer Content */}
            <div className={`lg:hidden fixed top-16 bottom-0 left-0 w-72 bg-slate-900 border-r border-slate-800 z-50 transform transition-transform duration-300 ease-in-out ${
                mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
            } flex flex-col justify-between`}>
                <nav className="py-6 px-4 space-y-1.5 overflow-y-auto">
                    {navigation.map((item) => {
                        const IconComponent = item.icon;
                        const isActive = activePage === item.key;
                        return (
                            <button
                                key={item.key}
                                onClick={() => {
                                    setMobileMenuOpen(false);
                                    router.visit(item.path);
                                }}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                                    isActive
                                        ? 'bg-indigo-600 text-white shadow-lg'
                                        : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                                }`}
                            >
                                <IconComponent className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                                {item.name}
                            </button>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-slate-800 bg-slate-900/40">
                    <div className="flex items-center gap-3 px-2 py-1.5 mb-3">
                        <div className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700 text-indigo-400 font-bold uppercase">
                            {user.name.substring(0, 2)}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h2 className="text-sm font-semibold truncate text-white">{user.name}</h2>
                            <p className="text-xs text-slate-500 truncate">{user.email}</p>
                        </div>
                    </div>
                    <div className="flex items-center justify-between gap-2 px-2">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider ${
                            isAdmin ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        }`}>
                            {user.role}
                        </span>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-1.5 text-xs font-medium text-red-400 hover:text-red-300 transition-colors py-1.5"
                        >
                            <LogOut className="w-4 h-4" />
                            Log Out
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Area */}
            <div className="flex-1 flex flex-col min-w-0 lg:pl-0 pt-16 lg:pt-0">
                <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl w-full mx-auto overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
