import React, { useState, useEffect } from 'react';
import DashboardLayout from '../Layouts/DashboardLayout';
import { router } from '@inertiajs/react';
import { ClipboardCheck, Plus, X, Search, Check, LogIn, LogOut as LogOutIcon, AlertTriangle } from 'lucide-react';

const STATUS_COLORS = {
    checked_in:  'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    checked_out: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    problem:     'bg-red-500/10 text-red-400 border-red-500/20',
};

export default function CheckIns() {
    const [checkIns, setCheckIns] = useState([]);
    const [schedules, setSchedules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [token, setToken] = useState(null);
    const [user, setUser] = useState(null);
    const [search, setSearch] = useState('');
    const [checkInModal, setCheckInModal] = useState(false);
    const [checkOutModal, setCheckOutModal] = useState(null);
    const [ciForm, setCiForm] = useState({ borrowing_schedule_id: '', condition_before: '' });
    const [coForm, setCoForm] = useState({ condition_after: '', status: 'checked_out' });
    const [formErrors, setFormErrors] = useState({});
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState(null);

    useEffect(() => {
        const t = localStorage.getItem('auth_token');
        const u = localStorage.getItem('auth_user');
        if (!t) { router.visit('/login'); return; }
        setToken(t);
        setUser(JSON.parse(u));
        fetchAll(t);
    }, []);

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3500);
    };

    const fetchAll = async (authToken) => {
        setLoading(true);
        const headers = { 'Authorization': `Bearer ${authToken}`, 'Accept': 'application/json' };
        try {
            const [ciRes, sRes] = await Promise.all([
                fetch('/api/check-ins/history', { headers }),
                fetch('/api/schedules', { headers }),
            ]);
            const [ciData, sData] = await Promise.all([ciRes.json(), sRes.json()]);
            setCheckIns(ciData.data || []);
            // Only approved schedules can be checked in
            setSchedules((sData.data || []).filter(s => s.status === 'approved'));
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleCheckIn = async (e) => {
        e.preventDefault();
        setSaving(true);
        setFormErrors({});
        try {
            const res = await fetch('/api/check-ins', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json', 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    borrowing_schedule_id: ciForm.borrowing_schedule_id,
                    condition_before: ciForm.condition_before,
                })
            });
            const data = await res.json();
            if (!res.ok) {
                if (data.errors) setFormErrors(data.errors);
                else showToast(data.message || 'Gagal melakukan check-in.', 'error');
                return;
            }
            setCheckInModal(false);
            setCiForm({ borrowing_schedule_id: '', condition_before: '' });
            await fetchAll(token);
            showToast('Check-in berhasil dicatat.');
        } catch (err) {
            showToast('Terjadi kesalahan jaringan.', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleCheckOut = async (e) => {
        e.preventDefault();
        if (!checkOutModal) return;
        setSaving(true);
        try {
            const res = await fetch(`/api/check-ins/${checkOutModal.id}/checkout`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json', 'Content-Type': 'application/json' },
                body: JSON.stringify(coForm)
            });
            const data = await res.json();
            if (!res.ok) {
                showToast(data.message || 'Gagal melakukan check-out.', 'error');
                return;
            }
            setCheckOutModal(null);
            setCoForm({ condition_after: '', status: 'checked_out' });
            await fetchAll(token);
            showToast('Check-out berhasil dicatat.');
        } catch (err) {
            showToast('Terjadi kesalahan jaringan.', 'error');
        } finally {
            setSaving(false);
        }
    };

    const filtered = checkIns.filter(ci =>
        (ci.borrowing_schedule?.member?.user?.name || '').toLowerCase().includes(search.toLowerCase()) ||
        (ci.borrowing_schedule?.equipment?.name || '').toLowerCase().includes(search.toLowerCase()) ||
        (ci.borrowing_schedule?.room?.name || '').toLowerCase().includes(search.toLowerCase()) ||
        (ci.status || '').includes(search.toLowerCase())
    );

    const fmtDate = (dt) => dt ? new Date(dt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-';

    return (
        <DashboardLayout activePage="check-ins">
            {toast && (
                <div className={`fixed top-6 right-6 z-[60] px-5 py-3.5 rounded-xl shadow-xl text-sm font-medium flex items-center gap-3 ${toast.type === 'error' ? 'bg-red-600 text-white' : 'bg-emerald-600 text-white'}`}>
                    {toast.type === 'error' ? <X className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                    {toast.message}
                </div>
            )}

            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-extrabold tracking-tight text-white flex items-center gap-2">
                            <ClipboardCheck className="text-indigo-400 w-7 h-7" />
                            Transaksi Check-In
                        </h1>
                        <p className="text-slate-400 text-sm mt-1">Rekam check-in dan check-out peminjaman alat/ruangan</p>
                    </div>
                    <button
                        onClick={() => { setCiForm({ borrowing_schedule_id: '', condition_before: '' }); setFormErrors({}); setCheckInModal(true); }}
                        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-indigo-600/20 active:scale-[0.98] shrink-0"
                    >
                        <LogIn className="w-5 h-5" />
                        Check-In Baru
                    </button>
                </div>

                {/* Approved schedules available for check-in */}
                {schedules.length > 0 && (
                    <div className="bg-indigo-500/5 border border-indigo-500/20 rounded-2xl p-4">
                        <div className="flex items-center gap-2 mb-3">
                            <AlertTriangle className="w-4 h-4 text-indigo-400" />
                            <p className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">Jadwal Siap Check-In ({schedules.length})</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {schedules.map(s => (
                                <button
                                    key={s.id}
                                    onClick={() => { setCiForm(f => ({ ...f, borrowing_schedule_id: String(s.id) })); setFormErrors({}); setCheckInModal(true); }}
                                    className="text-xs bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 px-3 py-1.5 rounded-lg border border-indigo-500/20 hover:border-indigo-500/40 transition-colors"
                                >
                                    {s.member?.user?.name} — {s.equipment?.name || s.room?.name}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                <div className="relative max-w-sm">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                    <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari anggota, alat, ruangan..." className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors" />
                </div>

                <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-slate-800 bg-slate-900/80">
                                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Anggota</th>
                                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">Alat / Ruangan</th>
                                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider hidden lg:table-cell">Waktu Masuk</th>
                                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider hidden lg:table-cell">Waktu Keluar</th>
                                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">Kondisi Awal</th>
                                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                                    <th className="px-5 py-3.5 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/60">
                                {loading ? (
                                    <tr><td colSpan={7} className="text-center text-slate-500 py-16"><svg className="animate-spin h-6 w-6 text-indigo-500 mx-auto" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg></td></tr>
                                ) : filtered.length === 0 ? (
                                    <tr><td colSpan={7} className="text-center text-slate-500 py-16 text-sm">Belum ada riwayat check-in{search ? ` untuk "${search}"` : ''}.</td></tr>
                                ) : filtered.map(ci => (
                                    <tr key={ci.id} className="hover:bg-slate-800/30 transition-colors">
                                        <td className="px-5 py-4">
                                            <p className="font-semibold text-white">{ci.borrowing_schedule?.member?.user?.name || '-'}</p>
                                        </td>
                                        <td className="px-5 py-4 hidden md:table-cell">
                                            {ci.borrowing_schedule?.equipment && <div className="text-xs text-slate-300"><span className="text-slate-500">Alat: </span>{ci.borrowing_schedule.equipment.name}</div>}
                                            {ci.borrowing_schedule?.room && <div className="text-xs text-slate-300 mt-0.5"><span className="text-slate-500">Ruang: </span>{ci.borrowing_schedule.room.name}</div>}
                                        </td>
                                        <td className="px-5 py-4 text-xs text-slate-400 hidden lg:table-cell">{fmtDate(ci.check_in_time)}</td>
                                        <td className="px-5 py-4 text-xs text-slate-400 hidden lg:table-cell">{fmtDate(ci.check_out_time)}</td>
                                        <td className="px-5 py-4 text-xs text-slate-400 hidden md:table-cell max-w-[150px] truncate">{ci.condition_before || '-'}</td>
                                        <td className="px-5 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${STATUS_COLORS[ci.status] || ''}`}>
                                                {ci.status}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 text-right">
                                            {ci.status === 'checked_in' && (
                                                <button
                                                    onClick={() => { setCheckOutModal(ci); setCoForm({ condition_after: '', status: 'checked_out' }); }}
                                                    className="flex items-center gap-1.5 text-xs font-medium text-emerald-400 hover:text-emerald-300 bg-emerald-500/5 hover:bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20 hover:border-emerald-500/30 transition-all ml-auto"
                                                >
                                                    <LogOutIcon className="w-3.5 h-3.5" />
                                                    Check-Out
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {!loading && (
                        <div className="px-5 py-3 border-t border-slate-800/60 bg-slate-900/30 text-xs text-slate-500">
                            Menampilkan {filtered.length} dari {checkIns.length} transaksi
                        </div>
                    )}
                </div>
            </div>

            {/* Check-In Modal */}
            {checkInModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm">
                    <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
                            <h2 className="font-bold text-white text-lg flex items-center gap-2"><LogIn className="w-5 h-5 text-indigo-400" /> Check-In Peralatan</h2>
                            <button onClick={() => setCheckInModal(false)} className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-slate-800 transition-colors"><X className="w-5 h-5" /></button>
                        </div>
                        <form onSubmit={handleCheckIn} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Jadwal Peminjaman (Approved)</label>
                                <select value={ciForm.borrowing_schedule_id} onChange={(e) => setCiForm(f => ({ ...f, borrowing_schedule_id: e.target.value }))} required className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500 transition-colors">
                                    <option value="">-- Pilih Jadwal --</option>
                                    {schedules.map(s => (
                                        <option key={s.id} value={s.id}>
                                            {s.member?.user?.name} — {s.equipment?.name || s.room?.name || 'Tanpa item'}
                                        </option>
                                    ))}
                                </select>
                                {schedules.length === 0 && <p className="text-amber-400 text-xs mt-1">Tidak ada jadwal yang approved dan siap check-in.</p>}
                                {formErrors.borrowing_schedule_id && <p className="text-red-400 text-xs mt-1">{formErrors.borrowing_schedule_id[0]}</p>}
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Kondisi Awal Barang</label>
                                <textarea rows={3} value={ciForm.condition_before} onChange={(e) => setCiForm(f => ({ ...f, condition_before: e.target.value }))} placeholder="Deskripsi kondisi alat/ruangan saat diserahkan..." required className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-2.5 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-indigo-500 transition-colors resize-none" />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setCheckInModal(false)} className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium transition-all">Batal</button>
                                <button type="submit" disabled={saving || schedules.length === 0} className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-medium transition-all flex items-center justify-center gap-2">
                                    {saving ? 'Menyimpan...' : <><LogIn className="w-4 h-4" /> Simpan Check-In</>}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Check-Out Modal */}
            {checkOutModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm">
                    <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
                            <h2 className="font-bold text-white text-lg flex items-center gap-2"><LogOutIcon className="w-5 h-5 text-emerald-400" /> Check-Out Peralatan</h2>
                            <button onClick={() => setCheckOutModal(null)} className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-slate-800 transition-colors"><X className="w-5 h-5" /></button>
                        </div>
                        <div className="px-6 pt-4 pb-0">
                            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50 text-sm space-y-1.5">
                                <p className="text-slate-400">Anggota: <span className="text-white font-semibold">{checkOutModal.borrowing_schedule?.member?.user?.name}</span></p>
                                {checkOutModal.borrowing_schedule?.equipment && <p className="text-slate-400">Alat: <span className="text-white font-semibold">{checkOutModal.borrowing_schedule.equipment.name}</span></p>}
                                {checkOutModal.borrowing_schedule?.room && <p className="text-slate-400">Ruangan: <span className="text-white font-semibold">{checkOutModal.borrowing_schedule.room.name}</span></p>}
                                <p className="text-slate-400">Kondisi Awal: <span className="text-slate-300">{checkOutModal.condition_before}</span></p>
                            </div>
                        </div>
                        <form onSubmit={handleCheckOut} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Kondisi Akhir Barang</label>
                                <textarea rows={3} value={coForm.condition_after} onChange={(e) => setCoForm(f => ({ ...f, condition_after: e.target.value }))} placeholder="Deskripsi kondisi alat/ruangan saat dikembalikan..." required className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-2.5 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-emerald-500 transition-colors resize-none" />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Status Pengembalian</label>
                                <select value={coForm.status} onChange={(e) => setCoForm(f => ({ ...f, status: e.target.value }))} className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500 transition-colors">
                                    <option value="checked_out">Checked Out (Normal)</option>
                                    <option value="problem">Problem (Ada Masalah)</option>
                                </select>
                                {coForm.status === 'problem' && (
                                    <p className="text-amber-400 text-xs mt-1.5 flex items-center gap-1.5">
                                        <AlertTriangle className="w-3.5 h-3.5" />
                                        Alat/ruangan akan ditandai sebagai unavailable/maintenance.
                                    </p>
                                )}
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setCheckOutModal(null)} className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium transition-all">Batal</button>
                                <button type="submit" disabled={saving} className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-sm font-medium transition-all flex items-center justify-center gap-2">
                                    {saving ? 'Menyimpan...' : <><LogOutIcon className="w-4 h-4" /> Simpan Check-Out</>}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
