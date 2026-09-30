import React, { useState, useEffect } from 'react';
import { Lock, Delete, Eye, EyeOff, ShieldCheck, KeyRound } from 'lucide-react';
import { verifyPasscode } from '../utils/storage';

export default function PasscodeModal({ onAuthenticate }) {
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState(false);
  const [showPasscode, setShowPasscode] = useState(false);

  const handleKeyPress = (num) => {
    if (passcode.length < 10) {
      setError(false);
      const newCode = passcode + num;
      setPasscode(newCode);
      if (newCode === 'uy520') {
        onAuthenticate();
      }
    }
  };

  const handleDelete = () => {
    setError(false);
    setPasscode((prev) => prev.slice(0, -1));
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (verifyPasscode(passcode)) {
      onAuthenticate();
    } else {
      setError(true);
    }
  };

  // Allow native keyboard typing for desktop compatibility
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Enter') {
        handleSubmit();
      } else if (e.key === 'Backspace') {
        handleDelete();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [passcode]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0d0f12]/95 backdrop-blur-md p-4">
      <div className="w-full max-w-sm bg-[#161920] border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col items-center">
        {/* Header Icon */}
        <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4 shadow-inner">
          <ShieldCheck className="w-8 h-8" />
        </div>

        <h2 className="text-2xl font-bold text-white tracking-tight">Welcome Back</h2>
        <p className="text-xs text-slate-400 mt-1 mb-6 text-center">
          Enter passcode <span className="font-mono text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded">uy520</span> to unlock
        </p>

        {/* Input box */}
        <form onSubmit={handleSubmit} className="w-full mb-6">
          <div className="relative flex items-center">
            <KeyRound className="absolute left-3.5 text-slate-400 w-5 h-5" />
            <input
              type={showPasscode ? 'text' : 'password'}
              value={passcode}
              onChange={(e) => {
                setError(false);
                setPasscode(e.target.value);
                if (e.target.value === 'uy520') {
                  onAuthenticate();
                }
              }}
              placeholder="Enter passcode..."
              className={`w-full bg-[#0f1117] border ${
                error ? 'border-rose-500 ring-1 ring-rose-500' : 'border-slate-800 focus:border-indigo-500'
              } text-white font-mono text-center tracking-widest text-lg rounded-xl py-3 pl-10 pr-10 focus:outline-none transition-all`}
              autoFocus
            />
            <button
              type="button"
              onClick={() => setShowPasscode(!showPasscode)}
              className="absolute right-3.5 text-slate-400 hover:text-slate-200 transition"
            >
              {showPasscode ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {error && (
            <p className="text-xs text-rose-400 mt-2 text-center font-medium animate-bounce">
              Incorrect passcode. Hint: uy520
            </p>
          )}
        </form>

        {/* On-screen Keypad for Mobile / Quick touch */}
        <div className="w-full grid grid-cols-3 gap-2.5 mb-2">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => handleKeyPress(key)}
              className="h-12 rounded-xl bg-[#1f2430] hover:bg-[#282f3f] active:bg-indigo-600/30 text-white font-semibold text-lg border border-slate-800/80 transition-all flex items-center justify-center shadow-sm"
            >
              {key}
            </button>
          ))}
          <button
            type="button"
            onClick={() => handleKeyPress('u')}
            className="h-12 rounded-xl bg-[#1f2430] hover:bg-[#282f3f] text-indigo-300 font-semibold text-base border border-slate-800/80 transition-all flex items-center justify-center"
          >
            u
          </button>
          <button
            type="button"
            onClick={() => handleKeyPress('y')}
            className="h-12 rounded-xl bg-[#1f2430] hover:bg-[#282f3f] text-indigo-300 font-semibold text-base border border-slate-800/80 transition-all flex items-center justify-center"
          >
            y
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="h-12 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-semibold border border-rose-500/20 transition-all flex items-center justify-center"
          >
            <Delete className="w-5 h-5" />
          </button>
        </div>

        {/* Action Button */}
        <button
          onClick={handleSubmit}
          className="w-full mt-2 py-3 px-4 bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] text-white font-semibold rounded-xl shadow-lg shadow-indigo-600/25 transition-all flex items-center justify-center gap-2"
        >
          <Lock className="w-4 h-4" /> Unlock App
        </button>
      </div>
    </div>
  );
}
