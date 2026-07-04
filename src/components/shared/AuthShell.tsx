import Link from 'next/link';

interface AuthShellProps {
  children: React.ReactNode;
  headline: string;
  subheadline: string;
}

export default function AuthShell({ children, headline, subheadline }: AuthShellProps) {
  return (
    <div className="min-h-screen flex">
      {/* Panel Kiri — dekoratif, hidden di mobile */}
      <div className="hidden lg:flex lg:w-1/2 bg-brand-blue-dark relative overflow-hidden flex-col justify-between p-12">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-blue-dark via-brand-blue-dark to-brand-blue/40" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-brand-orange/20 rounded-full blur-3xl" />
        <div className="absolute top-1/4 -right-20 w-72 h-72 bg-brand-blue-light/10 rounded-full blur-3xl" />

        <Link href="/" className="relative z-10 text-xl font-bold text-white">
          SelasarBahasa
        </Link>

        <div className="relative z-10">
          <h1 className="text-4xl xl:text-5xl font-extrabold text-white leading-tight mb-4 tracking-tight">
            {headline}
          </h1>
          <p className="text-white/70 text-lg font-medium max-w-md">{subheadline}</p>
        </div>

        <p className="relative z-10 text-white/40 text-sm">© {new Date().getFullYear()} SelasarBahasa</p>
      </div>

      {/* Panel Kanan — form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-white relative">
        {/* Logo mobile only, karena panel kiri hidden di mobile */}
        <Link href="/" className="lg:hidden absolute top-6 left-6 text-lg font-bold text-brand-blue-dark">
          SelasarBahasa
        </Link>
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}
