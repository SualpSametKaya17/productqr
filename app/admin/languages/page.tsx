'use client';

import { useEffect, useState } from 'react';

interface Language {
  id: string; code: string; name: string;
  nativeName: string; isDefault: boolean; isActive: boolean;
}

const empty = { code: '', name: '', nativeName: '', isDefault: false };

const s = {
  card: { background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12 } as React.CSSProperties,
  th: { padding: '0.75rem 1rem', textAlign: 'left' as const, fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' as const, letterSpacing: '0.06em', borderBottom: '1px solid #e2e8f0', background: '#f8fafc' },
  td: { padding: '0.85rem 1rem', color: '#0f172a', fontSize: '0.9rem', borderBottom: '1px solid #f1f5f9' },
  input: { width: '100%', border: '1px solid #cbd5e1', borderRadius: 8, padding: '0.5rem 0.75rem', fontSize: '0.9rem', color: '#0f172a', background: '#fff', boxSizing: 'border-box' as const, outline: 'none' },
  btnPrimary: { padding: '0.5rem 1.1rem', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer' },
  btnGhost: { padding: '0.5rem 1.1rem', background: '#fff', color: '#374151', border: '1px solid #e2e8f0', borderRadius: 8, fontWeight: 500, fontSize: '0.875rem', cursor: 'pointer' },
  btnDanger: { padding: '0.35rem 0.75rem', background: '#fff', color: '#dc2626', border: '1px solid #fecaca', borderRadius: 6, fontSize: '0.8rem', cursor: 'pointer' },
  btnSm: { padding: '0.35rem 0.75rem', background: '#fff', color: '#374151', border: '1px solid #e2e8f0', borderRadius: 6, fontSize: '0.8rem', cursor: 'pointer' },
};

export default function LanguagesPage() {
  const [langs, setLangs]       = useState<Language[]>([]);
  const [loading, setLoading]   = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm]         = useState(empty);
  const [submitting, setSub]    = useState(false);
  const [error, setError]       = useState('');

  const load = async () => {
    setLoading(true);
    const r = await fetch('/api/admin/languages');
    if (r.ok) setLangs(await r.json());
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault(); setSub(true); setError('');
    const r = await fetch('/api/admin/languages', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    if (!r.ok) { const d = await r.json(); setError(d.error ?? 'Hata'); }
    else { setForm(empty); setShowForm(false); load(); }
    setSub(false);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`"${name}" dilini sil?`)) return;
    await fetch(`/api/admin/languages/${id}`, { method: 'DELETE' });
    load();
  };

  const handleToggle = async (lang: Language) => {
    await fetch(`/api/admin/languages/${lang.id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !lang.isActive }),
    });
    load();
  };

  return (
    <div style={{ maxWidth: 860, margin: '0 auto' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Diller</h1>
          <p style={{ color: '#64748b', fontSize: '0.875rem', marginTop: 4 }}>Desteklenen dilleri yönetin</p>
        </div>
        <button onClick={() => { setShowForm(v => !v); setError(''); }} style={s.btnPrimary}>
          {showForm ? 'İptal' : '+ Dil Ekle'}
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <div style={{ ...s.card, padding: '1.5rem', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginTop: 0, marginBottom: '1rem' }}>Yeni Dil</h2>
          {error && (
            <p style={{ color: '#dc2626', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '0.6rem 1rem', marginBottom: '1rem', fontSize: '0.875rem' }}>
              {error}
            </p>
          )}
          <form onSubmit={handleAdd}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#374151', marginBottom: 4 }}>Kod <span style={{ color: '#94a3b8' }}>(örn: tr)</span></label>
                <input style={s.input} required value={form.code} placeholder="tr"
                  onChange={e => setForm({ ...form, code: e.target.value.toLowerCase() })} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#374151', marginBottom: 4 }}>Ad <span style={{ color: '#94a3b8' }}>(örn: Turkish)</span></label>
                <input style={s.input} required value={form.name} placeholder="Turkish"
                  onChange={e => setForm({ ...form, name: e.target.value })} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#374151', marginBottom: 4 }}>Yerel Ad <span style={{ color: '#94a3b8' }}>(örn: Türkçe)</span></label>
                <input style={s.input} required value={form.nativeName} placeholder="Türkçe"
                  onChange={e => setForm({ ...form, nativeName: e.target.value })} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingTop: 22 }}>
                <input type="checkbox" id="isDefault" checked={form.isDefault}
                  onChange={e => setForm({ ...form, isDefault: e.target.checked })}
                  style={{ width: 16, height: 16 }} />
                <label htmlFor="isDefault" style={{ fontSize: '0.875rem', color: '#374151' }}>Varsayılan dil yap</label>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button type="submit" disabled={submitting} style={{ ...s.btnPrimary, opacity: submitting ? 0.6 : 1 }}>
                {submitting ? 'Ekleniyor...' : 'Dil Ekle'}
              </button>
              <button type="button" onClick={() => { setShowForm(false); setForm(empty); setError(''); }} style={s.btnGhost}>
                İptal
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Table */}
      <div style={{ ...s.card, overflow: 'hidden' }}>
        {loading ? (
          <p style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>Yükleniyor...</p>
        ) : langs.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>Henüz dil yok. Yukarıdan ekleyin.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {['Kod', 'Ad', 'Yerel Ad', 'Varsayılan', 'Durum', 'İşlemler'].map(h => (
                    <th key={h} style={s.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {langs.map(lang => (
                  <tr key={lang.id} style={{ background: '#fff' }}>
                    <td style={{ ...s.td, fontFamily: 'monospace', fontWeight: 600 }}>{lang.code}</td>
                    <td style={{ ...s.td }}>{lang.name}</td>
                    <td style={{ ...s.td, color: '#475569' }}>{lang.nativeName}</td>
                    <td style={s.td}>
                      {lang.isDefault
                        ? <span style={{ background: '#dbeafe', color: '#1d4ed8', fontSize: '0.75rem', fontWeight: 600, padding: '2px 10px', borderRadius: 9999 }}>Varsayılan</span>
                        : <span style={{ color: '#94a3b8' }}>—</span>}
                    </td>
                    <td style={s.td}>
                      <span style={{
                        background: lang.isActive ? '#dcfce7' : '#f1f5f9',
                        color: lang.isActive ? '#15803d' : '#64748b',
                        fontSize: '0.75rem', fontWeight: 600,
                        padding: '2px 10px', borderRadius: 9999,
                      }}>
                        {lang.isActive ? 'Aktif' : 'Pasif'}
                      </span>
                    </td>
                    <td style={{ ...s.td, textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                        <button onClick={() => handleToggle(lang)} style={s.btnSm}>
                          {lang.isActive ? 'Pasif Yap' : 'Aktif Yap'}
                        </button>
                        <button onClick={() => handleDelete(lang.id, lang.name)} style={s.btnDanger}>
                          Sil
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
