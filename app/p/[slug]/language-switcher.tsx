'use client';

import { useRouter } from 'next/navigation';

interface Language {
  code: string;
  name: string;
  nativeName: string;
}

interface LanguageSwitcherProps {
  languages: Language[];
  currentLang: string;
  slug: string;
}

export default function LanguageSwitcher({ languages, currentLang, slug }: LanguageSwitcherProps) {
  const router = useRouter();

  if (languages.length <= 1) return null;

  return (
    <div className="flex flex-wrap gap-2 justify-end">
      {languages.map((lang) => {
        const isActive = lang.code === currentLang;
        return (
          <button
            key={lang.code}
            onClick={() => router.push(`/p/${slug}?lang=${lang.code}`)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors duration-150 border ${
              isActive
                ? 'bg-slate-800 text-white border-slate-800'
                : 'bg-white text-slate-600 border-slate-300 hover:border-slate-500 hover:text-slate-800'
            }`}
            aria-current={isActive ? 'true' : undefined}
          >
            {lang.nativeName}
          </button>
        );
      })}
    </div>
  );
}
