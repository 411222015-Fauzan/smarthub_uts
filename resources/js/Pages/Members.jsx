import React, { useState, useEffect } from 'react';
import DashboardLayout from '../Layouts/DashboardLayout';
import { router } from '@inertiajs/react';
import { Users, Plus, Pencil, Trash2, X, Search, Check, UserCircle } from 'lucide-react';

const STATUS_COLORS = {
    active:   'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    inactive: 'bg-slate-700/50 text-slate-400 border-slate-600/50',
};

const emptyForm = { name: '', email: '', password: '', phone: '', address: '', status: 'active' };

export default function Members() {
    const [members, setMembers] = useState([]);
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
        fetchMembers(t);
    }, []);

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const fetchMembers = async (authToken) => {
        try {
            setLoading(true);
            const res = await fetch('/api/members', {
                headers: { 'Authorization': `Bearer ${authToken}`, 'Accept': 'application/json' }
            });
            const data = await res.json();
            setMembers(data.data || []);
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

    const openEdit = (member) => {
        setEditing(member.id);
        setForm({
            name: member.user?.name || '',
            email: member.user?.email || '',
            password: '',
            phone: member.phone || '',
            address: member.address || '',
            status: member.status,
        });
        setFormErrors({});
        setModalOpen(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        setFormErrors({});
        try {
            const url = editing ? `/api/members/${editing}` : '/api/members';
            const method = editing ? 'PUT' : 'POST';
            const payload = { ...form };
            if (editing && !payload.password) delete payload.password;

            const res = await fetch(url, {
                method,
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            if (!res.ok) {
                if (data.errors) setFormErrors(data.errors);
                else showToast(data.message || 'Gagal menyimpan data.', 'error');
                return;
            }
            setModalOpen(false);
            await fetchMembers(token);
            showToast(editing ? 'Data anggota berhasil diperbarui.' : 'Data anggota berhasil ditambahkan.');
        } catch (err) {
            showToast('Terjadi kesalahan jaringan.', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        setDeleting(true);
        try {
            const res = await fetch(`/api/members/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
            });
            const data = await res.json();
            if (!res.ok) { showToast(data.message || 'Gagal menghapus.', 'error'); return; }
            setDeleteConfirm(null);
            await fetchMembers(token);
            showToast('Data anggota berhasil dihapus.');
        } catch (err) {
            showToast('Terjadi kesalahan jaringan.', 'error');
        } finally {
            setDeleting(false);
        }
    };

    const filtered = members.filter(m =>
        (m.user?.name || '').toLowerCase().includes(search.toLowerCase()) ||
        (m.user?.email || '').toLowerCase().includes(search.toLowerCase()) ||
        (m.phone || '').includes(search)
    );

    const isAdmin = user?.role === 'admin';

    return (
        <DashboardLayout activePage="members">
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
                            <Users className="text-emerald-400 w-7 h-7" />
                            Data Anggota (Members)
                        </h1>
                        <p className="text-slate-400 text-sm mt-1">Kelola seluruh data anggota SmartHub</p>
                    </div>
                    {isAdmin && (
                        <button onClick={openCreate} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-emerald-600/20 active:scale-[0.98] shrink-0">
                            <Plus className="w-5 h-5" />
                            Tambah Anggota
                        </button>
                    )}
                </div>

                <div className="relative max-w-sm">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                    <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari nama, email, telepon..." className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition-colors" />
                </div>

                <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-slate-800 bg-slate-900/80">
                                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Anggota</th>
                                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">Telepon</th>
                                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider hidden lg:table-cell">Alamat</th>
                                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                                    {isAdmin && <th className="px-5 py-3.5 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Aksi</th>}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/60">
                                {loading ? (
                                    <tr><td colSpan={isAdmin ? 5 : 4} className="text-center text-slate-500 py-16">
                                        <svg className="animate-spin h-6 w-6 text-emerald-500 mx-auto" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                                    </td></tr>
                                ) : filtered.length === 0 ? (
                                    <tr><td colSpan={isAdmin ? 5 : 4} className="text-center text-slate-500 py-16 text-sm">Tidak ada data anggota{search ? ` untuk "${search}"` : ''}.</td></tr>
                                ) : filtered.map(m => (
                                    <tr key={m.id} className="hover:bg-slate-800/30 transition-colors">
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700 text-emerald-400 font-bold text-sm shrink-0">
                                                    {(m.user?.name || '?').substring(0, 2).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-white">{m.user?.name}</p>
                                                    <p className="text-xs text-slate-500">{m.user?.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4 text-slate-400 hidden md:table-cell">{m.phone || '-'}</td>
                                        <td className="px-5 py-4 text-slate-400 hidden lg:table-cell max-w-xs truncate">{m.address || '-'}</td>
                                        <td className="px-5 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${STATUS_COLORS[m.status] || 'bg-slate-800 text-slate-400 border-slate-700'}`}>
                                                {m.status}
                                            </span>
                                        </td>
                                        {isAdmin && (
                                            <td className="px-5 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button onClick={() => openEdit(m)} className="p-2 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/5 transition-colors"><Pencil className="w-4 h-4" /></button>
                                                    <button onClick={() => setDeleteConfirm(m)} className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/5 transition-colors"><Trash2 className="w-4 h-4" /></button>
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
                            Menampilkan {filtered.length} dari {members.length} anggota
                        </div>
                    )}
                </div>
            </div>

            {modalOpen && (
                <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center px-4 py-6 bg-black/60 backdrop-blur-sm overflow-y-auto">
                    <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
                            <h2 className="font-bold text-white text-lg">{editing ? 'Edit Anggota' : 'Tambah Anggota Baru'}</h2>
                            <button onClick={() => setModalOpen(false)} className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-slate-800 transition-colors"><X className="w-5 h-5" /></button>
                        </div>
                        <form onSubmit={handleSave} className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Nama Lengkap</label>
                                    <input type="text" value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Nama Anggota" required className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-2.5 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-emerald-500 transition-colors" />
                                    {formErrors.name && <p className="text-red-400 text-xs mt-1">{formErrors.name[0]}</p>}
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Email</label>
                                    <input type="email" value={form.email} onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))} placeholder="email@smarthub.local" required className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-2.5 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-emerald-500 transition-colors" />
                                    {formErrors.email && <p className="text-red-400 text-xs mt-1">{formErrors.email[0]}</p>}
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Password {editing && <span className="normal-case font-normal text-slate-500">(kosongkan jika tidak ingin ubah)</span>}</label>
                                    <input type="password" value={form.password} onChange={(e) => setForm(f => ({ ...f, password: e.target.value }))} placeholder={editing ? '••••••••' : 'Min. 6 karakter'} required={!editing} className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-2.5 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-emerald-500 transition-colors" />
                                    {formErrors.password && <p className="text-red-400 text-xs mt-1">{formErrors.password[0]}</p>}
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">No. Telepon</label>
                                    <input type="text" value={form.phone} onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="08xxxxxxxxx" className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-2.5 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-emerald-500 transition-colors" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Status</label>
                                    <select value={form.status} onChange={(e) => setForm(f => ({ ...f, status: e.target.value }))} className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500 transition-colors">
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                    </select>
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Alamat (Opsional)</label>
                                    <textarea rows={2} value={form.address} onChange={(e) => setForm(f => ({ ...f, address: e.target.value }))} placeholder="Alamat lengkap..." className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-2.5 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-emerald-500 transition-colors resize-none" />
                                </div>
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setModalOpen(false)} className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium transition-all">Batal</button>
                                <button type="submit" disabled={saving} className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-sm font-medium transition-all">
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
                            <h3 className="text-lg font-bold text-white">Hapus Anggota?</h3>
                            <p className="text-sm text-slate-400 mt-1">Anda akan menghapus <span className="text-white font-semibold">{deleteConfirm.user?.name}</span> beserta akun login-nya.</p>
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
