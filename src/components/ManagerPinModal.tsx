import React, { useState } from 'react';
import { Lock, Delete, X } from 'lucide-react';

interface ManagerPinModalProps {
  correctPin: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export const ManagerPinModal: React.FC<ManagerPinModalProps> = ({
  correctPin,
  onSuccess,
  onCancel,
}) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  const handleDigit = (digit: string) => {
    if (pin.length < 6) {
      const newPin = pin + digit;
      setPin(newPin);
      setError(false);

      if (newPin === correctPin) {
        setTimeout(() => onSuccess(), 150);
      } else if (newPin.length === correctPin.length) {
        setError(true);
      }
    }
  };

  const handleDelete = () => {
    setPin((prev: string) => prev.slice(0, -1));
    setError(false);
  };

  const handleClear = () => {
    setPin('');
    setError(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full max-w-sm rounded-3xl p-6 border shadow-2xl relative"
        style={{
          backgroundColor: 'var(--color-card)',
          borderColor: 'var(--color-border)',
          color: 'var(--color-text)',
        }}
      >
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5 opacity-70" />
        </button>

        <div className="text-center space-y-2">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-500/15 text-amber-700 flex items-center justify-center">
            <Lock className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-black tracking-tight">Accès Espace Gérant</h3>
          <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
            Seul le gérant peut consulter les chiffres de recette, gérer les stocks et modifier les vues.
          </p>
        </div>

        {/* PIN Indicators */}
        <div className="flex justify-center items-center gap-3 my-6">
          {Array.from({ length: correctPin.length }).map((_, i) => (
            <div
              key={i}
              className={`w-4 h-4 rounded-full border-2 transition-all ${
                i < pin.length
                  ? error
                    ? 'bg-red-500 border-red-500 scale-110'
                    : 'bg-amber-600 border-amber-600 scale-110'
                  : 'border-zinc-400/40 bg-transparent'
              }`}
            />
          ))}
        </div>

        {error && (
          <p className="text-center text-xs font-bold text-red-600 animate-shake mb-4">
            Code PIN incorrect. Veuillez réessayer.
          </p>
        )}

        {/* Clavier numérique tactile pour smartphone */}
        <div className="grid grid-cols-3 gap-2.5 max-w-xs mx-auto">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              type="button"
              onClick={() => handleDigit(digit)}
              className="h-13 rounded-2xl border font-bold text-lg hover:bg-black/5 dark:hover:bg-white/10 active:scale-95 transition-all cursor-pointer flex items-center justify-center shadow-xs"
              style={{
                borderColor: 'var(--color-border)',
                backgroundColor: 'rgba(var(--color-card), 0.7)',
              }}
            >
              {digit}
            </button>
          ))}
          <button
            type="button"
            onClick={handleClear}
            className="h-13 rounded-2xl border text-xs font-bold text-zinc-500 hover:bg-black/5 active:scale-95 transition-all cursor-pointer flex items-center justify-center"
            style={{ borderColor: 'var(--color-border)' }}
          >
            Effacer
          </button>
          <button
            type="button"
            onClick={() => handleDigit('0')}
            className="h-13 rounded-2xl border font-bold text-lg hover:bg-black/5 dark:hover:bg-white/10 active:scale-95 transition-all cursor-pointer flex items-center justify-center shadow-xs"
            style={{
              borderColor: 'var(--color-border)',
              backgroundColor: 'rgba(var(--color-card), 0.7)',
            }}
          >
            0
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="h-13 rounded-2xl border text-zinc-600 dark:text-zinc-300 hover:bg-black/5 active:scale-95 transition-all cursor-pointer flex items-center justify-center"
            style={{ borderColor: 'var(--color-border)' }}
          >
            <Delete className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-5 text-center">
          <span className="text-[11px] text-zinc-500 font-medium">
            Code usine initial : <strong className="font-mono text-amber-700">1234</strong>
          </span>
        </div>
      </div>
    </div>
  );
};
