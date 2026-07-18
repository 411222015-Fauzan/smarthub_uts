import React, { useState, useEffect } from 'react';
import DashboardLayout from '../Layouts/DashboardLayout';
import { router } from '@inertiajs/react';
import { Calendar, Plus, Pencil, Trash2, X, Search, Check } from 'lucide-react';

const STATUS_COLORS = {
    pending:   'bg-amber-500/10 text-amber-400 border-amber-500/20',
    approved:  'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    rejected:  'bg-red-500/10 text-red-400 border-red-500/20',
    completed: 'bg-slate-700/60 text-slate-400 border-slate-600/50',
};

const emptyForm = { equipment_id: '', room_id: '', start_time: '', end_time: '', purpose: '', status: 'pending' };

export default function Schedules() {
    const [schedules, setSchedules] = useState([]);
    const [equipments, setEquipments] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [token, setToken] = useState(null);
    const [user, setUser] = useState(null);
    const [search, setSearch] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [formErrors, setFormErrors] = useState({});
    const [saving, setSaving] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [deleting, setDeleting] = useState(false);
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
            const [sRes, eRes, rRes] = await Promise.all([
                fetch('/api/schedules', { headers }),
                fetch('/api/equipments', { headers }),
                fetch('/api/rooms', { headers }),
            ]);
            const [sData, eData, rData] = await Promise.all([sRes.json(), eRes.json(), rRes.json()]);
            setSchedules(sData.data || []);
            setEquipments(eData.data || []);
            setRooms(rData.data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const toDatetimeLocal = (dt) => {
        if (!dt) return '';
        const d = new Date(dt);
        const offset = d.getTimezoneOffset() * 60000;
        return new Date(d - offset).toISOString().slice(0, 16);
    };

    const openCreate = () => {
        setEditing(null);
        setForm(emptyForm);
        setFormErrors({});
        setModalOpen(true);
    };

    const openEdit = (sched) => {
        setEditing(sched.id);
        setForm({
            equipment_id: sched.equipment?.id || '',
            room_id: sched.room?.id || '',
            start_time: toDatetimeLocal(sched.start_time),
            end_time: toDatetimeLocal(sched.end_time),
            purpose: sched.purpose || '',
            status: sched.status,
        });
        setFormErrors({});
        setModalOpen(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (!form.equipment_id && !form.room_id) {
            setFormErrors({ equipment_id: ['Pilih minimal satu alat atau ruangan.'] });
            return;
        }
        setSaving(true);
        setFormErrors({});
        try {
            const url = editing ? `/api/schedules/${editing}` : '/api/schedules';
            const method = editing ? 'PUT' : 'POST';
            const payload = {
                equipment_id: form.equipment_id || null,
                room_id: form.room_id || null,
                start_time: form.start_time,
                end_time: form.end_time,
                purpose: form.purpose,
                ...(editing ? { status: form.status } : {}),
            };
            const res = await fetch(url, {
                method,
                headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json', 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            if (!res.ok) {
                if (data.errors) setFormErrors(data.errors);
                else showToast(data.message || 'Gagal menyimpan data.', 'error');
                return;
            }
            setModalOpen(false);
            await fetchAll(token);
            showToast(editing ? 'Jadwal berhasil diperbarui.' : 'Jadwal berhasil dibuat.');
        } catch (err) {
            showToast('Terjadi kesalahan jaringan.', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        setDeleting(true);
        try {
            const res = await fetch(`/api/schedules/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
            });
            const data = await res.json();
            if (!res.ok) { showToast(data.message || 'Gagal menghapus.', 'error'); return; }
            setDeleteConfirm(null);
            await fetchAll(token);
            showToast('Jadwal berhasil dihapus.');
        } catch (err) {
            showToast('Terjadi kesalahan jaringan.', 'error');
        } finally {
            setDeleting(false);
        }
    };

    const filtered = schedules.filter(s =>
        (s.member?.user?.name || '').toLowerCase().includes(search.toLowerCase()) ||
        (s.equipment?.name || '').toLowerCase().includes(search.toLowerCase()) ||
        (s.room?.name || '').toLowerCase().includes(search.toLowerCase()) ||
        (s.purpose || '').toLowerCase().includes(search.toLowerCase())
    );

    const isAdmin = user?.role === 'admin';
    const fmtDate = (dt) => dt ? new Date(dt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-';

    return (
        <DashboardLayout activePage="schedules">
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
                            <Calendar className="text-amber-400 w-7 h-7" />
                            Jadwal Peminjaman
                        </h1>
                        <p className="text-slate-400 text-sm mt-1">Pengajuan dan manajemen jadwal peminjaman alat/ruangan</p>
                    </div>
                    <button onClick={openCreate} className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-amber-500/20 active:scale-[0.98] shrink-0">
                        <Plus className="w-5 h-5" />
                        Buat Jadwal
                    </button>
                </div>

                <div className="relative max-w-sm">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                    <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari anggota, alat, keperluan..." className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 transition-colors" />
                </div>

                <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-slate-800 bg-slate-900/80">
                                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Anggota</th>
                                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">Alat / Ruangan</th>
                                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider hidden lg:table-cell">Mulai</th>
                                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider hidden lg:table-cell">Selesai</th>
                                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                                    <th className="px-5 py-3.5 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/60">
                                {loading ? (
                                    <tr><td colSpan={6} className="text-center text-slate-500 py-16"><svg className="animate-spin h-6 w-6 text-amber-500 mx-auto" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg></td></tr>
                                ) : filtered.length === 0 ? (
                                    <tr><td colSpan={6} className="text-center text-slate-500 py-16 text-sm">Tidak ada jadwal{search ? ` untuk "${search}"` : ''}.</td></tr>
                                ) : filtered.map(s => (
                                    <tr key={s.id} className="hover:bg-slate-800/30 transition-colors">
                                        <td className="px-5 py-4">
                                            <p className="font-semibold text-white">{s.member?.user?.name || '-'}</p>
                                            <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{s.purpose}</p>
                                        </td>
                                        <td className="px-5 py-4 hidden md:table-cell">
                                            {s.equipment && <div className="text-slate-300 text-xs"><span className="text-slate-500">Alat: </span>{s.equipment.name}</div>}
                                            {s.room && <div className="text-slate-300 text-xs mt-0.5"><span className="text-slate-500">Ruang: </span>{s.room.name}</div>}
                                        </td>
                                        <td className="px-5 py-4 text-xs text-slate-400 hidden lg:table-cell">{fmtDate(s.start_time)}</td>
                                        <td className="px-5 py-4 text-xs text-slate-400 hidden lg:table-cell">{fmtDate(s.end_time)}</td>
                                        <td className="px-5 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${STATUS_COLORS[s.status] || ''}`}>
                                                {s.status}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {(isAdmin || s.status === 'pending') && (
                                                    <button onClick={() => openEdit(s)} className="p-2 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/5 transition-colors"><Pencil className="w-4 h-4" /></button>
                                                )}
                                                {isAdmin && (
                                                    <button onClick={() => setDeleteConfirm(s)} className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/5 transition-colors"><Trash2 className="w-4 h-4" /></button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {!loading && (
                        <div className="px-5 py-3 border-t border-slate-800/60 bg-slate-900/30 text-xs text-slate-500">
                            Menampilkan {filtered.length} dari {schedules.length} jadwal
                        </div>
                    )}
                </div>
            </div>

            {/* Modal */}
            {modalOpen && (
                <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center px-4 py-6 bg-black/60 backdrop-blur-sm overflow-y-auto">
                    <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
                            <h2 className="font-bold text-white text-lg">{editing ? 'Edit Jadwal' : 'Buat Jadwal Baru'}</h2>
                            <button onClick={() => setModalOpen(false)} className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-slate-800 transition-colors"><X className="w-5 h-5" /></button>
                        </div>
                        <form onSubmit={handleSave} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Peralatan (Opsional)</label>
                                <select value={form.equipment_id} onChange={(e) => setForm(f => ({ ...f, equipment_id: e.target.value }))} className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-amber-500 transition-colors">
                                    <option value="">-- Tidak ada alat --</option>
                                    {equipments.map(eq => (
                                        <option key={eq.id} value={eq.id}>{eq.name} ({eq.code})</option>
                                    ))}
                                </select>
                                {formErrors.equipment_id && <p className="text-red-400 text-xs mt-1">{formErrors.equipment_id[0]}</p>}
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Ruangan (Opsional)</label>
                                <select value={form.room_id} onChange={(e) => setForm(f => ({ ...f, room_id: e.target.value }))} className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-amber-500 transition-colors">
                                    <option value="">-- Tidak ada ruangan --</option>
                                    {rooms.map(r => (
                                        <option key={r.id} value={r.id}>{r.name}</option>
                                    ))}
                                </select>
                            </div>
                            <p className="text-xs text-amber-400/70">* Pilih minimal satu alat atau satu ruangan.</p>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Waktu Mulai</label>
                                    <input type="datetime-local" value={form.start_time} onChange={(e) => setForm(f => ({ ...f, start_time: e.target.value }))} required className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-amber-500 transition-colors" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Waktu Selesai</label>
                                    <input type="datetime-local" value={form.end_time} onChange={(e) => setForm(f => ({ ...f, end_time: e.target.value }))} required className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-amber-500 transition-colors" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Keperluan / Tujuan</label>
                                <textarea rows={3} value={form.purpose} onChange={(e) => setForm(f => ({ ...f, purpose: e.target.value }))} placeholder="Produksi konten video, podcast, dll..." required className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-2.5 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-amber-500 transition-colors resize-none" />
                            </div>
                            {isAdmin && editing && (
                                <div>
                                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Status Persetujuan</label>
                                    <select value={form.status} onChange={(e) => setForm(f => ({ ...f, status: e.target.value }))} className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-amber-500 transition-colors">
                                        <option value="pending">Pending</option>
                                        <option value="approved">Approved</option>
                                        <option value="rejected">Rejected</option>
                                        <option value="completed">Completed</option>
                                    </select>
                                </div>
                            )}
                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setModalOpen(false)} className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium transition-all">Batal</button>
                                <button type="submit" disabled={saving} className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 text-sm font-semibold transition-all">
                                    {saving ? 'Menyimpan...' : 'Simpan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {deleteConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm">
                    <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 space-y-5">
                        <div className="w-12 h-12 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl flex items-center justify-center mx-auto"><Trash2 className="w-6 h-6" /></div>
                        <div className="text-center">
                            <h3 className="text-lg font-bold text-white">Hapus Jadwal?</h3>
                            <p className="text-sm text-slate-400 mt-1">Jadwal milik <span className="text-white font-semibold">{deleteConfirm.member?.user?.name}</span> akan dihapus permanen.</p>
                        </div>
                        <div className="flex gap-3">
                            <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium transition-all">Batal</button>
                            <button onClick={() => handleDelete(deleteConfirm.id)} disabled={deleting} className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white text-sm font-medium transition-all">{deleting ? 'Menghapus...' : 'Hapus'}</button>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
