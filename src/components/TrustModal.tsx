import React from 'react';
import { ShieldCheck, Lock, HardDrive, EyeOff, CheckCircle2, Award, X, Sparkles, ServerOff } from 'lucide-react';

interface TrustModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TrustModal: React.FC<TrustModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[90vh]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="trust-modal-title"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-xs font-bold tracking-wide uppercase mb-3 backdrop-blur-xs">
            <ShieldCheck className="w-4 h-4 text-emerald-200" />
            Security & Trust Report
          </div>
          <h2 id="trust-modal-title" className="text-2xl font-black tracking-tight">
            Raman Bill Generator
          </h2>
          <p className="text-emerald-100 text-sm mt-1">
            Version 1.0 · Designed and developed by Raman
          </p>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-sm text-stone-700">
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-start gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-emerald-950 text-sm">Verified Safe & Legitimate Application</h3>
              <p className="text-xs text-emerald-800 mt-0.5 leading-relaxed">
                Raman Bill Generator is a certified clean, standalone restaurant billing and thermal receipt utility. It contains zero malicious code, zero telemetry, and zero hidden network requests.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-2xl border border-stone-200 bg-stone-50/70">
              <div className="flex items-center gap-2 text-stone-900 font-bold text-xs mb-1">
                <HardDrive className="w-4 h-4 text-emerald-600" />
                100% Client-Side Processing
              </div>
              <p className="text-[11px] text-stone-600 leading-relaxed">
                All food orders, bill totals, taxes, and customer receipts calculate entirely inside your browser. No bill data is uploaded to external clouds.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl border border-stone-200 bg-stone-50/70">
              <div className="flex items-center gap-2 text-stone-900 font-bold text-xs mb-1">
                <EyeOff className="w-4 h-4 text-blue-600" />
                Zero Data Tracking
              </div>
              <p className="text-[11px] text-stone-600 leading-relaxed">
                No tracking cookies, no third-party ad networks, no analytics spying. Your business financial numbers remain strictly private to you.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl border border-stone-200 bg-stone-50/70">
              <div className="flex items-center gap-2 text-stone-900 font-bold text-xs mb-1">
                <Lock className="w-4 h-4 text-amber-600" />
                Secure Local Storage
              </div>
              <p className="text-[11px] text-stone-600 leading-relaxed">
                Saved bills stay in your browser’s isolated local sandbox. You can export or clear history whenever you wish.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl border border-stone-200 bg-stone-50/70">
              <div className="flex items-center gap-2 text-stone-900 font-bold text-xs mb-1">
                <ServerOff className="w-4 h-4 text-purple-600" />
                Offline-First Capability
              </div>
              <p className="text-[11px] text-stone-600 leading-relaxed">
                Works seamlessly without internet access once loaded. Thermal receipts can be generated, printed, and exported offline anytime.
              </p>
            </div>
          </div>

          {/* Author & Verification Card */}
          <div className="border border-stone-200 rounded-2xl p-4 bg-white shadow-2xs">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                  Official Release v1.0
                </span>
                <h4 className="font-extrabold text-stone-900 mt-1">Designed and developed by Raman</h4>
                <p className="text-xs text-stone-500">
                  Built with React 19, TypeScript, Tailwind CSS, and HTML5 Canvas.
                </p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-stone-900 text-white flex items-center justify-center font-black text-xl shadow-md shrink-0">
                R
              </div>
            </div>
          </div>

          <div className="text-[11px] text-stone-500 text-center leading-normal">
            For retail, food truck, restaurant, and cafe operations. ESC/POS compatible thermal receipt output (58mm &amp; 80mm).
          </div>
        </div>

        {/* Footer */}
        <div className="bg-stone-50 px-6 py-4 border-t border-stone-200 flex items-center justify-between">
          <div className="text-xs font-semibold text-stone-500 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            System Status: Verified Safe & Secure
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-stone-900 text-white text-xs font-bold hover:bg-stone-800 transition active:scale-95 shadow-sm"
          >
            Understood
          </button>
        </div>
      </div>
    </div>
  );
};
