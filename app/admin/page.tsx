import Link from 'next/link';

async function getStats() {
  try {
    const base = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000';
    const [productsRes, languagesRes] = await Promise.all([
      fetch(`${base}/api/admin/products`, { cache: 'no-store' }),
      fetch(`${base}/api/admin/languages`, { cache: 'no-store' }),
    ]);
    const products = productsRes.ok ? await productsRes.json() : [];
    const languages = languagesRes.ok ? await languagesRes.json() : [];
    return {
      totalProducts: Array.isArray(products) ? products.length : 0,
      totalLanguages: Array.isArray(languages) ? languages.length : 0,
    };
  } catch {
    return { totalProducts: 0, totalLanguages: 0 };
  }
}

export default async function AdminDashboard() {
  const stats = await getStats();

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">ProductQR Admin</h1>
        <p className="mt-1 text-sm text-gray-500">Manage your multilingual product QR pages</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Total Products</p>
          <p className="mt-2 text-4xl font-bold text-gray-900">{stats.totalProducts}</p>
          <p className="mt-1 text-xs text-gray-400">Active product pages</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Total Languages</p>
          <p className="mt-2 text-4xl font-bold text-gray-900">{stats.totalLanguages}</p>
          <p className="mt-1 text-xs text-gray-400">Configured languages</p>
        </div>
      </div>

      {/* Quick links */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-base font-semibold text-gray-800 mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/admin/products/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
          >
            + Add Product
          </Link>
          <Link
            href="/admin/products"
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-50 transition-colors"
          >
            Manage Products
          </Link>
          <Link
            href="/admin/languages"
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-50 transition-colors"
          >
            Manage Languages
          </Link>
        </div>
      </div>
    </div>
  );
}
