import React, { useState, useEffect } from 'react';
import DashboardLayout from '../Layouts/DashboardLayout';
import { router } from '@inertiajs/react';
import { DoorOpen, Plus, Pencil, Trash2, X, Search, Check } from 'lucide-react';

const STATUS_COLORS = {
    available:   'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    booked:      'bg-amber-500/10 text-amber-400 border-amber-500/20',
    maintenance: 'bg-red-500/10 text-red-400 border-red-500/20',
};

const emptyForm = { name: '', capacity: 1, status: 'available', description: '' };

export default function Rooms() {
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
        fetchRooms(t);
    }, []);

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const fetchRooms = async (authToken) => {
        try {
            setLoading(true);
            const res = await fetch('/api/rooms', {
                headers: { 'Authorization': `Bearer ${authToken}`, 'Accept': 'application/json' }
            });
            const data = await res.json();
            setRooms(data.data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const openCreate = () => {
        setEditing(null);
        setForm(emptyForm);
        setFormErrors({});
        setModalOpen(true);
    };

    const openEdit = (room) => {
        setEditing(room.id);
        setForm({ name: room.name, capacity: room.capacity, status: room.status, description: room.description || '' });
        setFormErrors({});
        setModalOpen(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        setFormErrors({});
        try {
            const url = editing ? `/api/rooms/${editing}` : '/api/rooms';
            const method = editing ? 'PUT' : 'POST';
            const res = await fetch(url, {
                method,
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(form)
            });
            const data = await res.json();
            if (!res.ok) {
                if (data.errors) setFormErrors(data.errors);
                else showToast(data.message || 'Gagal menyimpan data.', 'error');
                return;
            }
            setModalOpen(false);
            await fetchRooms(token);
            showToast(editing ? 'Data ruangan berhasil diperbarui.' : 'Data ruangan berhasil ditambahkan.');
        } catch (err) {
            showToast('Terjadi kesalahan jaringan.', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        setDeleting(true);
        try {
            const res = await fetch(`/api/rooms/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
            });
            const data = await res.json();
            if (!res.ok) { showToast(data.message || 'Gagal menghapus.', 'error'); return; }
            setDeleteConfirm(null);
            await fetchRooms(token);
            showToast('Data ruangan berhasil dihapus.');
        } catch (err) {
            showToast('Terjadi kesalahan jaringan.', 'error');
        } finally {
            setDeleting(false);
        }
    };

    const filtered = rooms.filter(r =>
        r.name.toLowerCase().includes(search.toLowerCase())
    );

    const isAdmin = user?.role === 'admin';

    return (
        <DashboardLayout activePage="rooms">
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
                            <DoorOpen className="text-violet-400 w-7 h-7" />
                            Data Ruangan
                        </h1>
                        <p className="text-slate-400 text-sm mt-1">Kelola seluruh data master ruangan SmartHub</p>
                    </div>
                    {isAdmin && (
                        <button onClick={openCreate} className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white font-medium px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-violet-600/20 active:scale-[0.98] shrink-0">
                            <Plus className="w-5 h-5" />
                            Tambah Ruangan
                        </button>
                    )}
                </div>

                <div className="relative max-w-sm">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                    <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari nama ruangan..." className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-violet-500 transition-colors" />
                </div>

                {/* Cards grid for rooms */}
                {loading ? (
                    <div className="flex items-center justify-center py-24">
                        <svg className="animate-spin h-8 w-8 text-violet-500" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="text-center text-slate-500 py-24 text-sm bg-slate-900/30 rounded-2xl border border-slate-800">
                        Tidak ada data ruangan{search ? ` untuk "${search}"` : ''}.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                        {filtered.map(room => (
                            <div key={room.id} className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl hover:border-slate-700 transition-all flex flex-col gap-4">
                                <div className="flex items-start justify-between">
                                    <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
                                        <DoorOpen className="w-5 h-5" />
                                    </div>
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${STATUS_COLORS[room.status] || 'bg-slate-800 text-slate-400 border-slate-700'}`}>
                                        {room.status}
                                    </span>
                                </div>
                                <div>
                                    <h3 className="font-bold text-white text-base">{room.name}</h3>
                                    <p className="text-xs text-slate-500 mt-0.5">Kapasitas: <span className="text-slate-300 font-semibold">{room.capacity} orang</span></p>
                                    {room.description && <p className="text-xs text-slate-500 mt-2 line-clamp-2">{room.description}</p>}
                                </div>
                                {isAdmin && (
                                    <div className="flex gap-2 mt-auto pt-3 border-t border-slate-800/60">
                                        <button onClick={() => openEdit(room)} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/5 transition-colors border border-slate-800 hover:border-indigo-500/20">
                                            <Pencil className="w-3.5 h-3.5" /> Edit
                                        </button>
                                        <button onClick={() => setDeleteConfirm(room)} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/5 transition-colors border border-slate-800 hover:border-red-500/20">
                                            <Trash2 className="w-3.5 h-3.5" /> Hapus
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal */}
            {modalOpen && (
                <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center px-4 py-6 bg-black/60 backdrop-blur-sm overflow-y-auto">
                    <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
                            <h2 className="font-bold text-white text-lg">{editing ? 'Edit Ruangan' : 'Tambah Ruangan Baru'}</h2>
                            <button onClick={() => setModalOpen(false)} className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-slate-800 transition-colors"><X className="w-5 h-5" /></button>
                        </div>
                        <form onSubmit={handleSave} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Nama Ruangan</label>
                                <input type="text" value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Studio Podcast" required className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-2.5 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-violet-500 transition-colors" />
                                {formErrors.name && <p className="text-red-400 text-xs mt-1">{formErrors.name[0]}</p>}
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Kapasitas (orang)</label>
                                <input type="number" min="1" value={form.capacity} onChange={(e) => setForm(f => ({ ...f, capacity: e.target.value }))} required className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-violet-500 transition-colors" />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Status</label>
                                <select value={form.status} onChange={(e) => setForm(f => ({ ...f, status: e.target.value }))} className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-violet-500 transition-colors">
                                    <option value="available">Available</option>
                                    <option value="booked">Booked</option>
                                    <option value="maintenance">Maintenance</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Deskripsi (Opsional)</label>
                                <textarea rows={3} value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Keterangan ruangan..." className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-2.5 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-violet-500 transition-colors resize-none" />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setModalOpen(false)} className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium transition-all">Batal</button>
                                <button type="submit" disabled={saving} className="flex-1 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white text-sm font-medium transition-all">
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
                            <h3 className="text-lg font-bold text-white">Hapus Ruangan?</h3>
                            <p className="text-sm text-slate-400 mt-1">Anda akan menghapus <span className="text-white font-semibold">{deleteConfirm.name}</span>.</p>
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
