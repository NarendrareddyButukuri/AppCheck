import React from 'react';
import { ShieldCheck } from 'lucide-react';

export default function BrandLogo({ size = 'md', showTagline = false }) {
  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  const iconSizes = {
    sm: 20,
    md: 24,
    lg: 32,
  };

  return (
    <div className="flex items-center gap-3 select-none">
      <div className="relative flex items-center justify-center p-2 rounded-xl bg-gradient-to-br from-[#79B8FF]/20 to-[#171F2B] border border-[#79B8FF]/30 shadow-sm shadow-[#79B8FF]/10">
        <ShieldCheck size={iconSizes[size] || 24} className="text-[#79B8FF]" />
        <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-[#79B8FF]/20 pointer-events-none" />
      </div>
      <div>
        <div className="flex items-center gap-1.5 font-bold tracking-tight text-[#F5F7FA]">
          <span className={sizeClasses[size] || 'text-xl'}>AppCheck</span>
          <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-[#79B8FF]/15 text-[#79B8FF] font-semibold border border-[#79B8FF]/30">
            SEC
          </span>
        </div>
        {showTagline && (
          <p className="text-xs text-[#A1ACBA] font-normal tracking-normal">
            Know what an app can access.
          </p>
        )}
      </div>
    </div>
  );
}
