import React from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { Sparkles, PlusCircle, History, BarChart3, Home, ShieldCheck, HelpCircle } from 'lucide-react';
import Button from './Button';
import LanguageSelector from './LanguageSelector';
import { useLanguage } from '../context/LanguageContext';

export const Navbar = () => {
  const location = useLocation();
  const { t } = useLanguage();

  const navLinks = [
    { to: '/', label: t('nav.home', 'Home'), icon: Home },
    { to: '/new-test', label: t('nav.new_test', 'New Test'), icon: PlusCircle },
    { to: '/history', label: t('nav.history', 'History'), icon: History },
    { to: '/summary', label: t('nav.summary', 'Summary'), icon: BarChart3 },
    { to: '/how-it-works', label: t('nav.how_it_works', 'How It Works'), icon: HelpCircle }
  ];

  return (
    <header className="sticky top-0 z-40 w-full glass-header">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white shadow-md shadow-brand-600/20 group-hover:scale-105 transition-transform">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-slate-900 text-lg tracking-tight font-sans">FeedCheck</span>
              <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-brand-100 text-brand-800 tracking-wide uppercase">AI</span>
            </div>
            <p className="text-[10px] text-slate-500 font-medium leading-none">{t('nav.silage_quality_screening', 'Silage Quality Screening')}</p>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200/60">
          {navLinks.map(({ to, label, icon: Icon }) => {
            const isActive = location.pathname === to;
            return (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-white text-brand-700 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                  }`
                }
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-brand-600' : 'text-slate-400'}`} />
                <span>{label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Quick Action CTA & Language Selector */}
        <div className="flex items-center gap-2 sm:gap-3">
          <LanguageSelector />
          <Link to="/new-test">
            <Button size="sm" icon={PlusCircle} variant="primary" className="hidden sm:inline-flex text-xs">
              {t('nav.new_test', 'New Test')}
            </Button>
          </Link>
          <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 font-bold text-xs">
            AG
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;

