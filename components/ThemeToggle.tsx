'use client';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

interface Props { className?: string; }

export default function ThemeToggle({ className = '' }: Props) {
  const { theme, toggleTheme } = useTheme();
  return (
    <button
      onClick={toggleTheme}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${className}`}
      style={{
        background: theme === 'dark'
          ? 'rgba(253,246,227,0.1)'
          : 'rgba(196,134,10,0.12)',
        border: '1px solid var(--border-card)',
        color: 'var(--gold)',
        minHeight: '40px',
      }}
      title={theme === 'dark' ? 'Chuyển sang chế độ sáng' : 'Chuyển sang chế độ tối'}
    >
      {theme === 'dark'
        ? <Sun size={16} className="text-amber-300" />
        : <Moon size={16} className="text-amber-600" />
      }
      <span className="text-xs font-cinzel" style={{color:'var(--gold)'}}>
        {theme === 'dark' ? 'Sáng' : 'Tối'}
      </span>
    </button>
  );
}
