import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">RB</span>
              </div>
              <span className="font-bold text-lg text-white">
                Research<span className="text-emerald-400">Bridge</span>
              </span>
            </div>
            <p className="text-sm leading-relaxed">
              Connecting Industry, Academia, Government & Society for a stronger Bangladesh research ecosystem.
            </p>
          </div>

          <div>
            <h3 className="text-white font-semibold text-sm mb-3">Platform</h3>
            <ul className="space-y-2">
              <li><Link href="/problems" className="text-sm hover:text-emerald-400 transition-colors">Problems</Link></li>
              <li><Link href="/talent" className="text-sm hover:text-emerald-400 transition-colors">Talent Pool</Link></li>
              <li><Link href="/jobs" className="text-sm hover:text-emerald-400 transition-colors">Jobs & Internships</Link></li>
              <li><Link href="/collaboration" className="text-sm hover:text-emerald-400 transition-colors">Collaboration Board</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold text-sm mb-3">For You</h3>
            <ul className="space-y-2">
              <li><Link href="/register" className="text-sm hover:text-emerald-400 transition-colors">Students</Link></li>
              <li><Link href="/register" className="text-sm hover:text-emerald-400 transition-colors">Researchers</Link></li>
              <li><Link href="/register" className="text-sm hover:text-emerald-400 transition-colors">Industry</Link></li>
              <li><Link href="/register" className="text-sm hover:text-emerald-400 transition-colors">Government</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold text-sm mb-3">Support</h3>
            <ul className="space-y-2">
              <li><Link href="#" className="text-sm hover:text-emerald-400 transition-colors">About Us</Link></li>
              <li><Link href="#" className="text-sm hover:text-emerald-400 transition-colors">Contact</Link></li>
              <li><Link href="#" className="text-sm hover:text-emerald-400 transition-colors">Privacy Policy</Link></li>
              <li><Link href="#" className="text-sm hover:text-emerald-400 transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs">
            &copy; {new Date().getFullYear()} ResearchBridge BD. A Daffodil International University initiative.
          </p>
          <p className="text-xs">
            Built for Bangladesh&apos;s research ecosystem.
          </p>
        </div>
      </div>
    </footer>
  );
}
