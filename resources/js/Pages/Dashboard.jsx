import React, { useState, useEffect } from 'react';
import DashboardLayout from '../Layouts/DashboardLayout';
import { router } from '@inertiajs/react';
import { 
    HardDrive, 
    DoorOpen, 
    Users, 
    Calendar, 
    ArrowUpRight,
    ArrowRight,
    TrendingUp,
    ClipboardCheck
} from 'lucide-react';

export default function Dashboard() {
    const [stats, setStats] = useState({
        equipments: 0,
        rooms: 0,
        members: 0,
        schedules: 0
    });
    const [recentCheckIns, setRecentCheckIns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [token, setToken] = useState(null);

    useEffect(() => {
        const storedToken = localStorage.getItem('auth_token');
        if (!storedToken) {
            router.visit('/login');
            return;
        }
        setToken(storedToken);
        fetchDashboardData(storedToken);
    }, []);

    const fetchDashboardData = async (authToken) => {
        try {
            setLoading(true);
            const headers = {
                'Authorization': `Bearer ${authToken}`,
                'Accept': 'application/json'
            };

            // Fetch in parallel
            const [eqRes, roomRes, memRes, schedRes, checkRes] = await Promise.all([
                fetch('/api/equipments', { headers }),
                fetch('/api/rooms', { headers }),
                fetch('/api/members', { headers }),
                fetch('/api/schedules', { headers }),
                fetch('/api/check-ins/history', { headers })
            ]);

            const eqData = eqRes.ok ? await eqRes.json() : { data: [] };
            const roomData = roomRes.ok ? await roomRes.json() : { data: [] };
            const memData = memRes.ok ? await memRes.json() : { data: [] };
            const schedData = schedRes.ok ? await schedRes.json() : { data: [] };
            const checkData = checkRes.ok ? await checkRes.json() : { data: [] };

            setStats({
                equipments: eqData.data?.length || 0,
                rooms: roomData.data?.length || 0,
                members: memData.data?.length || 0,
                schedules: schedData.data?.length || 0
            });

            setRecentCheckIns((checkData.data || []).slice(0, 5));
        } catch (err) {
            console.error('Error fetching dashboard data:', err);
        } finally {
            setLoading(false);
        }
    };

    const cards = [
        { name: 'Total Inventaris Alat', value: stats.equipments, icon: HardDrive, color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20', path: '/equipments' },
        { name: 'Total Ruangan', value: stats.rooms, icon: DoorOpen, color: 'text-violet-400 bg-violet-500/10 border-violet-500/20', path: '/rooms' },
        { name: 'Anggota Aktif', value: stats.members, icon: Users, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20', path: '/members' },
        { name: 'Jadwal Peminjaman', value: stats.schedules, icon: Calendar, color: 'text-amber-400 bg-amber-500/10 border-amber-500/20', path: '/schedules' },
    ];

    return (
        <DashboardLayout activePage="dashboard">
            <div className="space-y-8">
                {/* Welcome section */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-tight text-white">Dashboard Utama</h1>
                        <p className="text-slate-400 mt-1">Smart-Hub Management System Overview</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={() => router.visit('/schedules')} 
                            className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-indigo-600/10 active:scale-[0.98]"
                        >
                            Peminjaman Baru
                        </button>
                        <button 
                            onClick={() => router.visit('/check-ins')} 
                            className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium px-4 py-2.5 rounded-xl transition-all border border-slate-700 active:scale-[0.98]"
                        >
                            Check-In Baru
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="min-h-[400px] flex items-center justify-center">
                        <svg className="animate-spin h-8 w-8 text-indigo-500" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                    </div>
                ) : (
                    <>
                        {/* Stats grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {cards.map((card, idx) => {
                                const IconComponent = card.icon;
                                return (
                                    <div 
                                        key={idx}
                                        onClick={() => router.visit(card.path)}
                                        className="bg-slate-900/60 backdrop-blur-sm border border-slate-800 p-6 rounded-2xl cursor-pointer hover:border-slate-700 transition-all group relative overflow-hidden"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{card.name}</p>
                                                <h3 className="text-3xl font-bold text-white mt-2 tracking-tight">{card.value}</h3>
                                            </div>
                                            <div className={`p-3 rounded-xl border ${card.color}`}>
                                                <IconComponent className="w-6 h-6" />
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-xs text-indigo-400 font-medium mt-6 group-hover:text-indigo-300 transition-colors">
                                            Kelola Data
                                            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Recent History & Shortcuts */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Check-ins timeline */}
                            <div className="lg:col-span-2 bg-slate-900/60 backdrop-blur-sm border border-slate-800 p-6 rounded-2xl space-y-6">
                                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                                    <div className="flex items-center gap-2.5">
                                        <ClipboardCheck className="w-5 h-5 text-indigo-400" />
                                        <h2 className="text-lg font-bold text-white">Transaksi Check-In Terbaru</h2>
                                    </div>
                                    <button 
                                        onClick={() => router.visit('/check-ins')}
                                        className="text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors flex items-center gap-1"
                                    >
                                        Semua
                                        <ArrowUpRight className="w-3.5 h-3.5" />
                                    </button>
                                </div>

                                {recentCheckIns.length === 0 ? (
                                    <div className="text-center py-8 text-slate-500 text-sm">
                                        Belum ada riwayat transaksi check-in.
                                    </div>
                                ) : (
                                    <div className="flow-root">
                                        <ul className="-mb-8">
                                            {recentCheckIns.map((ci, ciIdx) => (
                                                <li key={ci.id}>
                                                    <div className="relative pb-8">
                                                        {ciIdx !== recentCheckIns.length - 1 ? (
                                                            <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-slate-800" aria-hidden="true" />
                                                        ) : null}
                                                        <div className="relative flex space-x-3">
                                                            <div>
                                                                <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-slate-900 ${
                                                                    ci.status === 'checked_in' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' :
                                                                    ci.status === 'checked_out' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                                                                    'bg-red-500/10 text-red-400 border border-red-500/20'
                                                                }`}>
                                                                    <ClipboardCheck className="w-4 h-4" />
                                                                </span>
                                                            </div>
                                                            <div className="flex-1 min-w-0 pt-1.5 flex justify-between space-x-4">
                                                                <div>
                                                                    <p className="text-sm text-slate-300">
                                                                        <span className="font-semibold text-white">{ci.borrowing_schedule?.member?.user?.name || 'Member'}</span>
                                                                        {' '}check-in{' '}
                                                                        <span className="font-semibold text-indigo-400">
                                                                            {ci.borrowing_schedule?.equipment?.name || ci.borrowing_schedule?.room?.name || 'Item'}
                                                                        </span>
                                                                    </p>
                                                                    <p className="text-xs text-slate-500 mt-0.5">
                                                                        Kondisi Awal: <span className="text-slate-400">{ci.condition_before || 'Baik'}</span>
                                                                        {ci.condition_after && (
                                                                            <>
                                                                                {' | '} Kondisi Akhir: <span className="text-slate-400">{ci.condition_after}</span>
                                                                            </>
                                                                        )}
                                                                    </p>
                                                                </div>
                                                                <div className="text-right text-xs whitespace-nowrap text-slate-500">
                                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider mb-1 block ${
                                                                        ci.status === 'checked_in' ? 'bg-indigo-500/10 text-indigo-400' :
                                                                        ci.status === 'checked_out' ? 'bg-emerald-500/10 text-emerald-400' :
                                                                        'bg-red-500/10 text-red-400'
                                                                    }`}>
                                                                        {ci.status}
                                                                    </span>
                                                                    <time dateTime={ci.check_in_time}>
                                                                        {new Date(ci.check_in_time).toLocaleDateString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                                                    </time>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>

                            {/* Shortcuts & Guide */}
                            <div className="bg-slate-900/60 backdrop-blur-sm border border-slate-800 p-6 rounded-2xl space-y-6">
                                <h2 className="text-lg font-bold text-white border-b border-slate-800 pb-4 flex items-center gap-2">
                                    <TrendingUp className="w-5 h-5 text-indigo-400" />
                                    Panduan & Alur Kerja
                                </h2>
                                <div className="space-y-4 text-sm text-slate-400">
                                    <div className="flex gap-3">
                                        <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-indigo-400 border border-slate-700 shrink-0">1</div>
                                        <p><span className="text-white font-semibold">Data Master:</span> Daftarkan peralatan, ruangan, dan anggota di tab menu masing-masing.</p>
                                    </div>
                                    <div className="flex gap-3">
                                        <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-indigo-400 border border-slate-700 shrink-0">2</div>
                                        <p><span className="text-white font-semibold">Pengajuan Jadwal:</span> Buat jadwal peminjaman alat atau ruangan. Status awal akan berupa <span className="text-amber-400">Pending</span>.</p>
                                    </div>
                                    <div className="flex gap-3">
                                        <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-indigo-400 border border-slate-700 shrink-0">3</div>
                                        <p><span className="text-white font-semibold">Persetujuan:</span> Admin menyetujui jadwal peminjaman (<span className="text-emerald-400">Approved</span>).</p>
                                    </div>
                                    <div className="flex gap-3">
                                        <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-indigo-400 border border-slate-700 shrink-0">4</div>
                                        <p><span className="text-white font-semibold">Check-In:</span> Lakukan check-in saat peminjaman dimulai dengan mencatat kondisi awal barang.</p>
                                    </div>
                                    <div className="flex gap-3">
                                        <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-indigo-400 border border-slate-700 shrink-0">5</div>
                                        <p><span className="text-white font-semibold">Check-Out:</span> Selesaikan transaksi dengan mengembalikan barang/ruangan dan mencatat kondisi akhir.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </DashboardLayout>
    );
}
