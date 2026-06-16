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

export default function LanguageSwitcher({
  languages,
  currentLang,
  slug,
}: LanguageSwitcherProps) {
  const router = useRouter();

  if (languages.length <= 1) return null;

  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '0.5rem',
        justifyContent: 'flex-end',
      }}
    >
      {languages.map((lang) => {
        const isActive = lang.code === currentLang;
        return (
          <button
            key={lang.code}
            onClick={() => router.push(`/p/${slug}?lang=${lang.code}`)}
            aria-current={isActive ? 'true' : undefined}
            style={{
              padding: '0.4rem 1rem',
              borderRadius: 9999,
              border: `1px solid ${isActive ? '#c9a84c' : 'rgba(201,168,76,0.4)'}`,
              background: isActive ? '#c9a84c' : 'rgba(13,13,20,0.75)',
              color: isActive ? '#0d0d14' : '#c9a84c',
              fontWeight: isActive ? 700 : 400,
              fontSize: '0.8125rem',
              cursor: 'pointer',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              fontFamily: 'system-ui, -apple-system, sans-serif',
              letterSpacing: '0.05em',
              transition: 'all 0.2s',
              boxShadow: isActive
                ? '0 0 16px rgba(201,168,76,0.35)'
                : '0 2px 12px rgba(0,0,0,0.4)',
            }}
          >
            {lang.nativeName}
          </button>
        );
      })}
    </div>
  );
}
