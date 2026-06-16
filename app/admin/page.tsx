import Link from 'next/link';

async function getStats() {
  try {
    const base = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000';
    const [pr, lr] = await Promise.all([
      fetch(`${base}/api/admin/products`, { cache: 'no-store' }),
      fetch(`${base}/api/admin/languages`, { cache: 'no-store' }),
    ]);
    const products  = pr.ok ? await pr.json() : [];
    const languages = lr.ok ? await lr.json() : [];
    return {
      totalProducts:  Array.isArray(products)  ? products.length  : 0,
      totalLanguages: Array.isArray(languages) ? languages.length : 0,
    };
  } catch {
    return { totalProducts: 0, totalLanguages: 0 };
  }
}

export default async function AdminDashboard() {
  const stats = await getStats();

  const card: React.CSSProperties = {
    background: '#fff',
    border: '1px solid #e2e8f0',
    borderRadius: 12,
    padding: '1.5rem',
  };

  const statNum: React.CSSProperties = {
    fontSize: '2.5rem',
    fontWeight: 800,
    color: '#0f172a',
    lineHeight: 1,
    margin: '0.5rem 0 0.25rem',
  };

  return (
    <div style={{ maxWidth: 860, margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
          ProductQR Admin
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: 4 }}>
          Çok dilli ürün QR sayfalarınızı yönetin
        </p>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={card}>
          <p style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0 }}>
            Toplam Ürün
          </p>
          <p style={statNum}>{stats.totalProducts}</p>
          <p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: 0 }}>Aktif ürün sayfaları</p>
        </div>
        <div style={card}>
          <p style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0 }}>
            Toplam Dil
          </p>
          <p style={statNum}>{stats.totalLanguages}</p>
          <p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: 0 }}>Tanımlı diller</p>
        </div>
      </div>

      {/* Quick links */}
      <div style={card}>
        <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginTop: 0, marginBottom: '1rem' }}>
          Hızlı Eylemler
        </h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
          <Link href="/admin/products/new" style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '0.55rem 1.1rem',
            background: '#2563eb', color: '#fff',
            fontWeight: 600, fontSize: '0.875rem',
            borderRadius: 8, textDecoration: 'none',
          }}>
            + Yeni Ürün
          </Link>
          <Link href="/admin/products" style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '0.55rem 1.1rem',
            background: '#fff', color: '#0f172a',
            fontWeight: 600, fontSize: '0.875rem',
            border: '1px solid #e2e8f0',
            borderRadius: 8, textDecoration: 'none',
          }}>
            📦 Ürünleri Yönet
          </Link>
          <Link href="/admin/languages" style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '0.55rem 1.1rem',
            background: '#fff', color: '#0f172a',
            fontWeight: 600, fontSize: '0.875rem',
            border: '1px solid #e2e8f0',
            borderRadius: 8, textDecoration: 'none',
          }}>
            🌐 Dilleri Yönet
          </Link>
        </div>
      </div>
    </div>
  );
}
