'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Translation {
  id: string;
  languageId: string;
  title: string;
  language: { code: string; name: string };
}

interface Product {
  id: string;
  slug: string;
  isActive: boolean;
  translations: Translation[];
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchProducts() {
    try {
      const res = await fetch('/api/admin/products');
      if (res.ok) setProducts(await res.json());
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchProducts(); }, []);

  async function handleDelete(id: string, slug: string) {
    if (!confirm(`Delete product "${slug}"? This cannot be undone.`)) return;
    await fetch(`/api/admin/products/${id}`, { method: 'DELETE' });
    fetchProducts();
  }

  async function handleToggleActive(product: Product) {
    await fetch(`/api/admin/products/${product.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !product.isActive }),
    });
    fetchProducts();
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage your product QR pages</p>
        </div>
        <Link
          href="/admin/products/new"
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
        >
          + Add Product
        </Link>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        {loading ? (
          <div className="py-12 text-center text-sm text-gray-400">Loading products...</div>
        ) : products.length === 0 ? (
          <div className="py-12 text-center text-sm text-gray-400">
            No products yet.{' '}
            <Link href="/admin/products/new" className="text-blue-600 hover:underline">Create one</Link>.
          </div>
        ) : (
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Slug</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Translations</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Status</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <span className="font-mono text-gray-800">{product.slug}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {product.translations.length === 0 ? (
                        <span className="text-gray-400 text-xs">No translations</span>
                      ) : (
                        product.translations.map((t) => (
                          <span
                            key={t.id}
                            className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-mono bg-gray-100 text-gray-600"
                            title={t.title}
                          >
                            {t.language.code}
                          </span>
                        ))
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${product.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'}`}>
                      {product.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {/* QR code link */}
                      <a
                        href={`/api/qr/${product.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1 text-xs font-medium border border-gray-300 rounded text-gray-600 hover:bg-gray-50 transition-colors"
                        title="View QR Code"
                      >
                        QR
                      </a>
                      <Link
                        href={`/admin/products/${product.id}/edit`}
                        className="px-3 py-1 text-xs font-medium border border-gray-300 rounded text-gray-600 hover:bg-gray-50 transition-colors"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleToggleActive(product)}
                        className="px-3 py-1 text-xs font-medium border border-gray-300 rounded text-gray-600 hover:bg-gray-50 transition-colors"
                      >
                        {product.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        onClick={() => handleDelete(product.id, product.slug)}
                        className="px-3 py-1 text-xs font-medium border border-red-200 rounded text-red-600 hover:bg-red-50 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
