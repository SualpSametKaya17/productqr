'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

const navLinks = [
  { href: '/admin', label: 'Dashboard', emoji: '📊' },
  { href: '/admin/products', label: 'Ürünler', emoji: '📦' },
  { href: '/admin/languages', label: 'Diller', emoji: '🌐' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isActive = (href: string) =>
    href === '/admin' ? pathname === '/admin' : pathname.startsWith(href);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f1f5f9', color: '#0f172a' }}>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 20,
            background: 'rgba(0,0,0,0.5)',
            display: 'block',
          }}
          className="lg:hidden"
        />
      )}

      {/* ── Sidebar ── */}
      <aside style={{
        position: 'fixed',
        top: 0, left: 0, bottom: 0,
        width: 240,
        background: '#1e293b',
        color: '#f8fafc',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 30,
        transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.2s ease',
      }}
        className="lg:translate-x-0 lg:relative lg:flex"
      >
        {/* Brand */}
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid #334155',
          display: 'flex', alignItems: 'center', gap: '0.6rem',
        }}>
          <span style={{ fontSize: '1.4rem' }}>🔲</span>
          <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#f8fafc', letterSpacing: '0.02em' }}>
            ProductQR Admin
          </span>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: '0.75rem' }}>
          {navLinks.map(link => {
            const active = isActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setSidebarOpen(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.6rem 0.75rem',
                  borderRadius: 8,
                  marginBottom: 2,
                  background: active ? '#334155' : 'transparent',
                  color: active ? '#f8fafc' : '#94a3b8',
                  fontWeight: active ? 600 : 400,
                  fontSize: '0.9rem',
                  textDecoration: 'none',
                  transition: 'all 0.15s',
                }}
              >
                <span style={{ fontSize: '1rem' }}>{link.emoji}</span>
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid #334155' }}>
          <p style={{ fontSize: '0.75rem', color: '#475569', margin: 0 }}>ProductQR v1.0</p>
        </div>
      </aside>

      {/* ── Main content ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}
        className="lg:ml-60"
      >
        {/* Mobile topbar */}
        <header
          className="lg:hidden"
          style={{
            background: '#1e293b',
            color: '#f8fafc',
            padding: '0.75rem 1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
          }}
        >
          <button
            onClick={() => setSidebarOpen(true)}
            style={{
              background: 'none', border: 'none',
              color: '#f8fafc', cursor: 'pointer', padding: 4,
            }}
            aria-label="Menüyü aç"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>ProductQR Admin</span>
        </header>

        {/* Page content */}
        <main style={{ flex: 1, padding: '1.5rem', overflowAuto: 'auto' } as React.CSSProperties}>
          {children}
        </main>
      </div>
    </div>
  );
}
