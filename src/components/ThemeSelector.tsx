import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import type { ThemeType } from '../types';
import { Palette, Check } from 'lucide-react';

interface ThemeInfo {
  id: ThemeType;
  name: string;
  tagline: string;
  previewColors: string[];
}

const THEMES: ThemeInfo[] = [
  {
    id: 'artisan',
    name: 'Artisan & Gourmand',
    tagline: 'Terracotta, crème farine & sauge (Chaleureux & traditionnel)',
    previewColors: ['#C86D3B', '#FDFBF7', '#5B8266', '#2C1810'],
  },
  {
    id: 'bistro',
    name: 'Bistro Chic & Urbain',
    tagline: 'Ardoise sombre, bois ambré & or doux (Moderne & fort contraste)',
    previewColors: ['#1E232A', '#8D5B4C', '#E5A93C', '#F3F4F6'],
  },
  {
    id: 'nature',
    name: 'Fresh & Nature',
    tagline: 'Vert végétal, lin naturel & blanc (Fraîcheur & crudités)',
    previewColors: ['#2D6A4F', '#F8FAF7', '#E76F51', '#1B2B21'],
  },
  {
    id: 'express',
    name: 'Street Food Express',
    tagline: 'Rouge appétit, jaune moutarde & noir (Énergique & rapide)',
    previewColors: ['#D90429', '#FAFAFA', '#FFB703', '#1B1E23'],
  },
];

export const ThemeSelector: React.FC = () => {
  const { activeTheme, setTheme } = useStore();
  const [isOpen, setIsOpen] = useState(false);

  const current = THEMES.find((t) => t.id === activeTheme) || THEMES[0];

  return (
    <div className="relative inline-block text-left">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors shadow-sm cursor-pointer"
        style={{
          backgroundColor: 'var(--color-card)',
          borderColor: 'var(--color-border)',
          color: 'var(--color-text)',
        }}
        title="Changer le thème visuel pour présenter au gérant"
      >
        <Palette className="w-4 h-4 text-amber-600" />
        <span className="hidden sm:inline">Thème :</span>
        <span className="font-bold">{current.name}</span>
        <div className="flex gap-1 ml-1">
          {current.previewColors.slice(0, 3).map((col, idx) => (
            <span
              key={idx}
              className="w-2.5 h-2.5 rounded-full border border-black/10 inline-block"
              style={{ backgroundColor: col }}
            />
          ))}
        </div>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div
            className="absolute right-0 mt-2 w-72 rounded-2xl shadow-xl z-50 p-2 border"
            style={{
              backgroundColor: 'var(--color-card)',
              borderColor: 'var(--color-border)',
              color: 'var(--color-text)',
            }}
          >
            <div className="px-3 py-2 border-b text-xs font-semibold uppercase tracking-wider" style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }}>
              Palette visuelle (4 Univers)
            </div>
            <div className="space-y-1 mt-1">
              {THEMES.map((theme) => {
                const isSelected = activeTheme === theme.id;
                return (
                  <button
                    key={theme.id}
                    onClick={() => {
                      setTheme(theme.id);
                      setIsOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2.5 rounded-xl transition-all flex items-center justify-between text-sm cursor-pointer ${
                      isSelected ? 'ring-2 ring-amber-500/50 font-bold' : 'hover:bg-black/5 dark:hover:bg-white/5'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span>{theme.name}</span>
                        {isSelected && <Check className="w-4 h-4 text-emerald-600" />}
                      </div>
                      <div className="text-[11px] font-normal leading-tight mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                        {theme.tagline}
                      </div>
                    </div>
                    <div className="flex gap-1 ml-2 shrink-0">
                      {theme.previewColors.map((col, idx) => (
                        <span
                          key={idx}
                          className="w-3 h-3 rounded-full border border-black/10 shadow-xs"
                          style={{ backgroundColor: col }}
                        />
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
