'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Language {
  id: string;
  code: string;
  name: string;
  nativeName: string;
  isDefault: boolean;
}

interface TranslationForm {
  languageId: string;
  title: string;
  description: string;
  metaTitle: string;
  metaDescription: string;
}

function slugify(str: string) {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export default function NewProductPage() {
  const router = useRouter();
  const [languages, setLanguages] = useState<Language[]>([]);
  const [loadingLangs, setLoadingLangs] = useState(true);
  const [activeTab, setActiveTab] = useState('');
  const [slug, setSlug] = useState('');
  const [slugManual, setSlugManual] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [translations, setTranslations] = useState<Record<string, TranslationForm>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/admin/languages')
      .then((r) => r.json())
      .then((langs: Language[]) => {
        setLanguages(langs);
        const defaultLang = langs.find((l) => l.isDefault) ?? langs[0];
        if (defaultLang) setActiveTab(defaultLang.id);
        const init: Record<string, TranslationForm> = {};
        langs.forEach((l) => {
          init[l.id] = { languageId: l.id, title: '', description: '', metaTitle: '', metaDescription: '' };
        });
        setTranslations(init);
      })
      .finally(() => setLoadingLangs(false));
  }, []);

  function handleTranslationChange(langId: string, field: keyof TranslationForm, value: string) {
    setTranslations((prev) => ({ ...prev, [langId]: { ...prev[langId], [field]: value } }));

    // Auto-generate slug from title of the first (default) language
    if (field === 'title' && !slugManual) {
      const defaultLang = languages.find((l) => l.isDefault) ?? languages[0];
      if (defaultLang && langId === defaultLang.id) {
        setSlug(slugify(value));
      }
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!slug) { setError('Slug is required'); return; }
    setSubmitting(true);
    setError('');
    try {
      const translationList = Object.values(translations).filter((t) => t.title || t.description);
      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, isActive, translations: translationList }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? 'Failed to create product');
        return;
      }
      router.push('/admin/products');
    } finally {
      setSubmitting(false);
    }
  }

  if (loadingLangs) {
    return <div className="py-12 text-center text-sm text-gray-400">Loading...</div>;
  }

  const currentTranslation = activeTab ? translations[activeTab] : null;

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
          <h1 className="text-2xl font-bold text-gray-900">New Product</h1>
          <p className="text-sm text-gray-500 mt-0.5">Create a new QR landing page</p>
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2 mb-4">{error}</p>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Product settings */}
        <div className="bg-white border border-gray-200 rounded-lg p-5">
          <h2 className="text-sm font-semibold text-gray-800 mb-4">Product Settings</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Slug <span className="text-gray-400">(URL identifier)</span>
              </label>
              <input
                type="text"
                required
                value={slug}
                onChange={(e) => { setSlug(e.target.value); setSlugManual(true); }}
                placeholder="my-product"
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-400 mt-1">Auto-generated from title. Edit to override.</p>
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
            <div className="px-5 pb-5 text-sm text-gray-400">
              No languages configured. <a href="/admin/languages" className="text-blue-600 hover:underline">Add languages first</a>.
            </div>
          ) : (
            <>
              {/* Language tabs */}
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

              {/* Active tab content */}
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
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Meta Title <span className="text-gray-400">(SEO)</span>
                      </label>
                      <input
                        type="text"
                        value={currentTranslation.metaTitle}
                        onChange={(e) => handleTranslationChange(activeTab, 'metaTitle', e.target.value)}
                        placeholder="SEO title"
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Meta Description <span className="text-gray-400">(SEO)</span>
                      </label>
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
            {submitting ? 'Creating...' : 'Create Product'}
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
    </div>
  );
}
