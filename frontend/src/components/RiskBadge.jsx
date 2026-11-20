import React from 'react';
import { ShieldCheck, AlertTriangle, AlertOctagon, Info } from 'lucide-react';

export default function RiskBadge({ level = 'SAFE', score = null, size = 'md' }) {
  const normLevel = (level || 'SAFE').toUpperCase();

  const configs = {
    SAFE: {
      bg: 'bg-[#67C99A]/10 border-[#67C99A]/30 text-[#67C99A]',
      icon: ShieldCheck,
      label: 'Low Risk / Safe',
    },
    LOW: {
      bg: 'bg-[#67C99A]/10 border-[#67C99A]/30 text-[#67C99A]',
      icon: ShieldCheck,
      label: 'Low Risk',
    },
    MEDIUM: {
      bg: 'bg-[#E9B96A]/10 border-[#E9B96A]/30 text-[#E9B96A]',
      icon: AlertTriangle,
      label: 'Medium Risk',
    },
    HIGH: {
      bg: 'bg-[#E87575]/10 border-[#E87575]/30 text-[#E87575]',
      icon: AlertOctagon,
      label: 'High Risk',
    },
    CRITICAL: {
      bg: 'bg-[#E87575]/20 border-[#E87575]/50 text-[#E87575]',
      icon: AlertOctagon,
      label: 'Critical Risk',
    },
    INFORMATIONAL: {
      bg: 'bg-[#79B8FF]/10 border-[#79B8FF]/30 text-[#79B8FF]',
      icon: Info,
      label: 'Informational',
    },
  };

  const config = configs[normLevel] || configs.SAFE;
  const Icon = config.icon;

  const sizeStyles = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-sm px-2.5 py-1 gap-1.5',
    lg: 'text-base px-3.5 py-1.5 gap-2 font-medium',
  };

  return (
    <span
      className={`inline-flex items-center rounded-md border font-medium select-none ${config.bg} ${
        sizeStyles[size] || sizeStyles.md
      }`}
    >
      <Icon size={size === 'sm' ? 12 : size === 'lg' ? 18 : 14} />
      <span>{config.label}</span>
      {score !== null && score !== undefined && (
        <span className="font-mono text-xs opacity-90 pl-0.5">({score}/100)</span>
      )}
    </span>
  );
}
