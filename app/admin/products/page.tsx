'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Translation { id: string; title: string; language: { code: string } }
interface Product    { id: string; slug: string; isActive: boolean; translations: Translation[] }

const s = {
  card:   { background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, overflow: 'hidden' } as React.CSSProperties,
  th:     { padding: '0.75rem 1rem', textAlign: 'left' as const, fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' as const, letterSpacing: '0.06em', borderBottom: '1px solid #e2e8f0', background: '#f8fafc' },
  td:     { padding: '0.85rem 1rem', color: '#0f172a', fontSize: '0.9rem', borderBottom: '1px solid #f1f5f9' },
  btnSm:  { padding: '0.35rem 0.75rem', background: '#fff', color: '#374151', border: '1px solid #e2e8f0', borderRadius: 6, fontSize: '0.8rem', cursor: 'pointer', textDecoration: 'none', display: 'inline-block' } as React.CSSProperties,
  btnRed: { padding: '0.35rem 0.75rem', background: '#fff', color: '#dc2626', border: '1px solid #fecaca', borderRadius: 6, fontSize: '0.8rem', cursor: 'pointer' } as React.CSSProperties,
};

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading]   = useState(true);

  const load = async () => {
    const r = await fetch('/api/admin/products');
    if (r.ok) setProducts(await r.json());
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const handleDelete = async (id: string, slug: string) => {
    if (!confirm(`"${slug}" ürününü sil?`)) return;
    await fetch(`/api/admin/products/${id}`, { method: 'DELETE' });
    load();
  };

  const handleToggle = async (p: Product) => {
    await fetch(`/api/admin/products/${p.id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !p.isActive }),
    });
    load();
  };

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Ürünler</h1>
          <p style={{ color: '#64748b', fontSize: '0.875rem', marginTop: 4 }}>Ürün QR sayfalarını yönetin</p>
        </div>
        <Link href="/admin/products/new" style={{
          padding: '0.55rem 1.1rem', background: '#2563eb', color: '#fff',
          fontWeight: 600, fontSize: '0.875rem', borderRadius: 8, textDecoration: 'none',
        }}>
          + Yeni Ürün
        </Link>
      </div>

      {/* Table */}
      <div style={s.card}>
        {loading ? (
          <p style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>Yükleniyor...</p>
        ) : products.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
            Henüz ürün yok. <Link href="/admin/products/new" style={{ color: '#2563eb' }}>Yeni ekle</Link>.
          </p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {['Slug', 'Çeviriler', 'Durum', 'Sayfa', 'İşlemler'].map(h => (
                    <th key={h} style={s.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {products.map(p => (
                  <tr key={p.id}>
                    <td style={{ ...s.td, fontFamily: 'monospace', fontWeight: 600 }}>{p.slug}</td>
                    <td style={s.td}>
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                        {p.translations.length === 0
                          ? <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>Yok</span>
                          : p.translations.map(t => (
                            <span key={t.id} title={t.title} style={{
                              background: '#f1f5f9', color: '#475569',
                              fontSize: '0.72rem', fontFamily: 'monospace', fontWeight: 600,
                              padding: '2px 8px', borderRadius: 4,
                            }}>
                              {t.language.code.toUpperCase()}
                            </span>
                          ))}
                      </div>
                    </td>
                    <td style={s.td}>
                      <span style={{
                        background: p.isActive ? '#dcfce7' : '#f1f5f9',
                        color: p.isActive ? '#15803d' : '#64748b',
                        fontSize: '0.75rem', fontWeight: 600,
                        padding: '2px 10px', borderRadius: 9999,
                      }}>
                        {p.isActive ? 'Aktif' : 'Pasif'}
                      </span>
                    </td>
                    <td style={s.td}>
                      <a href={`/p/${p.slug}`} target="_blank" rel="noopener noreferrer"
                        style={{ ...s.btnSm, fontSize: '0.78rem' }}>
                        🔗 Sayfayı Gör
                      </a>
                    </td>
                    <td style={{ ...s.td, textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                        <a href={`/api/qr/${p.slug}`} target="_blank" rel="noopener" style={s.btnSm}>QR</a>
                        <Link href={`/admin/products/${p.id}/edit`} style={s.btnSm}>Düzenle</Link>
                        <button onClick={() => handleToggle(p)} style={s.btnSm}>
                          {p.isActive ? 'Pasif' : 'Aktif'}
                        </button>
                        <button onClick={() => handleDelete(p.id, p.slug)} style={s.btnRed}>Sil</button>
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
