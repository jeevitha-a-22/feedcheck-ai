import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, PlusCircle, History, BarChart3, HelpCircle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const BottomNav = () => {
  const { t } = useLanguage();

  const tabs = [
    { to: '/', label: t('nav.home', 'Home'), icon: Home },
    { to: '/new-test', label: t('nav.new_test', 'New Test'), icon: PlusCircle, isPrimary: true },
    { to: '/history', label: t('nav.history', 'History'), icon: History },
    { to: '/summary', label: t('nav.summary', 'Summary'), icon: BarChart3 }
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-slate-200/90 px-3 py-2 shadow-2xl safe-area-pb">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {tabs.map(({ to, label, icon: Icon, isPrimary }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all relative ${
                isPrimary
                  ? 'text-brand-700 font-bold'
                  : isActive
                  ? 'text-brand-700 font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isPrimary ? (
                  <div className="w-11 h-11 -mt-5 rounded-full bg-gradient-to-tr from-brand-600 to-brand-500 text-white flex items-center justify-center shadow-lg shadow-brand-600/35 border-2 border-white transition-transform active:scale-95">
                    <Icon className="w-6 h-6" />
                  </div>
                ) : (
                  <Icon className={`w-5 h-5 mb-0.5 transition-colors ${isActive ? 'text-brand-600' : 'text-slate-400'}`} />
                )}
                <span className={`text-[11px] tracking-tight ${isActive ? 'font-extrabold text-brand-700' : 'font-medium'}`}>
                  {label}
                </span>
                {isActive && !isPrimary && (
                  <span className="w-1.5 h-1.5 bg-brand-600 rounded-full mt-0.5 animate-pulse" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default BottomNav;
