import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-md max-w-md w-full px-8 py-12 text-center">
        {/* Logo / Brand */}
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-slate-800 text-white mb-6">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-7 h-7"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6.75 6.75h.75v.75h-.75v-.75zM6.75 16.5h.75v.75h-.75v-.75zM16.5 6.75h.75v.75h-.75v-.75zM13.5 13.5h.75v.75h-.75v-.75zM13.5 19.5h.75v.75h-.75v-.75zM19.5 13.5h.75v.75h-.75v-.75zM19.5 19.5h.75v.75h-.75v-.75zM16.5 16.5h.75v.75h-.75v-.75z"
            />
          </svg>
        </div>

        <h1 className="text-3xl font-bold text-slate-900 mb-2">Welcome to ProductQR</h1>
        <p className="text-slate-500 text-base mb-8 leading-relaxed">
          Manage your multilingual product pages and generate QR codes instantly.
        </p>

        <div className="flex flex-col gap-3">
          <Link
            href="/admin"
            className="w-full inline-flex items-center justify-center px-6 py-3 rounded-xl bg-slate-800 text-white font-semibold hover:bg-slate-700 transition-colors duration-150"
          >
            Go to Admin Panel
          </Link>
          <Link
            href="/p/sample-product"
            className="w-full inline-flex items-center justify-center px-6 py-3 rounded-xl border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 hover:border-slate-400 transition-colors duration-150"
          >
            View Sample Product
          </Link>
        </div>
      </div>
    </div>
  );
}
