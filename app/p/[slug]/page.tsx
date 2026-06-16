import { notFound } from 'next/navigation';
import { headers } from 'next/headers';
import { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import LanguageSwitcher from './language-switcher';
import ImageGallery from './image-gallery';

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ lang?: string }>;
}

/** Parse the first language code from an Accept-Language header value.
 *  e.g. "tr-TR,tr;q=0.9,en;q=0.8" → "tr"
 */
function parseBrowserLang(acceptLanguage: string | null): string | null {
  if (!acceptLanguage) return null;
  const first = acceptLanguage.split(',')[0]?.trim();
  if (!first) return null;
  // Strip quality value and region tag: "tr-TR;q=0.9" → "tr"
  return first.split(';')[0].split('-')[0].toLowerCase();
}

async function getProduct(slug: string) {
  return prisma.product.findUnique({
    where: { slug },
    include: {
      translations: {
        include: { language: true },
      },
      images: {
        orderBy: [{ isPrimary: 'desc' }, { order: 'asc' }],
      },
    },
  });
}

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const { lang } = await searchParams;

  const product = await getProduct(slug);
  if (!product || !product.isActive) {
    return { title: 'Product Not Found' };
  }

  const defaultTranslation =
    product.translations.find((t) => t.language.isDefault) ?? product.translations[0];

  const activeLang = lang ?? defaultTranslation?.language.code ?? 'en';
  const translation =
    product.translations.find((t) => t.language.code === activeLang) ?? defaultTranslation;

  if (!translation) return { title: 'Product' };

  return {
    title: translation.metaTitle || translation.title,
    description: translation.metaDescription || translation.description || undefined,
  };
}

export default async function ProductPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { lang: langParam } = await searchParams;

  const product = await getProduct(slug);

  if (!product || !product.isActive) {
    notFound();
  }

  // Collect all active languages from the product's translations
  const availableLanguages = product.translations
    .filter((t) => t.language.isActive)
    .map((t) => t.language);

  const availableCodes = new Set(availableLanguages.map((l) => l.code));

  // Determine default language
  const defaultLang =
    availableLanguages.find((l) => l.isDefault) ?? availableLanguages[0];

  // Read Accept-Language header
  const headersList = await headers();
  const acceptLanguage = headersList.get('accept-language');
  const browserLang = parseBrowserLang(acceptLanguage);

  // Language selection priority: 1) valid ?lang= param, 2) browser lang, 3) default
  let activeLangCode: string;
  if (langParam && availableCodes.has(langParam)) {
    activeLangCode = langParam;
  } else if (browserLang && availableCodes.has(browserLang)) {
    activeLangCode = browserLang;
  } else {
    activeLangCode = defaultLang?.code ?? 'en';
  }

  const activeTranslation =
    product.translations.find((t) => t.language.code === activeLangCode) ??
    product.translations.find((t) => t.language.isDefault) ??
    product.translations[0];

  if (!activeTranslation) {
    notFound();
  }

  const images = product.images.map((img) => ({
    id: img.id,
    url: img.url,
    alt: img.alt,
    isPrimary: img.isPrimary,
  }));

  return (
    <div className="min-h-screen bg-slate-100 py-8 px-4">
      <div className="max-w-[600px] mx-auto">
        {/* Language Switcher */}
        {availableLanguages.length > 1 && (
          <div className="mb-4 flex justify-end">
            <LanguageSwitcher
              languages={availableLanguages}
              currentLang={activeLangCode}
              slug={slug}
            />
          </div>
        )}

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-md overflow-hidden">
          {/* Hero */}
          <div className="px-6 pt-8 pb-6 border-b border-slate-100">
            <h1 className="text-3xl font-bold text-slate-900 leading-tight">
              {activeTranslation.title}
            </h1>
          </div>

          {/* Image Gallery */}
          {images.length > 0 && (
            <div className="px-6 py-5 border-b border-slate-100">
              <ImageGallery images={images} />
            </div>
          )}

          {/* Description */}
          {activeTranslation.description && (
            <div className="px-6 py-6">
              <p className="text-slate-700 text-base leading-relaxed whitespace-pre-line">
                {activeTranslation.description}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-slate-400 text-xs mt-6">
          Powered by{' '}
          <span className="font-semibold text-slate-500">ProductQR</span>
        </p>
      </div>
    </div>
  );
}
