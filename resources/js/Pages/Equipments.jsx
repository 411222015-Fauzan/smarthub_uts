import React, { useState, useEffect } from 'react';
import DashboardLayout from '../Layouts/DashboardLayout';
import { router } from '@inertiajs/react';
import { HardDrive, Plus, Pencil, Trash2, X, Search, Check } from 'lucide-react';

const STATUS_COLORS = {
    available: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    borrowed:  'bg-amber-500/10 text-amber-400 border-amber-500/20',
    unavailable: 'bg-red-500/10 text-red-400 border-red-500/20',
};

const CONDITION_COLORS = {
    good: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    damaged: 'bg-red-500/10 text-red-400 border-red-500/20',
    maintenance: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
};

const emptyForm = { name: '', code: '', category: '', condition: 'good', status: 'available', stock: 1, description: '' };

export default function Equipments() {
    const [equipments, setEquipments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [token, setToken] = useState(null);
    const [user, setUser] = useState(null);
    const [search, setSearch] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState(null); // null = create, id = edit
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
        fetchEquipments(t);
    }, []);

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const fetchEquipments = async (authToken) => {
        try {
            setLoading(true);
            const res = await fetch('/api/equipments', {
                headers: { 'Authorization': `Bearer ${authToken}`, 'Accept': 'application/json' }
            });
            const data = await res.json();
            setEquipments(data.data || []);
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

    const openEdit = (eq) => {
        setEditing(eq.id);
        setForm({ name: eq.name, code: eq.code, category: eq.category, condition: eq.condition, status: eq.status, stock: eq.stock, description: eq.description || '' });
        setFormErrors({});
        setModalOpen(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        setFormErrors({});
        try {
            const url = editing ? `/api/equipments/${editing}` : '/api/equipments';
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
            await fetchEquipments(token);
            showToast(editing ? 'Data peralatan berhasil diperbarui.' : 'Data peralatan berhasil ditambahkan.');
        } catch (err) {
            showToast('Terjadi kesalahan jaringan.', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        setDeleting(true);
        try {
            const res = await fetch(`/api/equipments/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
            });
            const data = await res.json();
            if (!res.ok) { showToast(data.message || 'Gagal menghapus.', 'error'); return; }
            setDeleteConfirm(null);
            await fetchEquipments(token);
            showToast('Data peralatan berhasil dihapus.');
        } catch (err) {
            showToast('Terjadi kesalahan jaringan.', 'error');
        } finally {
            setDeleting(false);
        }
    };

    const filtered = equipments.filter(e =>
        e.name.toLowerCase().includes(search.toLowerCase()) ||
        e.code.toLowerCase().includes(search.toLowerCase()) ||
        e.category.toLowerCase().includes(search.toLowerCase())
    );

    const isAdmin = user?.role === 'admin';

    return (
        <DashboardLayout activePage="equipments">
            {/* Toast */}
            {toast && (
                <div className={`fixed top-6 right-6 z-[60] px-5 py-3.5 rounded-xl shadow-xl text-sm font-medium flex items-center gap-3 transition-all ${
                    toast.type === 'error' ? 'bg-red-600 text-white' : 'bg-emerald-600 text-white'
                }`}>
                    {toast.type === 'error' ? <X className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                    {toast.message}
                </div>
            )}

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-extrabold tracking-tight text-white flex items-center gap-2">
                            <HardDrive className="text-indigo-400 w-7 h-7" />
                            Inventaris Peralatan
                        </h1>
                        <p className="text-slate-400 text-sm mt-1">Kelola seluruh data master peralatan SmartHub</p>
                    </div>
                    {isAdmin && (
                        <button onClick={openCreate} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-indigo-600/20 active:scale-[0.98] shrink-0">
                            <Plus className="w-5 h-5" />
                            Tambah Peralatan
                        </button>
                    )}
                </div>

                {/* Search */}
                <div className="relative max-w-sm">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Cari nama, kode, kategori..."
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                </div>

                {/* Table */}
                <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-slate-800 bg-slate-900/80">
                                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Kode</th>
                                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Nama</th>
                                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">Kategori</th>
                                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider hidden sm:table-cell">Kondisi</th>
                                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider hidden lg:table-cell">Stok</th>
                                    {isAdmin && <th className="px-5 py-3.5 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Aksi</th>}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/60">
                                {loading ? (
                                    <tr><td colSpan={isAdmin ? 7 : 6} className="text-center text-slate-500 py-16">
                                        <svg className="animate-spin h-6 w-6 text-indigo-500 mx-auto" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                    </td></tr>
                                ) : filtered.length === 0 ? (
                                    <tr><td colSpan={isAdmin ? 7 : 6} className="text-center text-slate-500 py-16 text-sm">Tidak ada data peralatan{search ? ` untuk "${search}"` : ''}.</td></tr>
                                ) : filtered.map(eq => (
                                    <tr key={eq.id} className="hover:bg-slate-800/30 transition-colors">
                                        <td className="px-5 py-4 font-mono text-slate-300 text-xs">{eq.code}</td>
                                        <td className="px-5 py-4 font-medium text-white">{eq.name}</td>
                                        <td className="px-5 py-4 text-slate-400 hidden md:table-cell">{eq.category}</td>
                                        <td className="px-5 py-4 hidden sm:table-cell">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${CONDITION_COLORS[eq.condition] || 'bg-slate-800 text-slate-400 border-slate-700'}`}>
                                                {eq.condition}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${STATUS_COLORS[eq.status] || 'bg-slate-800 text-slate-400 border-slate-700'}`}>
                                                {eq.status}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 text-slate-400 hidden lg:table-cell">{eq.stock}</td>
                                        {isAdmin && (
                                            <td className="px-5 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button onClick={() => openEdit(eq)} className="p-2 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/5 transition-colors">
                                                        <Pencil className="w-4 h-4" />
                                                    </button>
                                                    <button onClick={() => setDeleteConfirm(eq)} className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/5 transition-colors">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {!loading && (
                        <div className="px-5 py-3 border-t border-slate-800/60 bg-slate-900/30 text-xs text-slate-500">
                            Menampilkan {filtered.length} dari {equipments.length} peralatan
                        </div>
                    )}
                </div>
            </div>

            {/* Create/Edit Modal */}
            {modalOpen && (
                <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center px-4 py-6 sm:py-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
                    <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
                            <h2 className="font-bold text-white text-lg">{editing ? 'Edit Peralatan' : 'Tambah Peralatan Baru'}</h2>
                            <button onClick={() => setModalOpen(false)} className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-slate-800 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSave} className="p-6 space-y-4">
                            {[
                                { label: 'Nama Peralatan', key: 'name', type: 'text', placeholder: 'Kamera Sony A6400' },
                                { label: 'Kode', key: 'code', type: 'text', placeholder: 'CAM-001' },
                                { label: 'Kategori', key: 'category', type: 'text', placeholder: 'Kamera, Audio, ...' },
                                { label: 'Stok', key: 'stock', type: 'number', placeholder: '1' },
                            ].map(({ label, key, type, placeholder }) => (
                                <div key={key}>
                                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">{label}</label>
                                    <input
                                        type={type}
                                        value={form[key]}
                                        onChange={(e) => setForm(f => ({ ...f, [key]: e.target.value }))}
                                        placeholder={placeholder}
                                        min={type === 'number' ? 0 : undefined}
                                        required
                                        className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-2.5 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                                    />
                                    {formErrors[key] && <p className="text-red-400 text-xs mt-1">{formErrors[key][0]}</p>}
                                </div>
                            ))}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Kondisi</label>
                                    <select value={form.condition} onChange={(e) => setForm(f => ({ ...f, condition: e.target.value }))} className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500 transition-colors">
                                        <option value="good">Good</option>
                                        <option value="damaged">Damaged</option>
                                        <option value="maintenance">Maintenance</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Status</label>
                                    <select value={form.status} onChange={(e) => setForm(f => ({ ...f, status: e.target.value }))} className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500 transition-colors">
                                        <option value="available">Available</option>
                                        <option value="borrowed">Borrowed</option>
                                        <option value="unavailable">Unavailable</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Deskripsi (Opsional)</label>
                                <textarea rows={3} value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Keterangan tambahan..." className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-2.5 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-indigo-500 transition-colors resize-none" />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setModalOpen(false)} className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium transition-all">Batal</button>
                                <button type="submit" disabled={saving} className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-medium transition-all flex items-center justify-center gap-2">
                                    {saving ? <><svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Menyimpan...</> : 'Simpan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirm */}
            {deleteConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm">
                    <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 space-y-5">
                        <div className="w-12 h-12 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl flex items-center justify-center mx-auto">
                            <Trash2 className="w-6 h-6" />
                        </div>
                        <div className="text-center">
                            <h3 className="text-lg font-bold text-white">Hapus Peralatan?</h3>
                            <p className="text-sm text-slate-400 mt-1">Anda akan menghapus <span className="text-white font-semibold">{deleteConfirm.name}</span>. Tindakan ini tidak dapat dibatalkan.</p>
                        </div>
                        <div className="flex gap-3">
                            <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium transition-all">Batal</button>
                            <button onClick={() => handleDelete(deleteConfirm.id)} disabled={deleting} className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white text-sm font-medium transition-all">
                                {deleting ? 'Menghapus...' : 'Hapus'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
