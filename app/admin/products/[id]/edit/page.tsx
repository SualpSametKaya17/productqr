'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface Language {
  id: string;
  code: string;
  name: string;
  nativeName: string;
  isDefault: boolean;
}

interface Translation {
  id: string;
  languageId: string;
  title: string;
  description: string;
  metaTitle: string | null;
  metaDescription: string | null;
  language: Language;
}

interface ProductImage {
  id: string;
  url: string;
  alt: string | null;
  isPrimary: boolean;
  order: number;
}

interface Product {
  id: string;
  slug: string;
  isActive: boolean;
  translations: Translation[];
  images: ProductImage[];
}

interface TranslationForm {
  languageId: string;
  title: string;
  description: string;
  metaTitle: string;
  metaDescription: string;
}

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const [product, setProduct] = useState<Product | null>(null);
  const [languages, setLanguages] = useState<Language[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('');
  const [slug, setSlug] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [translations, setTranslations] = useState<Record<string, TranslationForm>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Image upload state
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  useEffect(() => {
    Promise.all([
      fetch(`/api/admin/products/${id}`).then((r) => r.json()),
      fetch('/api/admin/languages').then((r) => r.json()),
    ]).then(([prod, langs]: [Product, Language[]]) => {
      setProduct(prod);
      setLanguages(langs);
      setSlug(prod.slug);
      setIsActive(prod.isActive);

      // Build translation forms, pre-filled with existing data
      const init: Record<string, TranslationForm> = {};
      langs.forEach((l) => {
        const existing = prod.translations.find((t) => t.languageId === l.id);
        init[l.id] = {
          languageId: l.id,
          title: existing?.title ?? '',
          description: existing?.description ?? '',
          metaTitle: existing?.metaTitle ?? '',
          metaDescription: existing?.metaDescription ?? '',
        };
      });
      setTranslations(init);

      const defaultLang = langs.find((l) => l.isDefault) ?? langs[0];
      if (defaultLang) setActiveTab(defaultLang.id);
    }).finally(() => setLoading(false));
  }, [id]);

  function handleTranslationChange(langId: string, field: keyof TranslationForm, value: string) {
    setTranslations((prev) => ({ ...prev, [langId]: { ...prev[langId], [field]: value } }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!slug) { setError('Slug is required'); return; }
    setSubmitting(true);
    setError('');
    setSuccess('');
    try {
      const translationList = Object.values(translations).filter((t) => t.title || t.description);
      const res = await fetch(`/api/admin/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, isActive, translations: translationList }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? 'Failed to update product');
        return;
      }
      setSuccess('Product updated successfully.');
      const updated = await res.json();
      setProduct(updated);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadError('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData });
      if (!uploadRes.ok) {
        const data = await uploadRes.json();
        setUploadError(data.error ?? 'Upload failed');
        return;
      }
      const { url } = await uploadRes.json();
      const hasImages = product?.images?.length ?? 0;
      const imgRes = await fetch(`/api/admin/products/${id}/images`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, isPrimary: hasImages === 0 }),
      });
      if (!imgRes.ok) {
        setUploadError('Failed to attach image to product');
        return;
      }
      // Refresh product
      const refreshed = await fetch(`/api/admin/products/${id}`).then((r) => r.json());
      setProduct(refreshed);
    } finally {
      setUploading(false);
      // reset input
      e.target.value = '';
    }
  }

  async function handleDeleteImage(imageId: string) {
    if (!confirm('Remove this image?')) return;
    await fetch(`/api/admin/images/${imageId}`, { method: 'DELETE' });
    const refreshed = await fetch(`/api/admin/products/${id}`).then((r) => r.json());
    setProduct(refreshed);
  }

  if (loading) {
    return <div className="py-12 text-center text-sm text-gray-400">Loading...</div>;
  }

  if (!product) {
    return <div className="py-12 text-center text-sm text-red-500">Product not found.</div>;
  }

  const currentTranslation = activeTab ? translations[activeTab] : null;
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => router.push('/admin/products')}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          ← Back
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Edit Product</h1>
          <p className="text-sm text-gray-500 mt-0.5 font-mono">{product.slug}</p>
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2 mb-4">{error}</p>
      )}
      {success && (
        <p className="text-sm text-green-600 bg-green-50 border border-green-200 rounded px-3 py-2 mb-4">{success}</p>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Product settings */}
        <div className="bg-white border border-gray-200 rounded-lg p-5">
          <h2 className="text-sm font-semibold text-gray-800 mb-4">Product Settings</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-gray-700 mb-1">Slug</label>
              <input
                type="text"
                required
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isActive"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded"
              />
              <label htmlFor="isActive" className="text-sm text-gray-700">Active (visible to users)</label>
            </div>
          </div>
        </div>

        {/* Translations */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="px-5 pt-5 pb-0">
            <h2 className="text-sm font-semibold text-gray-800 mb-3">Translations</h2>
          </div>

          {languages.length === 0 ? (
            <div className="px-5 pb-5 text-sm text-gray-400">No languages configured.</div>
          ) : (
            <>
              <div className="flex border-b border-gray-200 px-5 gap-1">
                {languages.map((lang) => (
                  <button
                    key={lang.id}
                    type="button"
                    onClick={() => setActiveTab(lang.id)}
                    className={`px-3 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
                      activeTab === lang.id
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {lang.code.toUpperCase()}
                    {lang.isDefault && <span className="ml-1 text-xs text-gray-400">(default)</span>}
                  </button>
                ))}
              </div>

              {currentTranslation && (
                <div className="p-5 space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Title</label>
                    <input
                      type="text"
                      value={currentTranslation.title}
                      onChange={(e) => handleTranslationChange(activeTab, 'title', e.target.value)}
                      placeholder="Product title"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      rows={4}
                      value={currentTranslation.description}
                      onChange={(e) => handleTranslationChange(activeTab, 'description', e.target.value)}
                      placeholder="Product description"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-gray-100">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Meta Title <span className="text-gray-400">(SEO)</span></label>
                      <input
                        type="text"
                        value={currentTranslation.metaTitle}
                        onChange={(e) => handleTranslationChange(activeTab, 'metaTitle', e.target.value)}
                        placeholder="SEO title"
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Meta Description <span className="text-gray-400">(SEO)</span></label>
                      <input
                        type="text"
                        value={currentTranslation.metaDescription}
                        onChange={(e) => handleTranslationChange(activeTab, 'metaDescription', e.target.value)}
                        placeholder="SEO description"
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Submit */}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="px-5 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {submitting ? 'Saving...' : 'Save Changes'}
          </button>
          <button
            type="button"
            onClick={() => router.push('/admin/products')}
            className="px-5 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>

      {/* Images section */}
      <div className="mt-6 bg-white border border-gray-200 rounded-lg p-5">
        <h2 className="text-sm font-semibold text-gray-800 mb-4">Images</h2>

        {uploadError && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2 mb-3">{uploadError}</p>
        )}

        {/* Existing images */}
        {product.images.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
            {product.images.map((img) => (
              <div key={img.id} className="relative group border border-gray-200 rounded-md overflow-hidden aspect-square bg-gray-50">
                <img
                  src={img.url}
                  alt={img.alt ?? ''}
                  className="w-full h-full object-cover"
                />
                {img.isPrimary && (
                  <span className="absolute top-1 left-1 text-xs bg-blue-600 text-white px-1.5 py-0.5 rounded">Primary</span>
                )}
                <button
                  type="button"
                  onClick={() => handleDeleteImage(img.id)}
                  className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                  title="Remove image"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400 mb-4">No images yet.</p>
        )}

        {/* Upload */}
        <label className={`inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-700 cursor-pointer hover:bg-gray-50 transition-colors ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          {uploading ? 'Uploading...' : 'Upload Image'}
          <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
        </label>
      </div>

      {/* QR Code section */}
      <div className="mt-6 bg-white border border-gray-200 rounded-lg p-5">
        <h2 className="text-sm font-semibold text-gray-800 mb-3">QR Code</h2>
        <p className="text-xs text-gray-500 mb-3">
          Points to: <span className="font-mono">{baseUrl}/p/{product.slug}</span>
        </p>
        <div className="flex items-start gap-4">
          <img
            src={`/api/qr/${product.slug}`}
            alt="QR Code"
            width={160}
            height={160}
            className="border border-gray-200 rounded-md"
          />
          <div className="flex flex-col gap-2 pt-1">
            <a
              href={`/api/qr/${product.slug}`}
              download={`qr-${product.slug}.png`}
              className="px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-50 transition-colors text-center"
            >
              Download PNG
            </a>
            <a
              href={`/api/qr/${product.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-50 transition-colors text-center"
            >
              Open in new tab
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
